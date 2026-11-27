import express from "express";
import { checkAIConnection } from "../controllers/ai.controller.js";
const router = express.Router();
router.get("/test", checkAIConnection);
export default router;
