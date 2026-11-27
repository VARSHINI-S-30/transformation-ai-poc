import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDirectory = path.join(__dirname, "../templates");
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}
const headers = [
    "client_id",
    "name",
    "dob",
    "height_cm",
    "weight_kg",
    "primary_goal_1",
    "primary_goal_2",
    "secondary_goal_1",
    "secondary_goal_2",
    "medical_conditions",
    "activity_level",
    "food_preference",
    "workout_preference",
    "fitness_experience",
    "available_workout_time",
    "dietary_restrictions",
    "injury_restrictions",
    "target_date",
    "client_notes"
];
const sampleClients = [{
        client_id: 1001,
        name: "Client Demo 1",
        dob: "2001-05-12",
        height_cm: 160,
        weight_kg: 69,
        primary_goal_1: "Build a consistent daily routine",
        primary_goal_2: "Explore enjoyable activities",
        secondary_goal_1: "Improve organization",
        secondary_goal_2: "Develop a regular reflection habit",
        medical_conditions: "None",
        activity_level: "Sedentary",
        food_preference: "Vegetarian",
        workout_preference: "Yoga, walking",
        fitness_experience: "Beginner",
        available_workout_time: "30 minutes",
        dietary_restrictions: "None",
        injury_restrictions: "None",
        target_date: "2027-12-31",
        client_notes: "Fictional demonstration record"
    },{
        client_id: 1002,
        name: "Client Demo 2",
        dob: "1998-08-20",
        height_cm: 170,
        weight_kg: 72,
        primary_goal_1: "Build consistency with preferred activities",
        primary_goal_2: "Develop time-management skills",
        secondary_goal_1: "Explore new learning opportunities",
        secondary_goal_2: "Strengthen planning habits",
        medical_conditions: "None",
        activity_level: "Moderate",
        food_preference: "Non-vegetarian",
        workout_preference: "Walking, cycling",
        fitness_experience: "Intermediate",
        available_workout_time: "45 minutes",
        dietary_restrictions: "None",
        injury_restrictions: "None",
        target_date: "2027-12-31",
        client_notes: "Fictional demonstration record"
    }];
const clientSheet = XLSX.utils.json_to_sheet(sampleClients, {
    header: headers
});
clientSheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + 5, 18)
}));
const instructions = [
    ["TRANSFORMATION AI POC - EXCEL TEMPLATE"],
    ["Instructions"],
    ["1. Enter one client per row."],
    ["2. client_id must be unique."],
    ["3. Enter dates in YYYY-MM-DD format."],
    ["4. Use consistent values for activity levels."],
    ["5. Complete primary_goal_1, primary_goal_2, secondary_goal_1, and secondary_goal_2."],
    ["6. Use fictional records for POC testing."],
    ["7. Do not upload identifiable real client health data."],
    ["8. Keep required fields complete before generation."],
    ["9. Legacy primary_goal and secondary_goals columns are imported with a migration warning; complete all four new goal fields before plan generation."],
    ["10. All example records are fictional."]
];
const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook,clientSheet,"Clients");
XLSX.utils.book_append_sheet(workbook,instructionSheet,"Instructions");
const outputPath = path.join(outputDirectory,"clients_2027_template.xlsx");
XLSX.writeFile(workbook, outputPath);
console.log("Excel template created successfully!");
console.log(`File location: ${outputPath}`);
