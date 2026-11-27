import express from "express";
import {
  createWeeklyPlan,getWeeklyPlanDetails
} from "../controllers/weeklyPlan.controller.js";
const router = express.Router();
router.post("/generate/:clientId/:month/:week",createWeeklyPlan);
router.get("/:clientId/:month/:week",getWeeklyPlanDetails);
export default router;