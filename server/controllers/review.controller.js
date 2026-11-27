
import { getClientById } from "../store/clientStore.js";
import { addReview, getReviews } from "../store/reviewStore.js";

const validTypes = ["yearly", "monthly", "weekly"];
const validActions = ["approved", "changes_requested"];

export const submitReview = (req, res, next) => {
  try {
    const { clientId, planType } = req.params;
    const { action, notes, month, week, version } = req.body;

    if (!getClientById(clientId)) {
      return res.status(404).json({
        success: false,
        message: "Client not found."
      });
    }

    if (!validTypes.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type."
      });
    }

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be approved or changes_requested."
      });
    }

    if (action === "changes_requested" && !notes?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide notes explaining the requested changes."
      });
    }

    const review = addReview({
      clientId: String(clientId),
      planType,
      month: month ?? null,
      week: week ?? null,
      version: version ?? null,
      action,
      notes: notes || ""
    });

    res.status(201).json({
      success: true,
      message: "Coach review saved.",
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const listReviews = (req, res, next) => {
  try {
    const data = getReviews({
      clientId: req.query.clientId,
      planType: req.query.planType
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};
