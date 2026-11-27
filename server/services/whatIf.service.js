import { generateStructuredJson } from "./aiJson.service.js";
import { getGeneratedRoadmap } from "./transformation.service.js";
import { getMonthlyPlanByClient } from "./monthlyPlan.service.js";
import { getWeeklyPlanByClient } from "./weeklyPlan.service.js";
import { getClientById } from "../store/clientStore.js";
import {
  savePlanVersion,
  getPlanVersions
} from "../store/planVersionStore.js";
import { whatIfSchemas } from "../utils/whatIfSchema.js";

const getOriginalPlan = async ({ planType, clientId, month, week }) => {
  if (planType === "yearly") {
    return await getGeneratedRoadmap(clientId);
  }

  if (planType === "monthly") {
    return await getMonthlyPlanByClient(clientId, month);
  }

  if (planType === "weekly") {
    return await getWeeklyPlanByClient(clientId, month, week);
  }

  throw new Error("Invalid plan type. Use yearly, monthly, or weekly.");
};

export const regeneratePlan = async ({
  planType,
  clientId,
  month,
  week,
  scenario
}) => {
  const client = getClientById(clientId);

  if (!client) {
    throw new Error("Client not found.");
  }

  if (!scenario || scenario.trim().length < 5) {
    throw new Error("Please provide a clear what-if scenario.");
  }

  const details = { planType, clientId, month, week };
  const originalPlan = await getOriginalPlan(details);

  if (!originalPlan) {
    throw new Error("Generate the original plan before using what-if regeneration.");
  }

  const history = getPlanVersions(details);

  if (history.length === 0) {
    savePlanVersion(
      { ...details, changeNote: "Original plan" },
      originalPlan
    );
  }

  const revisedPlan = await generateStructuredJson({
    schemaName: `${planType}_revised_plan`,
    schema: whatIfSchemas[planType],
    instructions: `
You are revising an existing general personal-development plan.

Preserve the original plan's structure and required fields.
Apply the scenario while keeping the plan realistic, supportive,
age-appropriate, and non-medical.

Focus only on routines, learning, organization, time management,
reflection, and general wellbeing.

Do not provide medical advice, diagnoses, restrictive diets,
calorie targets, weight-loss instructions, or intensive exercise
prescriptions. Do not diagnose, promise to cure or improve a medical
condition, recommend treatment or medication changes, invent clinical
targets, or assume changes in weight, energy, or other health measures.
Do not assume any medical information.

Return only the required structured JSON.
`,
    input: {
      planType,
      originalPlan,
      scenario
    }
  });

  for (const field of [
    "professionalReviewRequired",
    "professionalReviewReason",
    "continuityNote",
    "previousMonthPlanGeneratedAt",
    "previousMonthCompletionStatus",
    "previousWeekPlanGeneratedAt",
    "previousWeekCompletionStatus"
  ]) {
    if (originalPlan[field] !== undefined) {
      revisedPlan[field] = originalPlan[field];
    }
  }

  if (originalPlan.review && revisedPlan.review) {
    revisedPlan.review = {
      ...revisedPlan.review,
      reviewRequired: originalPlan.review.reviewRequired,
      reviewReason: originalPlan.review.reviewReason
    };
  }
  if (planType !== "yearly") {
    revisedPlan.coachReviewRequired = true;
  }

  const savedVersion = savePlanVersion(
    { ...details, changeNote: scenario },
    revisedPlan
  );

  return {
    ...savedVersion,
    history: getPlanVersions(details)
  };
};

export const getPlanVersionHistory = (details) => {
  return getPlanVersions(details);
};
