import { generateStructuredJson } from "./aiJson.service.js";
import { monthlyPlanInstructions } from "../prompts/monthlyPlan.prompt.js";
import {
  monthlyPlanJsonSchema,
  monthlyPlanZodSchema
} from "../utils/monthlyPlanSchema.js";

import { getClientById } from "../store/clientStore.js";
import { getRoadmapByClientId } from "../store/roadmapStore.js";
import {
  saveMonthlyPlan,
  getMonthlyPlan
} from "../store/monthlyPlanStore.js";
import {
  getProfessionalReviewReason,
  hasProfessionalReviewRequirement
} from "../utils/reviewRequirements.js";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const isProvidedGoal = (goal) =>
  Boolean(goal && goal.trim() && goal.trim().toLowerCase() !== "not specified");

export const buildMonthlyPlanInput = ({
  client,
  roadmap,
  selectedMonth,
  previousMonthPlan
}) => ({
  year: 2027,
  yearTheme: roadmap.yearlyRoadmap.yearTheme,
  yearlyRoadmap: roadmap.yearlyRoadmap,
  month: selectedMonth.month,
  monthName: selectedMonth.monthName,
  theme: selectedMonth.theme,
  objectives: selectedMonth.objectives,
  relatedPrimaryGoal: selectedMonth.relatedPrimaryGoal,
  relatedSecondaryGoal: selectedMonth.relatedSecondaryGoal,
  habitsFromYearlyRoadmap: selectedMonth.habits,
  expectedOutcomes: selectedMonth.expectedOutcomes,
  yearlyReflectionPrompt: selectedMonth.reflectionPrompt,
  clientGoals: {
    primaryGoal1: client.primary_goal_1,
    primaryGoal2: client.primary_goal_2,
    secondaryGoal1: client.secondary_goal_1,
    secondaryGoal2: client.secondary_goal_2
  },
  clientPlanningPreferences: {
    ageGroup: Number(client.age) < 18 ? "under_18" : "adult",
    activityLevel: client.activity_level,
    activityPreference: client.workout_preference,
    availableTime: client.available_workout_time
  },
  previousMonthContext: previousMonthPlan
    ? {
        planAvailable: true,
        plan: previousMonthPlan,
        completionStatus: "unknown",
        completionInformationAvailable: false
      }
    : selectedMonth.month > 1
      ? {
          planAvailable: false,
          completionStatus: "unknown",
          completionInformationAvailable: false
        }
      : null
});

export const generateMonthlyPlan = async (clientId, month) => {
  const monthNumber = Number(month);

  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error("Month must be a number between 1 and 12.");
  }

  const roadmap = getRoadmapByClientId(clientId);

  if (!roadmap) {
    throw new Error("Generate the yearly roadmap before generating a monthly plan.");
  }

  const client = getClientById(clientId);
  if (!client) {
    throw new Error("Client not found. Upload the Excel file first.");
  }
  if (client.legacyGoalMigrationRequired || [
    client.primary_goal_1,
    client.primary_goal_2,
    client.secondary_goal_1,
    client.secondary_goal_2
  ].some((goal) => !isProvidedGoal(goal))) {
    throw new Error(
      "Complete all four goals in the current Excel template before generating a monthly plan."
    );
  }

  const previousMonthPlan = monthNumber > 1
    ? getMonthlyPlan(clientId, monthNumber - 1)
    : null;

  const selectedMonth = roadmap.yearlyRoadmap.phases
    .flatMap((phase) => phase.months)
    .find((item) => item.month === monthNumber);

  if (!selectedMonth) {
    throw new Error("The selected month was not found in the yearly roadmap.");
  }

  const generated = await generateStructuredJson({
    schemaName: "monthly_transformation_plan",
    schema: monthlyPlanJsonSchema,
    instructions: monthlyPlanInstructions,
    input: buildMonthlyPlanInput({
      client,
      roadmap,
      selectedMonth,
      previousMonthPlan
    })
  });

  const validated = monthlyPlanZodSchema.parse(generated);

  if (validated.month !== monthNumber) {
    throw new Error("AI returned a plan for the wrong month.");
  }
  validated.monthName = monthNames[monthNumber - 1];
  validated.roadmapTheme = selectedMonth.theme;
  validated.roadmapObjectives = selectedMonth.objectives;
  validated.relatedPrimaryGoal = selectedMonth.relatedPrimaryGoal;
  validated.relatedSecondaryGoal = selectedMonth.relatedSecondaryGoal;

  const expectedWeeks = [1, 2, 3, 4];
  const actualWeeks = validated.weeklyPlans
    .map((item) => item.week)
    .sort((a, b) => a - b);

  if (JSON.stringify(actualWeeks) !== JSON.stringify(expectedWeeks)) {
    throw new Error("Monthly plan must contain weeks 1, 2, 3, and 4.");
  }

  const monthlyPlan = {
    clientId: Number(clientId),
    generatedAt: new Date().toISOString(),
    status: "pending_review",
    ...validated,
    coachReviewRequired: true,
    professionalReviewRequired:
      hasProfessionalReviewRequirement(client),
    professionalReviewReason:
      getProfessionalReviewReason(client),
    continuityNote: previousMonthPlan
      ? `${monthNames[monthNumber - 1]} continues the ${monthNames[monthNumber - 2]} roadmap and builds on the previous month's plan. Completion is unknown unless separately recorded.`
      : monthNumber === 1
        ? "January starts the 2027 roadmap; there is no previous monthly plan context."
        : `${monthNames[monthNumber - 1]} follows ${monthNames[monthNumber - 2]} in the 2027 roadmap. The previous month's plan is unavailable, so this draft uses the yearly roadmap and does not assume completion.`,
    previousMonthPlanGeneratedAt: previousMonthPlan?.generatedAt || null,
    previousMonthCompletionStatus:
      monthNumber === 1 ? "not_applicable" : "unknown"
  };

  saveMonthlyPlan(clientId, monthNumber, monthlyPlan);

  return monthlyPlan;
};

export const getMonthlyPlanByClient = (clientId, month) => {
  return getMonthlyPlan(clientId, month);
};