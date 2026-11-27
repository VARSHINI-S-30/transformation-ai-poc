import { getOpenAIClient } from "../config/openai.js";
export const generateStructuredJson = async ({
  schemaName,
  schema,
  instructions,
  input
}) => {
  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL,
    instructions,
    input: JSON.stringify(input),
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema
      }}});
  if (response.status !== "completed") {
    throw new Error(
      `AI response did not complete. Status: ${response.status}`
    );
  }
  if (!response.output_text) {
    throw new Error("AI returned an empty response.");
  }
  let parsed;
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    throw new Error("AI returned invalid JSON.");
  }
  return parsed;
};

