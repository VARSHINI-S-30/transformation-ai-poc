import { generateStructuredJson } from "./aiJson.service.js";
import { weeklyPlanInstructions } from "../prompts/weeklyPlan.prompt.js";
import {
  weeklyPlanJsonSchema,
  weeklyPlanZodSchema
} from "../utils/weeklyPlanSchema.js";
import { getClientById } from "../store/clientStore.js";
import { getRoadmapByClientId } from "../store/roadmapStore.js";
import { getMonthlyPlan } from "../store/monthlyPlanStore.js";
import {
  saveWeeklyPlan,
  getWeeklyPlan
} from "../store/weeklyPlanStore.js";
import {
  getProfessionalReviewReason,
  hasProfessionalReviewRequirement
} from "../utils/reviewRequirements.js";
const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const buildWeeklyPlanInput = ({
  client,
  roadmap,
  monthlyPlan,
  selectedWeek,
  selectedRoadmapMonth,
  previousWeekPlan,
  monthNumber,
  weekNumber
}) => ({
  year: 2027,
  month: monthNumber,
  week: weekNumber,
  clientGoals: {
    primaryGoal1: client.primary_goal_1,
    primaryGoal2: client.primary_goal_2,
    secondaryGoal1: client.secondary_goal_1,
    secondaryGoal2: client.secondary_goal_2
  },
  yearlyRoadmap: roadmap.yearlyRoadmap,
  roadmapTheme: selectedRoadmapMonth.theme,
  monthName: monthlyPlan.monthName,
  monthlyOverview: monthlyPlan.monthlyOverview,
  monthlyFocus: monthlyPlan.monthlyFocus,
  monthObjectives: selectedRoadmapMonth.objectives,
  monthRelatedPrimaryGoal: selectedRoadmapMonth.relatedPrimaryGoal,
  monthRelatedSecondaryGoal: selectedRoadmapMonth.relatedSecondaryGoal,
  weekFocus: selectedWeek.focus,
  suggestedHabitsFromMonthlyPlan: selectedWeek.suggestedHabits,
  monthlyReflectionQuestion: selectedWeek.reflectionQuestion,
  previousWeekContext: previousWeekPlan
    ? {
        planAvailable: true,
        plan: previousWeekPlan,
        completionStatus: "unknown",
        completionInformationAvailable: false
      }
    : weekNumber > 1
      ? {
          planAvailable: false,
          completionStatus: "unknown",
          completionInformationAvailable: false
        }
      : null,
  clientPlanningPreferences: {
    ageGroup: Number(client.age) < 18 ? "under_18" : "adult",
    activityLevel: client.activity_level,
    activityPreference: client.workout_preference,
    availableTime: client.available_workout_time
  }
});

export const generateWeeklyPlan = async (
  clientId,
  month,
  week
) => {
  const monthNumber = Number(month);
  const weekNumber = Number(week);

  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 4) {
    throw new Error("Week must be between 1 and 4.");
  }

  const monthlyPlan = getMonthlyPlan(clientId, monthNumber);

  if (!monthlyPlan) {
    throw new Error("Generate the monthly plan before generating a weekly plan.");
  }

  const client = getClientById(clientId);
  if (!client) {
    throw new Error("Client not found. Upload the Excel file first.");
  }
  const roadmap = getRoadmapByClientId(clientId);
  if (!roadmap) {
    throw new Error("Generate the yearly roadmap before generating a weekly plan.");
  }

  const previousWeekPlan = weekNumber > 1
    ? getWeeklyPlan(clientId, monthNumber, weekNumber - 1)
    : null;

  const selectedWeek = monthlyPlan.weeklyPlans.find(
    (item) => item.week === weekNumber
  );

  if (!selectedWeek) {
    throw new Error("Selected week was not found in the monthly plan.");
  }
  const roadmapMonth = roadmap.yearlyRoadmap.phases
    .flatMap((phase) => phase.months)
    .find((item) => item.month === monthNumber);

  if (!roadmapMonth) {
    throw new Error("The selected month was not found in the yearly roadmap.");
  }

  const generated = await generateStructuredJson({
    schemaName: "weekly_transformation_plan",
    schema: weeklyPlanJsonSchema,
    instructions: weeklyPlanInstructions,
    input: buildWeeklyPlanInput({
      client,
      roadmap,
      monthlyPlan,
      selectedWeek,
      selectedRoadmapMonth: roadmapMonth,
      previousWeekPlan,
      monthNumber,
      weekNumber
    })
  });

  const validated = weeklyPlanZodSchema.parse(generated);

  if (
    validated.month !== monthNumber ||
    validated.week !== weekNumber
  ) {
    throw new Error("AI returned a plan for the wrong month or week.");
  }
  validated.roadmapTheme = roadmapMonth.theme;
  validated.roadmapObjectives = roadmapMonth.objectives;
  validated.relatedPrimaryGoal = roadmapMonth.relatedPrimaryGoal;
  validated.relatedSecondaryGoal = roadmapMonth.relatedSecondaryGoal;
  const actualDays = validated.dailyPlans.map((item) => item.day);
  if (JSON.stringify(actualDays) !== JSON.stringify(dayNames)) {
    throw new Error(
      "Weekly plan must contain Monday through Sunday in order."
    );
  }
  const weeklyPlan = {
    clientId: Number(clientId),
    generatedAt: new Date().toISOString(),
    status: "pending_review",
    ...validated,
    coachReviewRequired: true,
    professionalReviewRequired:
      hasProfessionalReviewRequirement(client),
    professionalReviewReason:
      getProfessionalReviewReason(client),
    continuityNote: previousWeekPlan
      ? `Week ${weekNumber} continues Week ${weekNumber - 1} and builds on the previous week's plan. Completion is unknown unless separately recorded.`
      : weekNumber === 1
        ? "Week 1 starts from this month's roadmap and monthly plan."
        : `Week ${weekNumber} follows Week ${weekNumber - 1} in the monthly plan. The previous week's plan is unavailable, so this draft uses the monthly and yearly objectives and does not assume completion.`,
    previousWeekPlanGeneratedAt: previousWeekPlan?.generatedAt || null,
    previousWeekCompletionStatus:
      weekNumber === 1 ? "not_applicable" : "unknown"
  };
  saveWeeklyPlan(clientId, monthNumber, weekNumber, weeklyPlan);
  return weeklyPlan;
};
export const getWeeklyPlanByClient = (clientId, month, week) => {
  return getWeeklyPlan(clientId, month, week);
};