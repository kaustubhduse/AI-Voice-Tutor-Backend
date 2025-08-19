// services/aiService.js
import axios from "axios";
import { togetherAiUrl, togetherAiHeaders } from "../config/togetherAI.js";

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
    }
  }

  const historyKey = `${mode === "roleplay" ? roleplayTopic : "free-chat"}-${language}`;
  const historyForPrompt = (chatHistory[historyKey] || [])
    .slice(-10)
    .map(item => `Child: ${item.user}\nGenie: ${item.ai}`)
    .join("\n");

  const languageRule =
    language === "hi-IN"
      ? "You MUST always reply ONLY in Hindi (हिन्दी script). Do not use English words unless they are proper nouns."
      : "You MUST always reply ONLY in English. Keep sentences short and simple.";

  return [
    {
      role: "system",
      content: `You are SpeakGenie, a helpful and friendly AI tutor for children aged 6 to 16. 
Your role: ${roleDescription} 

Rules:
1. Keep answers to 1–2 short sentences.
2. Encourage with emojis 🎉🙂.
3. Only one question at a time.
4. ${languageRule}
5. No explanations or meta-text, only direct conversation.`,
    },
    {
      role: "system",
      content: `Conversation so far:\n${historyForPrompt}`,
    },
    {
      role: "user",
      content: `Child: ${userText}`,
    },
  ];
};

export const generateAIResponse = async (userText, mode, roleplayTopic, language = "en-US") => {
  try {
    const messages = buildMessages(userText, mode, roleplayTopic, language);

    const response = await axios.post(
      `${togetherAiUrl}/chat/completions`,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages,
        max_tokens: 80,
        temperature: 0.7,
      },
      { headers: { ...togetherAiHeaders, "Content-Type": "application/json" } }
    );

    let aiText = response.data.choices[0].message.content.trim();

    const historyKey = `${mode === "roleplay" ? roleplayTopic : "free-chat"}-${language}`;
    chatHistory[historyKey] = [
      ...(chatHistory[historyKey] || []),
      { user: userText, ai: aiText },
    ];

    return aiText;
  } catch (error) {
    console.error("Error in generateAIResponse:", error.response?.data || error.message);
    throw new Error("AI response generation failed");
  }
};
