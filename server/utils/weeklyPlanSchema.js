import { z } from "zod";

const stringArray = z.array(z.string());
const nonEmptyString = z.string().trim().min(1);

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const dailyPlanSchema = z.object({
  day: z.enum(dayNames),
  focus: z.string(),
  suggestedHabits: stringArray.min(2).max(4),
  reflectionPrompt: z.string()
});

export const weeklyPlanZodSchema = z.object({
  month: z.number().int().min(1).max(12),
  week: z.number().int().min(1).max(4),
  roadmapTheme: nonEmptyString,
  roadmapObjectives: z.array(nonEmptyString).min(2).max(4),
  relatedPrimaryGoal: nonEmptyString,
  relatedSecondaryGoal: nonEmptyString,
  weekTheme: z.string(),
  weeklyOverview: z.string(),
  dailyPlans: z.array(dailyPlanSchema).length(7),
  weeklyMilestones: stringArray.min(2).max(4),
  endOfWeekReflection: stringArray.min(2).max(4),
  coachReviewRequired: z.boolean(),
  disclaimer: z.string()
});

const boundedStrings = (minItems, maxItems) => ({
  type: "array",
  minItems,
  maxItems,
  items: { type: "string", minLength: 1 }
});

const dailyPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    day: {
      type: "string",
      enum: dayNames
    },
    focus: { type: "string" },
    suggestedHabits: boundedStrings(2, 4),
    reflectionPrompt: { type: "string" }
  },
  required: [
    "day",
    "focus",
    "suggestedHabits",
    "reflectionPrompt"
  ]
};

export const weeklyPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    month: { type: "integer" },
    week: { type: "integer" },
    roadmapTheme: { type: "string", minLength: 1 },
    roadmapObjectives: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string", minLength: 1 }
    },
    relatedPrimaryGoal: { type: "string", minLength: 1 },
    relatedSecondaryGoal: { type: "string", minLength: 1 },
    weekTheme: { type: "string" },
    weeklyOverview: { type: "string" },
    dailyPlans: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: dailyPlanJsonSchema
    },
    weeklyMilestones: boundedStrings(2, 4),
    endOfWeekReflection: boundedStrings(2, 4),
    coachReviewRequired: { type: "boolean" },
    disclaimer: { type: "string" }
  },
  required: [
    "month",
    "week",
    "roadmapTheme",
    "roadmapObjectives",
    "relatedPrimaryGoal",
    "relatedSecondaryGoal",
    "weekTheme",
    "weeklyOverview",
    "dailyPlans",
    "weeklyMilestones",
    "endOfWeekReflection",
    "coachReviewRequired",
    "disclaimer"
  ]
};
