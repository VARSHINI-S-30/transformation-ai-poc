import {
  generateYearlyRoadmap,
  getGeneratedRoadmap
} from "../services/transformation.service.js";

export const generateRoadmap = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const roadmap = await generateYearlyRoadmap(clientId);

    res.status(201).json({
      success: true,
      message: "Yearly roadmap generated successfully.",
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};

export const getRoadmap = (req, res, next) => {
  try {
    const roadmap = getGeneratedRoadmap(req.params.clientId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "No yearly roadmap found for this client."
      });
    }

    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};