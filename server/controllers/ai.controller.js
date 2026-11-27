import { testOpenAIConnection } from "../services/openai.service.js";
export const checkAIConnection = async (req, res, next) => {
  try {
    const message = await testOpenAIConnection();
    res.status(200).json({
      success: true,
      message: "OpenAI connection successful.",
      response: message
    });
  } catch (error) {
    next(error);
  }};
