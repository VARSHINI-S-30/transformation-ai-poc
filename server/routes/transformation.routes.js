import express from "express";
import {
  generateRoadmap,getRoadmap
} from "../controllers/transformation.controller.js";
const router = express.Router();
router.post("/generate/:clientId", generateRoadmap);
router.get("/roadmap/:clientId", getRoadmap);
export default router;