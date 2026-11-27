import express from "express";
import {
  createWhatIfVersion,
  getWhatIfVersions
} from "../controllers/whatIf.controller.js";
const router = express.Router();
router.post("/:planType/:clientId", createWhatIfVersion);
router.get("/:planType/:clientId/versions", getWhatIfVersions);
export default router;
