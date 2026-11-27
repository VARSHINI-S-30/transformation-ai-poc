import assert from "node:assert/strict";
import test from "node:test";
import XLSX from "xlsx";
import { processExcelFile } from "../services/excel.service.js";
import {
  buildMonthlyPlanInput
} from "../services/monthlyPlan.service.js";
import { buildWeeklyPlanInput } from "../services/weeklyPlan.service.js";
import { validateRoadmapStructure } from "../services/transformation.service.js";
import {
  getProfessionalReviewReason,
  hasProfessionalReviewRequirement
} from "../utils/reviewRequirements.js";
import { whatIfSchemas } from "../utils/whatIfSchema.js";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const client = {
  client_id: 501,
  name: "Test Client",
  age: 30,
  primary_goal_1: "Build a steady routine",
  primary_goal_2: "Explore new skills",
  secondary_goal_1: "Improve organization",
  secondary_goal_2: "Reflect regularly",
  activity_level: "Moderate",
  workout_preference: "Walking",
  available_workout_time: "Flexible",
  medical_conditions: "None",
  injury_restrictions: "None"
};

const createRoadmap = () => ({
  yearlyRoadmap: {
    year: 2027,
    yearTheme: "Steady and purposeful growth",
    phases: Array.from({ length: 4 }, (_, phaseIndex) => ({
      phaseName: `Phase ${phaseIndex + 1}`,
      phaseOutcome: "Build on the previous phase toward the four goals.",
      months: Array.from({ length: 3 }, (_, monthIndex) => {
        const month = phaseIndex * 3 + monthIndex + 1;
        return {
          month,
          monthName: monthNames[month - 1],
          theme: `Theme for ${monthNames[month - 1]}`,
          objectives: ["Practice a new skill", "Review weekly routines"],
          relatedPrimaryGoal: month % 2
            ? client.primary_goal_1
            : client.primary_goal_2,
          relatedSecondaryGoal: month % 2
            ? client.secondary_goal_1
            : client.secondary_goal_2,
          habits: ["Plan the week", "Reflect briefly"],
          expectedOutcomes: ["A clearer routine", "More confidence in planning"],
          reflectionPrompt: "What felt useful this month?"
        };
      })
    }))
  }
});

