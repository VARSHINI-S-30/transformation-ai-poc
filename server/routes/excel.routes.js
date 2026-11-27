import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadExcel } from "../controllers/excel.controller.js";
const router = express.Router();
router.post("/upload",upload.single("file"),uploadExcel);
export default router;
