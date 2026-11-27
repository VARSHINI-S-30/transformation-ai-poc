
import {
  createPdfReport,
  createExcelReport
} from "../services/report.service.js";

export const downloadPdfReport = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { month, week } = req.query;

    const buffer = await createPdfReport({ clientId, month, week });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transformation-report-${clientId}.pdf`
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const downloadExcelReport = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { month, week } = req.query;

    const buffer = await createExcelReport({ clientId, month, week });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transformation-report-${clientId}.xlsx`
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
