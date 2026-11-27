import express from "express";
import {
  submitReview,
  listReviews
} from "../controllers/review.controller.js";
const router = express.Router();
router.get("/", listReviews);
router.post("/:clientId/:planType", submitReview);
export default router;
