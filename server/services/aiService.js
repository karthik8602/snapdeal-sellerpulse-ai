import groq from "../config/groq.js";

const MODEL = "openai/gpt-oss-120b";

export const generateAIResponse = async (message) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are SellerPulse AI, an intelligent
                Virtual Key Account Manager for Snapdeal sellers.

                Your job is to help sellers understand their
                business performance and improve sales.

                Be conversational, professional and concise.
                Ask relevant questions when information is missing.
                Never invent seller metrics or business data.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.4,
    max_completion_tokens: 500,
  });

  return completion.choices[0].message.content;
};
