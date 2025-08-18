// services/aiService.js
import axios from "axios";
import { togetherAiUrl, togetherAiHeaders } from "../config/togetherAI.js";

let chatHistory = [];

/**
 * Build the prompt for the AI model
 */
const buildPrompt = (userText, mode, roleplayTopic) => {
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

  const historyForPrompt = chatHistory
    .map((item) => `[INST] Child: ${item.user} [/INST] Genie: ${item.ai}`)
    .join("\n");

  return `<s>[INST]
You are SpeakGenie, a helpful and friendly AI English tutor for children aged 6 to 16.
Your role: "${roleDescription}".

Rules:
1. Short answers (1-2 sentences).
2. Stay in character and on topic.
3. Encourage and use emojis.
4. Only one question at a time.
5. Reply in Hindi if asked in Hindi.
6. Don't include in your response anything related to ### New Message ###
7. Never keep the message incomplete

### Conversation History ###
${historyForPrompt}

Child: "${userText}"
[/INST]
Genie:`;
};

/**
 * Generate AI response using Together AI API
 */
export const generateAIResponse = async (userText, mode, roleplayTopic) => {
  try {
    const prompt = buildPrompt(userText, mode, roleplayTopic);

    const response = await axios.post(
      `${togetherAiUrl}/chat/completions`,
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        max_tokens: 80,
        prompt,
        temperature: 0.7,
        stop: ["</s>", "[INST]", "Child:"],
      },
      { headers: { ...togetherAiHeaders, "Content-Type": "application/json" } }
    );

    // Get text and clean any leftover markers
    let aiText = response.data.choices[0].text.trim();
    aiText = aiText.replace(/### New Message ###/g, '').trim();

    // Save to chat history
    chatHistory.push({ user: userText, ai: aiText });

    return aiText;
  } catch (error) {
    console.error("Error in generateAIResponse:", error.response?.data || error.message);
    throw new Error("AI response generation failed");
  }
};