test("roadmap validation canonicalizes month names and orders phases chronologically", () => {
  const roadmap = createRoadmap();
  assert.doesNotThrow(() => validateRoadmapStructure(roadmap, client));

  const unordered = createRoadmap();
  unordered.yearlyRoadmap.phases.reverse();
  unordered.yearlyRoadmap.phases.forEach((phase) => {
    phase.months.reverse();
    phase.months.forEach((month) => {
      month.monthName = "AI generated label";
    });
  });
  validateRoadmapStructure(unordered, client);
  assert.deepEqual(
    unordered.yearlyRoadmap.phases.map((phase) =>
      phase.months.map((month) => month.month)
    ),
    [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
  );
  assert.equal(unordered.yearlyRoadmap.phases[0].months[0].monthName, "January");

  const duplicateMonth = structuredClone(roadmap);
  duplicateMonth.yearlyRoadmap.phases[3].months[2].month = 11;
  assert.throws(
    () => validateRoadmapStructure(duplicateMonth, client),
    /month number from 1 to 12 exactly once/
  );
});

test("February monthly input continues January with completion explicitly unknown", () => {
  const previousMonthPlan = {
    month: 1,
    generatedAt: "2027-01-31T12:00:00.000Z",
    monthlyOverview: "January plan",
    monthlyFocus: ["Build a consistent planning habit"]
  };
  const roadmap = createRoadmap();
  const february = roadmap.yearlyRoadmap.phases[0].months[1];
  const input = buildMonthlyPlanInput({
    client,
    roadmap,
    selectedMonth: february,
    previousMonthPlan
  });

  assert.equal(input.month, 2);
  assert.equal(input.previousMonthContext.plan, previousMonthPlan);
  assert.equal(input.previousMonthContext.completionStatus, "unknown");
  assert.equal(input.previousMonthContext.completionInformationAvailable, false);
  assert.equal(input.clientGoals.primaryGoal1, client.primary_goal_1);
  assert.equal(input.yearlyRoadmap, roadmap.yearlyRoadmap);
  assert.equal("medical_conditions" in input, false);
  assert.equal("injury_restrictions" in input.clientPlanningPreferences, false);
});

test("March monthly input is available without February and marks completion unknown", () => {
  const roadmap = createRoadmap();
  const march = roadmap.yearlyRoadmap.phases[0].months[2];
  const input = buildMonthlyPlanInput({
    client,
    roadmap,
    selectedMonth: march,
    previousMonthPlan: null
  });

  assert.equal(input.month, 3);
  assert.equal(input.previousMonthContext.planAvailable, false);
  assert.equal(input.previousMonthContext.completionStatus, "unknown");
  assert.equal(input.previousMonthContext.completionInformationAvailable, false);
});

test("Week 2 weekly input continues Week 1 and remains tied to its month", () => {
  const roadmap = createRoadmap();
  const previousWeekPlan = {
    month: 1,
    week: 1,
    weeklyOverview: "Week 1 plan",
    generatedAt: "2027-01-07T12:00:00.000Z"
  };
  const monthlyPlan = {
    monthName: "January",
    monthlyOverview: "January planning focus",
    monthlyFocus: ["Establish a flexible weekly routine"]
  };
  const input = buildWeeklyPlanInput({
    client,
    roadmap,
    monthlyPlan,
    selectedRoadmapMonth: roadmap.yearlyRoadmap.phases[0].months[0],
    selectedWeek: {
      week: 2,
      focus: "Build on the weekly routine",
      suggestedHabits: ["Plan two days ahead", "Reflect at week's end"],
      reflectionQuestion: "What was manageable?"
    },
    previousWeekPlan,
    monthNumber: 1,
    weekNumber: 2
  });

  assert.equal(input.week, 2);
  assert.equal(input.previousWeekContext.planAvailable, true);
  assert.equal(input.previousWeekContext.plan, previousWeekPlan);
  assert.equal(input.previousWeekContext.completionStatus, "unknown");
  assert.deepEqual(input.monthObjectives, roadmap.yearlyRoadmap.phases[0].months[0].objectives);
  assert.equal(input.clientGoals.secondaryGoal2, client.secondary_goal_2);
  assert.equal("medical_conditions" in input, false);
});

test("Week 2 can be planned without Week 1 and marks completion unknown", () => {
  const roadmap = createRoadmap();
  const input = buildWeeklyPlanInput({
    client,
    roadmap,
    monthlyPlan: {
      monthName: "March",
      monthlyOverview: "March focus",
      monthlyFocus: ["Build on the roadmap"]
    },
    selectedRoadmapMonth: roadmap.yearlyRoadmap.phases[0].months[2],
    selectedWeek: {
      week: 2,
      focus: "Continue the March objective",
      suggestedHabits: ["Plan", "Reflect"],
      reflectionQuestion: "What felt manageable?"
    },
    previousWeekPlan: null,
    monthNumber: 3,
    weekNumber: 2
  });

  assert.equal(input.previousWeekContext.planAvailable, false);
  assert.equal(input.previousWeekContext.completionStatus, "unknown");
  assert.deepEqual(input.monthObjectives, roadmap.yearlyRoadmap.phases[0].months[2].objectives);
});

test("medical conditions and injury restrictions require professional review", () => {
  assert.equal(hasProfessionalReviewRequirement(client), false);
  const medicalClient = {
    ...client,
    medical_conditions: "Diabetes"
  };
  assert.equal(hasProfessionalReviewRequirement(medicalClient), true);
  const reason = getProfessionalReviewReason(medicalClient);
  assert.match(reason, /qualified professional/);
  assert.doesNotMatch(reason, /diabetes/i);
  assert.equal(hasProfessionalReviewRequirement({
    ...client,
    injury_restrictions: "Avoid impact activities"
  }), true);
});

test("what-if yearly schema preserves the 2027 monthly roadmap fields", () => {
  const monthSchema = whatIfSchemas.yearly.properties.yearlyRoadmap
    .properties.phases.items.properties.months.items;
  assert.ok(monthSchema.required.includes("relatedPrimaryGoal"));
  assert.ok(monthSchema.required.includes("relatedSecondaryGoal"));
  assert.ok(monthSchema.required.includes("expectedOutcomes"));
  assert.ok(whatIfSchemas.monthly.required.includes("relatedPrimaryGoal"));
  assert.ok(whatIfSchemas.weekly.required.includes("relatedSecondaryGoal"));
});

test("legacy Excel goal columns are retained and explicitly marked for migration", () => {
  const worksheet = XLSX.utils.json_to_sheet([{
    client_id: 701,
    name: "Legacy Client",
    dob: "1990-01-10",
    height_cm: 170,
    weight_kg: 70,
    primary_goal: "Build a regular routine",
    secondary_goals: "Improve organization, reflect regularly",
    activity_level: "Moderate",
    target_date: "2027-12-31"
  }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const result = processExcelFile(buffer);

  assert.equal(result.totalValidClients, 1);
  assert.equal(result.clients[0].primary_goal_1, "Build a regular routine");
  assert.equal(
    result.clients[0].secondary_goal_1,
    "Improve organization, reflect regularly"
  );
  assert.equal(result.clients[0].legacyGoalMigrationRequired, true);
  assert.ok(result.warnings.some((warning) =>
    warning.message.includes("Legacy goals were preserved")
  ));
});

