import "dotenv/config";
import groq from "./config/groq.js";
import { encode } from "@toon-format/toon";
import { getSellerAnalytics } from "./services/analyticsService.js";

const MODEL = "openai/gpt-oss-120b";

const sellerData = getSellerAnalytics("SELLER001");

const jsonData = JSON.stringify(sellerData);
const toonData = encode(sellerData);

const systemPrompt = `
You are a seller business analyst.
Analyze the provided seller data.
Identify revenue changes, order changes, and product performance.
Use only the supplied data.
Keep your response concise.
`;

const userMessage = (data) => `
Analyze this seller data and identify the main performance issues:

${data}
`;

async function runTest(format, data) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage(data) },
    ],
    temperature: 0,
    max_completion_tokens: 300,
  });

  return {
    format,
    promptTokens: completion.usage.prompt_tokens,
    completionTokens: completion.usage.completion_tokens,
    totalTokens: completion.usage.total_tokens,
  };
}

const jsonResult = await runTest("JSON", jsonData);
const toonResult = await runTest("TOON", toonData);

console.log("\n--- TOKEN COMPARISON ---");
console.table([jsonResult, toonResult]);

const reduction =
  ((jsonResult.promptTokens - toonResult.promptTokens) /
    jsonResult.promptTokens) *
  100;

console.log("Prompt token reduction:", reduction.toFixed(2) + "%");
