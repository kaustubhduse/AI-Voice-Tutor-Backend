// services/aiService.js
import axios from "axios";
import { togetherAiUrl, togetherAiHeaders } from "../config/togetherAI.js";

// Chat history separated by role and language
let chatHistory = {
  "free-chat-en-US": [],
  "At School-en-US": [],
  "At the Store-en-US": [],
  "At Home-en-US": [],
  "free-chat-hi-IN": [],
  "At School-hi-IN": [],
  "At the Store-hi-IN": [],
  "At Home-hi-IN": [],
};

// Build chat messages (instead of a single prompt)
const buildMessages = (userText, mode, roleplayTopic, language) => {
  let roleDescription = `You are SpeakGenie, a friendly AI English tutor for a child.`;

  if (mode === "roleplay") {
    switch (roleplayTopic) {
      case "At the Store":
        roleDescription = `You are a cheerful shopkeeper. The child is your customer. Start by greeting them and asking what they want to buy.`;
        break;
      case "At School":
        roleDescription = `You are a kind teacher. The child is a new student. Start by greeting them and asking their name.`;
        break;
      case "At Home":
        roleDescription = `You are a caring parent. The child just came home. Start by asking about their day or who they live with.`;
        break;
      default:
        break;
    }
  }

  const historyKey = `${mode === "roleplay" ? roleplayTopic : "free-chat"}-${language}`;
  const history = (chatHistory[historyKey] || []).slice(-10); // last 10 turns

  const languageRule =
    language === "hi-IN"
      ? "Always respond ONLY in Hindi (हिन्दी), using simple words a child can understand."
      : "Always respond ONLY in English, using simple words a child can understand.";

  const system = `You are SpeakGenie, a helpful and friendly AI tutor for children aged 6 to 16.
Your current role is: "${roleDescription}".

Follow these CRITICAL rules:
1) Your entire response MUST be a complete thought in 1 or 2 short sentences.
2) NEVER end your response mid-sentence.
3) Stay in character and on topic.
4) Encourage and use emojis.
5) Only one question at a time.
6) ${languageRule}
7) Do NOT include any confidence scores, notes, or explanations. Plain conversation only.`;

  const messages = [{ role: "system", content: system }];

  // Add past conversation
  for (const turn of history) {
    messages.push({ role: "user", content: turn.user });
    messages.push({ role: "assistant", content: turn.ai });
  }

  // Current user message
  messages.push({ role: "user", content: userText });

  return { messages, historyKey };
};

/**
 * Generate AI response using Together AI /chat/completions with messages
 */
export const generateAIResponse = async (userText, mode, roleplayTopic, language = "en-US") => {
  try {
    const { messages, historyKey } = buildMessages(userText, mode, roleplayTopic, language);

    const response = await axios.post(
      `${togetherAiUrl}/chat/completions`,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        temperature: 0.7,
        max_tokens: 80,
        messages, // ✅ use chat messages
      },
      { headers: { ...togetherAiHeaders, "Content-Type": "application/json" } }
    );

    const aiText = response?.data?.choices?.[0]?.message?.content?.trim() || "";

    // Save to the appropriate chat history
    chatHistory[historyKey] = [
      ...(chatHistory[historyKey] || []),
      { user: userText, ai: aiText },
    ];

    // Keep return shape the same as before for your route that uses this
    return aiText;
  } catch (error) {
    console.error("Error in generateAIResponse:", error.response?.data || error.message);
    throw new Error("AI response generation failed");
  }
};
