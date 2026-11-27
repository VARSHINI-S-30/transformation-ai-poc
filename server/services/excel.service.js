import XLSX from "xlsx";
import { clientSchema } from "../utils/clientValidation.js";
const requiredHeaders = [
    "client_id","name","dob","height_cm","weight_kg",
    "activity_level","target_date"];
const goalHeaders = [
    "primary_goal_1",
    "primary_goal_2",
    "secondary_goal_1",
    "secondary_goal_2"
];

const calculateAge = (dob) => {
    const birthDate = new Date(`${dob}T00:00:00Z`);
    const today = new Date();
    let age = today.getUTCFullYear() -
        birthDate.getUTCFullYear();
    const monthDifference =
        today.getUTCMonth() - birthDate.getUTCMonth();
    if (monthDifference < 0 ||(
            monthDifference === 0 &&
            today.getUTCDate() < birthDate.getUTCDate()
        )) {
        age--;
    }
    return age;
};

export const processExcelFile = (buffer) => {

    const workbook = XLSX.read(buffer, {
        type: "buffer"
    });

    if (!workbook.SheetNames.includes("Clients")) {
        throw new Error("Excel must contain a Clients worksheet");
    }
    const worksheet = workbook.Sheets["Clients"];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false
    });

    if (rows.length === 0) {
        throw new Error("No client records found in Excel");
    }
    const availableHeaders = Object.keys(rows[0]);
    const missingHeaders = requiredHeaders.filter(
        (header) => !availableHeaders.includes(header)
    );

    if (missingHeaders.length > 0) {
        throw new Error(
            `Missing Excel columns: ${missingHeaders.join(", ")}`
        );
    }
    const hasCurrentGoalHeaders = goalHeaders.every((header) =>
        availableHeaders.includes(header)
    );
    const hasLegacyGoalHeaders =
        availableHeaders.includes("primary_goal") &&
        availableHeaders.includes("secondary_goals");

    if (!hasCurrentGoalHeaders && !hasLegacyGoalHeaders) {
        const missingGoalHeaders = goalHeaders.filter(
            (header) => !availableHeaders.includes(header)
        );
        throw new Error(
            `Missing Excel goal columns: ${missingGoalHeaders.join(", ")}. ` +
            "Legacy workbooks must contain both primary_goal and secondary_goals."
        );
    }

    if (!hasCurrentGoalHeaders && goalHeaders.some((header) =>
        availableHeaders.includes(header)
    )) {
        throw new Error(
            `Excel must contain all four goal columns: ${goalHeaders.join(", ")}.`
        );
    }

    const clients = [];
    const errors = [];
    const warnings = [];
    const usedIds = new Set();
    rows.forEach((row, index) => {
        const rowNumber = index + 2;

        // Remove extra spaces and convert blank cells
        const cleanedRow = {};
        Object.keys(row).forEach((key) => {
            const value = row[key];
            cleanedRow[key.trim()] =
                typeof value === "string"
                    ? value.trim()
                    : value;
        });

        if (!hasCurrentGoalHeaders) {
            cleanedRow.primary_goal_1 = cleanedRow.primary_goal || "Not specified";
            cleanedRow.primary_goal_2 = "Not specified";
            cleanedRow.secondary_goal_1 = cleanedRow.secondary_goals || "Not specified";
            cleanedRow.secondary_goal_2 = "Not specified";
            cleanedRow.legacyGoalMigrationRequired = true;
        }

        // Validate client information
        const result = clientSchema.safeParse(cleanedRow);

        if (!result.success) {
            errors.push({
                row: rowNumber,
                issues: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            });
            return;
        }
        const client = result.data;

        if (usedIds.has(client.client_id)) {
            errors.push({
                row: rowNumber,
                issues: [{
                    field: "client_id",
                    message: "Duplicate client ID"
                }]
            });

            return;
        }

        usedIds.add(client.client_id);
        client.age = calculateAge(client.dob);

        if (client.legacyGoalMigrationRequired) {
            warnings.push({
                row: rowNumber,
                client_id: client.client_id,
                message: "Legacy goals were preserved where supplied. Add both missing goals using the four-goal Excel template before generating plans."
            });
        }

        // Flag incomplete health-related information
        if (
            !client.medical_conditions ||
            client.medical_conditions === "Not specified"
        ) {
            warnings.push({
                row: rowNumber,
                client_id: client.client_id,
                message: "Medical information needs clarification"
            });
        }

        if (
            !client.injury_restrictions ||
            client.injury_restrictions === "Not specified"
        ) {
            warnings.push({
                row: rowNumber,
                client_id: client.client_id,
                message: "Exercise restrictions need clarification"
            });
        }
        if (client.age < 18) {
            warnings.push({
                row: rowNumber,
                client_id: client.client_id,
                message: "Professional review required before any personalized wellness planning"
            });
        }
        clients.push(client);
    });

    return {
        totalRows: rows.length,
        totalValidClients: clients.length,
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        clients,
        errors,
        warnings
    };
};
