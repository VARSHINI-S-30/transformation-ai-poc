
import {
  regeneratePlan,
  getPlanVersionHistory
} from "../services/whatIf.service.js";

export const createWhatIfVersion = async (req, res, next) => {
  try {
    const { planType, clientId } = req.params;
    const { month, week, scenario } = req.body;

    const result = await regeneratePlan({
      planType,
      clientId,
      month,
      week,
      scenario
    });

    res.status(201).json({
      success: true,
      message: "Revised plan generated and saved.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getWhatIfVersions = (req, res, next) => {
  try {
    const { planType, clientId } = req.params;
    const { month, week } = req.query;

    const data = getPlanVersionHistory({
      planType,
      clientId,
      month,
      week
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
