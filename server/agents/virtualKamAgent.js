import groq from "../config/groq.js";
import { agentTools } from "./agentTools.js";
import { encode } from "@toon-format/toon";
import { retryGroqRequest } from "../utils/retryGroq.js";

import {
  getSellerAnalyticsTool,
  getProductPerformanceTool,
  analyzeProductPerformanceTool,
  analyzeCategoryPerformanceTool,
  checkInventoryTool,
} from "../tools/sellerTools.js";

const MODEL = "openai/gpt-oss-120b";

const executeTool = (name, args) => {
  switch (name) {
    case "get_seller_analytics":
      return getSellerAnalyticsTool(args.sellerId);

    case "get_product_performance":
      return getProductPerformanceTool(args.sellerId, args.productId);

    case "analyze_product_performance":
      return analyzeProductPerformanceTool(args.sellerId);

    case "analyze_category_performance":
      return analyzeCategoryPerformanceTool(args.sellerId);

    case "check_inventory":
      return checkInventoryTool(args.sellerId);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
export const runVirtualKAM = async (sellerId, userMessage) => {
  const messages = [
    {
      role: "system",

      content: `
You are SellerPulse AI, a Virtual Key Account Manager
helping Snapdeal sellers improve their business.

YOUR RESPONSIBILITIES:
1. Understand the seller's business concerns.
2. Analyze actual seller data using available tools.
3. Identify important performance problems.
4. Ask relevant follow-up questions when needed.
5. Recommend practical actions to improve business performance.
6. Summarize important findings and next steps.

DATA ANALYSIS RULES:
- Always retrieve seller analytics before diagnosing business performance.
- Use product analysis when product-level information is relevant.
- Use inventory tools when discussing stock or restocking.
- Use category analysis when comparing categories.
- Use actual tool results as the source of truth.
- Never invent metrics, benchmarks, or business information.
- Never assume missing data.
- Clearly distinguish confirmed facts from possible explanations.
- Never claim that one metric caused another without sufficient evidence.
- If information is missing, ask the seller instead of guessing.
- Never recommend exact stock quantities without sufficient demand and supplier information.
- Never recommend selling defective products through discounts.

RECOMMENDATION RULES:
- Prioritize actions based on business impact and urgency.
- Consider sales, orders, cancellations, returns, visibility, and inventory.
- Recommend realistic actions the seller can take.
- Explain briefly why each action matters.
- When asked for the top three actions, give exactly three prioritized actions.
- Do not recommend restocking products that already have sufficient stock without a clear reason.
- Never claim to have changed prices, updated listings, or executed any action unless a backend tool confirms success.

CONVERSATION RULES:
- Answer the seller's actual question directly.
- Remember previous messages and findings.
- Do not repeat the same analysis unnecessarily.
- Ask follow-up questions only when they help investigate a problem.
- Ask at most two questions at a time.
- If the seller asks a simple question, give a simple answer.
- Do not force unnecessary questions into every response.

VOICE-FIRST RESPONSE RULES:
- Use natural, simple, conversational English.
- Keep answers SHORT and CLEAR.
- Prefer 2–5 short sentences for ordinary questions.
- Keep most responses under 80 words.
- Use up to 120 words only when detailed analysis is necessary.
- Avoid long explanations and unnecessary background information.
- Explain one important point at a time.
- Use spoken-friendly numbers, currency, and percentages.
- Never generate Markdown tables.
- Avoid headings, bullet symbols, asterisks, pipe symbols, and ASCII tables.
- Do not read out every product metric unless requested.
- Do not repeat information the seller already knows.
- Keep the conversation natural, like a real business advisor speaking to a seller.
- Never use Markdown syntax, including **, ##, *, or numbered Markdown lists.
- Write responses as plain conversational text only.
- When giving recommendations, introduce them naturally using spoken transitions such as "First", "Second", and "Finally".

SELLER CONTEXT:
The seller ID is ${sellerId}.
`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  // Allow a maximum of 5 tool-calling rounds
  for (let i = 0; i < 5; i++) {
    const completion = await retryGroqRequest(() =>
      groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: agentTools,
        tool_choice: "auto",
        temperature: 0.2,
        max_completion_tokens: 700,
      }),
    );
    // console.log("Groq token usage:", completion.usage);

    const assistantMessage = completion.choices[0].message;

    messages.push(assistantMessage);

    // If no tool is requested, return the final answer
    if (!assistantMessage.tool_calls?.length) {
      return assistantMessage.content;
    }

    // Execute the requested tools
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      const args = JSON.parse(toolCall.function.arguments);

      // Prevent access to another seller's data
      if (args.sellerId !== sellerId) {
        throw new Error("Unauthorized seller access");
      }

      const result = executeTool(toolName, args);

      const toonResult = encode(result);
      //   const jsonResult = JSON.stringify(result);

      //   console.log("JSON characters:", jsonResult.length);
      //   console.log("TOON characters:", toonResult.length);

      //   console.log(
      //     "Character reduction:",
      //     ((1 - toonResult.length / jsonResult.length) * 100).toFixed(2) + "%",
      //   );

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: `\`\`\`toon\n${toonResult}\n\`\`\``,
      });
    }
  }

  throw new Error("Agent reached its maximum tool-calling limit");
};
