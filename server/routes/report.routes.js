
import express from "express";
import {
  downloadPdfReport,
  downloadExcelReport
} from "../controllers/report.controller.js";
const router = express.Router();
router.get("/:clientId/pdf", downloadPdfReport);
router.get("/:clientId/excel", downloadExcelReport);
export default router;
