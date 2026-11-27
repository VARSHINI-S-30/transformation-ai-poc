
import { getOpenAIClient } from "../config/openai.js";

export const testOpenAIConnection = async () => {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL,
    input: "Reply with exactly: OpenAI connection successful."
  });

  if (response.status !== "completed") {
    throw new Error(
      `OpenAI response did not complete. Status: ${response.status}`
    );
  }

  return response.output_text;
};
