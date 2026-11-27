import {
  generateWeeklyPlan,
  getWeeklyPlanByClient
} from "../services/weeklyPlan.service.js";

export const createWeeklyPlan = async (req, res, next) => {
  try {
    const { clientId, month, week } = req.params;

    const plan = await generateWeeklyPlan(
      clientId,
      month,
      week
    );

    res.status(201).json({
      success: true,
      message: "Weekly plan generated successfully.",
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyPlanDetails = (req, res, next) => {
  try {
    const { clientId, month, week } = req.params;
    const plan = getWeeklyPlanByClient(
      clientId,
      month,
      week
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Weekly plan not found."
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};