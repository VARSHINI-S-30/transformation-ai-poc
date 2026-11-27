
import { processExcelFile } from "../services/excel.service.js";
import { saveClients } from "../store/clientStore.js";

export const uploadExcel = (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an Excel file"
            });
        }

        // Process uploaded Excel
        const result = processExcelFile(req.file.buffer);

        // Save valid clients in memory
        const savedCount = saveClients(result.clients);

        return res.status(
            result.totalErrors > 0 ? 422 : 200
        ).json({

            success: result.totalErrors === 0,

            message: result.totalErrors > 0
                ? "Excel processed with validation errors"
                : "Excel uploaded and processed successfully",

            savedClients: savedCount,

            ...result

        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};
