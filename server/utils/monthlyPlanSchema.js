import { z } from "zod";

const stringArray = z.array(z.string());
const nonEmptyString = z.string().trim().min(1);

const weeklyOutlineSchema = z.object({
  week: z.number().int().min(1).max(4),
  focus: z.string(),
  suggestedHabits: stringArray.min(2).max(4),
  reflectionQuestion: z.string()
});

export const monthlyPlanZodSchema = z.object({
  month: z.number().int().min(1).max(12),
  monthName: z.string(),
  roadmapTheme: nonEmptyString,
  roadmapObjectives: z.array(nonEmptyString).min(2).max(4),
  relatedPrimaryGoal: nonEmptyString,
  relatedSecondaryGoal: nonEmptyString,
  monthlyOverview: z.string(),
  monthlyFocus: stringArray.min(2).max(5),
  weeklyPlans: z.array(weeklyOutlineSchema).length(4),
  monthlyMilestones: stringArray.min(2).max(5),
  endOfMonthReflection: stringArray.min(2).max(4),
  coachReviewRequired: z.boolean(),
  disclaimer: z.string()
});

const boundedStrings = (minItems, maxItems) => ({
  type: "array",
  minItems,
  maxItems,
  items: { type: "string", minLength: 1 }
});

const weeklyOutlineJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    week: { type: "integer" },
    focus: { type: "string" },
    suggestedHabits: boundedStrings(2, 4),
    reflectionQuestion: { type: "string" }
  },
  required: [
    "week",
    "focus",
    "suggestedHabits",
    "reflectionQuestion"
  ]
};

export const monthlyPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    month: { type: "integer" },
    monthName: { type: "string" },
    roadmapTheme: { type: "string", minLength: 1 },
    roadmapObjectives: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string", minLength: 1 }
    },
    relatedPrimaryGoal: { type: "string", minLength: 1 },
    relatedSecondaryGoal: { type: "string", minLength: 1 },
    monthlyOverview: { type: "string" },
    monthlyFocus: boundedStrings(2, 5),
    weeklyPlans: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: weeklyOutlineJsonSchema
    },
    monthlyMilestones: boundedStrings(2, 5),
    endOfMonthReflection: boundedStrings(2, 4),
    coachReviewRequired: { type: "boolean" },
    disclaimer: { type: "string" }
  },
  required: [
    "month",
    "monthName",
    "roadmapTheme",
    "roadmapObjectives",
    "relatedPrimaryGoal",
    "relatedSecondaryGoal",
    "monthlyOverview",
    "monthlyFocus",
    "weeklyPlans",
    "monthlyMilestones",
    "endOfMonthReflection",
    "coachReviewRequired",
    "disclaimer"
  ]
};