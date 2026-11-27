import { generateStructuredJson } from "./aiJson.service.js";
import { roadmapInstructions } from "../prompts/roadmap.prompt.js";
import {
  roadmapJsonSchema,
  roadmapZodSchema
} from "../utils/roadmapSchema.js";
import { getClientById } from "../store/clientStore.js";
import {
  saveRoadmap,
  getRoadmapByClientId
} from "../store/roadmapStore.js";
import { clientSchema } from "../utils/clientValidation.js";
import {
  hasProfessionalReviewRequirement,
  getProfessionalReviewReason
} from "../utils/reviewRequirements.js";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const validateRoadmapStructure = (roadmap, client) => {
  const phases = roadmap.yearlyRoadmap.phases;
  const months = phases.flatMap((phase) => phase.months);
  const allGoals = [
    client.primary_goal_1,
    client.primary_goal_2,
    client.secondary_goal_1,
    client.secondary_goal_2
  ];

  if (roadmap.yearlyRoadmap.year !== 2027 || phases.length !== 4) {
    throw new Error("AI roadmap must cover 2027 in exactly four phases.");
  }

  const monthNumbers = months.map((item) => item.month);
  if (
    months.length !== 12 ||
    monthNumbers.some((month) =>
      !Number.isInteger(month) || month < 1 || month > 12
    ) ||
    new Set(monthNumbers).size !== 12
  ) {
    throw new Error(
      "AI roadmap must contain each month number from 1 to 12 exactly once."
    );
  }

  for (const phase of phases) {
    phase.months.sort((first, second) => first.month - second.month);
  }
  phases.sort((first, second) =>
    first.months[0].month - second.months[0].month
  );

  for (const [phaseIndex, phase] of phases.entries()) {
    const expectedMonths = [1, 2, 3].map((month) =>
      phaseIndex * 3 + month
    );
    if (phase.months.some((item, index) =>
      item.month !== expectedMonths[index]
    )) {
      throw new Error(
        `Roadmap phase ${phaseIndex + 1} must contain months ${expectedMonths.join(", ")}.`
      );
    }
  }

  phases.forEach((phase) => {
    phase.months.forEach((month) => {
      month.monthName = monthNames[month.month - 1];
    });
  });

  for (const month of months) {
    if (!allGoals.slice(0, 2).includes(month.relatedPrimaryGoal)) {
      throw new Error(`Month ${month.month} must reference one of the client's primary goals.`);
    }
    if (!allGoals.slice(2).includes(month.relatedSecondaryGoal)) {
      throw new Error(`Month ${month.month} must reference one of the client's secondary goals.`);
    }
  }

  const primaryAssignments = months.map((item) => item.relatedPrimaryGoal);
  const secondaryAssignments = months.map((item) => item.relatedSecondaryGoal);
  if (allGoals.slice(0, 2).some((goal) =>
    primaryAssignments.filter((assigned) => assigned === goal).length < 3
  )) {
    throw new Error("Each primary goal must guide at least three roadmap months.");
  }
  if (allGoals.slice(2).some((goal) =>
    secondaryAssignments.filter((assigned) => assigned === goal).length < 2
  )) {
    throw new Error("Each secondary goal must guide at least two roadmap months.");
  }
};

const getAgeGroup = (age) => {
  if (Number.isFinite(Number(age)) && Number(age) < 18) {
    return "under_18";
  }
  return "adult";
};
export const generateYearlyRoadmap = async (clientId) => {
  const client = getClientById(clientId);

  if (!client) {
    throw new Error("Client not found. Upload the Excel file first.");
  }
  const validationResult = clientSchema.safeParse(client);

  if (!validationResult.success) {
    const validationMessages = validationResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Client validation failed: ${validationMessages}`);
  }
  if (client.legacyGoalMigrationRequired || [
    client.primary_goal_1,
    client.primary_goal_2,
    client.secondary_goal_1,
    client.secondary_goal_2
  ].some((goal) => !goal || goal.trim().toLowerCase() === "not specified")) {
    throw new Error(
      "Complete all four goals in the current Excel template before generating a roadmap."
    );
  }

  const safeInput = {
    year: 2027,
    ageGroup: getAgeGroup(client.age),
    primaryGoal1: client.primary_goal_1,
    primaryGoal2: client.primary_goal_2,
    secondaryGoal1: client.secondary_goal_1,
    secondaryGoal2: client.secondary_goal_2,
    activityPreference: client.activity_level || "Not specified",
    learningAndRoutinePreferences:
      client.workout_preference || "Not specified",
    availableTime: client.available_workout_time || "Flexible"
  };

  const generated = await generateStructuredJson({
    schemaName: "yearly_transformation_roadmap",
    schema: roadmapJsonSchema,
    instructions: roadmapInstructions,
    input: safeInput
  });

  const validated = roadmapZodSchema.parse(generated);
  validateRoadmapStructure(validated, client);

  const requiresReview = hasProfessionalReviewRequirement(client);
  validated.review.reviewRequired = requiresReview;
  if (requiresReview) {
    validated.review.reviewReason = getProfessionalReviewReason(client);
  }
  const roadmap = {
    clientId: Number(clientId),
    generatedAt: new Date().toISOString(),
    status: "pending_review",
    ...validated
  };
  saveRoadmap(clientId, roadmap);
  return roadmap;
};
export const getGeneratedRoadmap = (clientId) => {
  return getRoadmapByClientId(clientId);
};
