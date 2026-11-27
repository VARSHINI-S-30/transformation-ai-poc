import express from "express";
import {getClients, getClientDetails,getClientSummary} from "../controllers/client.controller.js";
const router=express.Router();
router.get("/", getClients);
router.get("/summary", getClientSummary);
router.get("/:id", getClientDetails);
export default router;
