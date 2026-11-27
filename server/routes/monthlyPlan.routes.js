import express from "express";
import {createMonthlyPlan,getMonthlyPlanDetails
} from "../controllers/monthlyPlan.controller.js";
const router = express.Router();
router.post("/generate/:clientId/:month", createMonthlyPlan);
router.get("/:clientId/:month", getMonthlyPlanDetails);
export default router;