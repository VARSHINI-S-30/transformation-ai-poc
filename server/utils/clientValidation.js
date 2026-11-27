import { z } from "zod";
const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validPastDate = (value) => {
  if (!validDate(value)) return false;

  return new Date(`${value}T00:00:00Z`) <= new Date();
};

const optionalText = z.string().trim().default("Not specified");

export const clientSchema = z.object({
  client_id: z.coerce.number()
    .int("Client ID must be a whole number")
    .positive("Client ID must be positive"),

  name: z.string()
    .trim()
    .min(2, "Name must contain at least 2 characters"),

  dob: z.string()
    .refine(validPastDate, "DOB must be a valid past date in YYYY-MM-DD format"),

  height_cm: z.coerce.number()
    .finite("Height must be a valid number")
    .positive("Height must be greater than zero")
    .max(300, "Please check the height entered"),

  weight_kg: z.coerce.number()
    .finite("Weight must be a valid number")
    .positive("Weight must be greater than zero")
    .max(500, "Please check the weight entered"),

  primary_goal_1: z.string()
    .trim()
    .min(2, "Primary goal 1 is required"),
  primary_goal_2: z.string()
    .trim()
    .min(2, "Primary goal 2 is required"),
  secondary_goal_1: z.string()
    .trim()
    .min(2, "Secondary goal 1 is required"),
  secondary_goal_2: z.string()
    .trim()
    .min(2, "Secondary goal 2 is required"),
  legacyGoalMigrationRequired: z.boolean().default(false),
  medical_conditions: optionalText,

  activity_level: z.string()
    .trim()
    .min(2, "Activity level is required"),

  food_preference: optionalText,
  workout_preference: optionalText,
  fitness_experience: optionalText,
  available_workout_time: optionalText,
  dietary_restrictions: optionalText,
  injury_restrictions: optionalText,

  target_date: z.string()
    .refine(validDate, "Target date must be a valid date in YYYY-MM-DD format"),

  client_notes: z.string().default("")
});
