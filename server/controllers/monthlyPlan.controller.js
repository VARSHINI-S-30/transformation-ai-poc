import {
  generateMonthlyPlan,
  getMonthlyPlanByClient
} from "../services/monthlyPlan.service.js";

export const createMonthlyPlan = async (req, res, next) => {
  try {
    const { clientId, month } = req.params;

    const plan = await generateMonthlyPlan(clientId, month);

    res.status(201).json({
      success: true,
      message: "Monthly plan generated successfully.",
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyPlanDetails = (req, res, next) => {
  try {
    const { clientId, month } = req.params;

    const plan = getMonthlyPlanByClient(clientId, month);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Monthly plan not found."
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