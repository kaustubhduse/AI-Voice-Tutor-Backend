import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

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
  "free-chat-mr-IN": [],
  "At School-mr-IN": [],
  "free-chat-gu-IN": [],
  "At School-gu-IN": [],
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build the prompt
const buildPrompt = (userText, mode, roleplayTopic, language) => {
  let roleDescription = `You are SpeakGenie, a friendly AI English tutor for a child.`;

  if (mode === "roleplay") {
    switch (roleplayTopic) {
      case "At the Store":
        roleDescription = `You are a cheerful shopkeeper. The child is your customer.`;
        break;
      case "At School":
        roleDescription = `You are a kind teacher. The child is a new student.`;
        break;
      case "At Home":
        roleDescription = `You are a caring parent. The child just came home.`;
        break;
    }
  }

  const historyKey = `${
    mode === "roleplay" ? roleplayTopic : "free-chat"
  }-${language}`;
  const historyForPrompt = (chatHistory[historyKey] || [])
    .slice(-10)
    .map((item) => `Child: ${item.user}\nGenie: ${item.ai}`)
    .join("\n");

  // 🔥 Language rule
  let languageRule = "Respond in English.";
  if (language === "hi-IN") languageRule = "Respond ONLY in Hindi (हिन्दी).";
  if (language === "mr-IN") languageRule = "Respond ONLY in Marathi (मराठी).";
  if (language === "gu-IN") languageRule = "Respond ONLY in Gujarati (ગુજરાતી).";

  return `You are SpeakGenie, a friendly tutor for kids (6–16).
Role: ${roleDescription}

Rules:
1. Keep answers short (1–2 sentences).
2. Encourage and add emojis.
3. Ask only one question at a time.
4. ${languageRule}

Conversation so far:
${historyForPrompt}

Child: "${userText}"
Genie:`;
};

// Generate response
export const generateAIResponse = async (
  userText,
  mode,
  roleplayTopic,
  language = "en-US"
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = buildPrompt(userText, mode, roleplayTopic, language);

    const result = await model.generateContent(prompt);

    let aiText = result.response.text();
    if (!aiText) aiText = "🤖 Sorry, I didn’t understand. Can you try again?";
    aiText = aiText.trim();

    const historyKey = `${
      mode === "roleplay" ? roleplayTopic : "free-chat"
    }-${language}`;
    chatHistory[historyKey] = [
      ...(chatHistory[historyKey] || []),
      { user: userText, ai: aiText },
    ];

    return aiText;
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    throw new Error("AI response generation failed");
  }
};
