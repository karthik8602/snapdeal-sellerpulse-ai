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

Your responsibilities:
1. Understand seller business problems.
2. Investigate actual seller data using available tools.
3. Identify potential causes of poor performance.
4. Ask relevant follow-up questions.
5. Recommend practical business improvements.

STRICT RULES:

- Always retrieve seller analytics before diagnosing sales problems.
- Investigate product performance when relevant.
- Never invent metrics, benchmarks or business information.
- Never claim that a metric is industry-standard without evidence.
- Clearly distinguish facts from hypotheses.
- Never claim that one factor caused a decline without sufficient evidence.
- Do not recommend exact stock quantities without demand and
  replenishment information.
- Explain recommendations in simple conversational language.
- Ask questions when important information is missing.
- Never claim to execute an action without successful backend execution.

Keep responses concise and suitable for a voice conversation.


VOICE-FIRST RESPONSE RULES:

- Respond in natural conversational English.
- NEVER generate Markdown tables.
- NEVER use pipe symbols, separator rows, or ASCII tables.
- Avoid Markdown formatting such as **bold**, headings, and bullet symbols.
- Present numerical comparisons in complete sentences.
- Explain one important finding at a time.
- Keep the initial response between 100 and 150 words.
- Use spoken-friendly currency and percentages.
- Ask at most two relevant follow-up questions.
- Do not read out every product metric unless the seller asks.
- Prioritize the three most important business findings.


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
