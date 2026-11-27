import { z } from "zod";

const stringArray = z.array(z.string());
const nonEmptyString = z.string().trim().min(1);
const boundedStringArray = (minItems, maxItems) =>
  z.array(nonEmptyString).min(minItems).max(maxItems);

const monthSchema = z.object({
  month: z.number().int().min(1).max(12),
  monthName: nonEmptyString,
  theme: nonEmptyString,
  objectives: boundedStringArray(2, 4),
  relatedPrimaryGoal: nonEmptyString,
  relatedSecondaryGoal: nonEmptyString,
  habits: boundedStringArray(2, 4),
  expectedOutcomes: boundedStringArray(2, 4),
  reflectionPrompt: nonEmptyString
});

const phaseSchema = z.object({
  phaseName: nonEmptyString,
  phaseOutcome: nonEmptyString,
  months: z.array(monthSchema).length(3)
});

export const roadmapZodSchema = z.object({
  assessment: z.object({
    overview: z.string(),
    strengths: stringArray,
    opportunities: stringArray,
    startingPoint: z.string()
  }),

  yearlyRoadmap: z.object({
    year: z.literal(2027),
    yearTheme: nonEmptyString,
    phases: z.array(phaseSchema).length(4)
  }),

  review: z.object({
    reviewRequired: z.boolean(),
    reviewReason: z.string(),
    coachNotes: z.string()
  }),

  disclaimer: z.string()
});

const stringArraySchema = {
  type: "array",
  items: { type: "string" }
};

const boundedStringArraySchema = (minItems, maxItems) => ({
  type: "array",
  minItems,
  maxItems,
  items: { type: "string", minLength: 1 }
});

const monthJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    month: { type: "integer", minimum: 1, maximum: 12 },
    monthName: { type: "string", minLength: 1 },
    theme: { type: "string", minLength: 1 },
    objectives: boundedStringArraySchema(2, 4),
    relatedPrimaryGoal: { type: "string", minLength: 1 },
    relatedSecondaryGoal: { type: "string", minLength: 1 },
    habits: boundedStringArraySchema(2, 4),
    expectedOutcomes: boundedStringArraySchema(2, 4),
    reflectionPrompt: { type: "string", minLength: 1 }
  },
  required: [
    "month",
    "monthName",
    "theme",
    "objectives",
    "relatedPrimaryGoal",
    "relatedSecondaryGoal",
    "habits",
    "expectedOutcomes",
    "reflectionPrompt"
  ]
};

const phaseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    phaseName: { type: "string", minLength: 1 },
    phaseOutcome: { type: "string", minLength: 1 },
    months: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: monthJsonSchema
    }
  },
  required: ["phaseName", "phaseOutcome", "months"]
};

export const roadmapJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    assessment: {
      type: "object",
      additionalProperties: false,
      properties: {
        overview: { type: "string" },
        strengths: stringArraySchema,
        opportunities: stringArraySchema,
        startingPoint: { type: "string" }
      },
      required: [
        "overview",
        "strengths",
        "opportunities",
        "startingPoint"
      ]
    },

    yearlyRoadmap: {
      type: "object",
      additionalProperties: false,
      properties: {
        year: { type: "integer", enum: [2027] },
        yearTheme: { type: "string", minLength: 1 },
        phases: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: phaseJsonSchema
        }
      },
      required: ["year", "yearTheme", "phases"]
    },

    review: {
      type: "object",
      additionalProperties: false,
      properties: {
        reviewRequired: { type: "boolean" },
        reviewReason: { type: "string" },
        coachNotes: { type: "string" }
      },
      required: [
        "reviewRequired",
        "reviewReason",
        "coachNotes"
      ]
    },

    disclaimer: { type: "string" }
  },
  required: ["assessment", "yearlyRoadmap", "review", "disclaimer"]
};
