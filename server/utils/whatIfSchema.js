
const stringArray = {
  type: "array",
  items: { type: "string" }
};

const reflectionSchema = {
  type: "array",
  items: { type: "string" }
};

export const whatIfSchemas = {
  yearly: {
    type: "object",
    additionalProperties: false,
    required: ["assessment", "yearlyRoadmap", "review", "disclaimer"],
    properties: {
      assessment: {
        type: "object",
        additionalProperties: false,
        required: ["overview", "strengths", "opportunities", "startingPoint"],
        properties: {
          overview: { type: "string" },
          strengths: stringArray,
          opportunities: stringArray,
          startingPoint: { type: "string" }
        }
      },
      yearlyRoadmap: {
        type: "object",
        additionalProperties: false,
        required: ["year", "yearTheme", "phases"],
        properties: {
          year: { type: "integer", enum: [2027] },
          yearTheme: { type: "string" },
          phases: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["phaseName", "phaseOutcome", "months"],
              properties: {
                phaseName: { type: "string" },
                phaseOutcome: { type: "string" },
                months: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "month", "monthName", "theme", "objectives",
                      "relatedPrimaryGoal", "relatedSecondaryGoal",
                      "habits", "expectedOutcomes", "reflectionPrompt"
                    ],
                    properties: {
                      month: { type: "integer", minimum: 1, maximum: 12 },
                      monthName: { type: "string" },
                      theme: { type: "string" },
                      objectives: {
                        type: "array",
                        minItems: 2,
                        maxItems: 4,
                        items: { type: "string" }
                      },
                      relatedPrimaryGoal: { type: "string" },
                      relatedSecondaryGoal: { type: "string" },
                      habits: {
                        type: "array",
                        minItems: 2,
                        maxItems: 4,
                        items: { type: "string" }
                      },
                      expectedOutcomes: {
                        type: "array",
                        minItems: 2,
                        maxItems: 4,
                        items: { type: "string" }
                      },
                      reflectionPrompt: { type: "string" }
                    }}}}}}}},
      review: {
        type: "object",
        additionalProperties: false,
        required: ["reviewRequired", "reviewReason", "coachNotes"],
        properties: {
          reviewRequired: { type: "boolean" },
          reviewReason: { type: "string" },
          coachNotes: { type: "string" }
        }},
      disclaimer: { type: "string" }
    }},
  monthly: {
    type: "object",
    additionalProperties: false,
    required: [
      "month", "monthName", "roadmapTheme", "roadmapObjectives",
      "relatedPrimaryGoal", "relatedSecondaryGoal",
      "monthlyOverview", "monthlyFocus",
      "weeklyPlans", "monthlyMilestones", "endOfMonthReflection",
      "coachReviewRequired", "disclaimer"
    ],
    properties: {
      month: { type: "integer", minimum: 1, maximum: 12 },
      monthName: { type: "string" },
      roadmapTheme: { type: "string" },
      roadmapObjectives: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" }
      },
      relatedPrimaryGoal: { type: "string" },
      relatedSecondaryGoal: { type: "string" },
      monthlyOverview: { type: "string" },
      monthlyFocus: {
        type: "array",
        minItems: 2,
        maxItems: 5,
        items: { type: "string" }
      },
      weeklyPlans: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["week", "focus", "suggestedHabits", "reflectionQuestion"],
          properties: {
            week: { type: "integer", minimum: 1, maximum: 4 },
            focus: { type: "string" },
            suggestedHabits: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: { type: "string" }
            },
            reflectionQuestion: { type: "string" }
          }}},
      monthlyMilestones: stringArray,
      endOfMonthReflection: reflectionSchema,
      coachReviewRequired: { type: "boolean" },
      disclaimer: { type: "string" }
    }},
  weekly: {
    type: "object",
    additionalProperties: false,
    required: [
      "month", "week", "roadmapTheme", "roadmapObjectives",
      "relatedPrimaryGoal", "relatedSecondaryGoal",
      "weekTheme", "weeklyOverview", "dailyPlans",
      "weeklyMilestones", "endOfWeekReflection",
      "coachReviewRequired", "disclaimer"
    ],
    properties: {
      month: { type: "integer", minimum: 1, maximum: 12 },
      week: { type: "integer", minimum: 1, maximum: 4 },
      roadmapTheme: { type: "string" },
      roadmapObjectives: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" }
      },
      relatedPrimaryGoal: { type: "string" },
      relatedSecondaryGoal: { type: "string" },
      weekTheme: { type: "string" },
      weeklyOverview: { type: "string" },
      dailyPlans: {
        type: "array",
        minItems: 7,
        maxItems: 7,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["day", "focus", "suggestedHabits", "reflectionPrompt"],
          properties: {
            day: {
              type: "string",
              enum: [
                "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday", "Sunday"
              ]
            },
            focus: { type: "string" },
            suggestedHabits: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: { type: "string" }
            },
            reflectionPrompt: { type: "string" }
          }}},
      weeklyMilestones: stringArray,
      endOfWeekReflection: reflectionSchema,
      coachReviewRequired: { type: "boolean" },
      disclaimer: { type: "string" }
    }}};
