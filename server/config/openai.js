import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
let openaiClient = null;
export const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to server/.env."
    );
  }
  if (!process.env.OPENAI_MODEL) {
    throw new Error(
      "OPENAI_MODEL is missing. Add it to server/.env."
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openaiClient;
};

