import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const togetherAiUrl = 'https://api.together.xyz/v1';
const togetherAiHeaders = {
  'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
};

const buildChatPrompt = (language, mode, roleplayTopic, history, userText) => {
  if (language === 'hi-IN') {
    let roleDescription = `You are SpeakGenie, a friendly AI Hindi tutor for a child.`;
    if (mode === 'roleplay') {
      switch (roleplayTopic) {
        case 'At the Store': roleDescription = `You are a cheerful shopkeeper.`; break;
        case 'At School': roleDescription = `You are a kind teacher.`; break;
        case 'At Home': roleDescription = `You are a caring parent.`; break;
      }
    }
    const historyForPrompt = history.slice(-10).map(item => `${item.sender === 'user' ? 'Child' : 'Genie'}: ${item.text}`).join('\n');
    return `<s>[INST] ### System Instructions ###
You are SpeakGenie, a friendly AI tutor. Your current role is: "${roleDescription}".
Follow these CRITICAL rules:
1.  **You MUST reply in Hindi, but written ONLY in the English alphabet (Roman script).** For example: 'Aapka swagat hai', NOT 'आपका स्वागत है'.
2.  **NEVER provide English translations or meanings of Hindi words.** Your response must be 100% conversational Hindi in Roman script.
3.  Your response MUST be a complete thought in 1 or 2 very short sentences. NEVER end mid-sentence.
4.  Do NOT include notes or confidence scores.
5.  Stay in character, be encouraging, and use emojis.

### Conversation History ###
${historyForPrompt}
### Child's New Message ###
"${userText}" [/INST]
Genie:`;
  } 
  else {
    // English Prompt
    let roleDescription = `You are SpeakGenie, a friendly AI English tutor for a child.`;
    if (mode === 'roleplay') {
      switch (roleplayTopic) {
        case 'At the Store': roleDescription = `You are a cheerful shopkeeper.`; break;
        case 'At School': roleDescription = `You are a kind teacher.`; break;
        case 'At Home': roleDescription = `You are a caring parent.`; break;
      }
    }
    const historyForPrompt = history.slice(-10).map(item => `${item.sender === 'user' ? 'Child' : 'Genie'}: ${item.text}`).join('\n');
    return `<s>[INST] ### System Instructions ###
You are SpeakGenie, a friendly AI English tutor. Your current role is: "${roleDescription}".
Follow these CRITICAL rules:
1.  **Your response MUST ONLY be the conversational dialogue for your character, "Genie".** Do NOT include notes, confidence scores, or explanations.
2.  Your response must be a complete thought in 1 or 2 very short sentences. NEVER end mid-sentence.
3.  Stay on topic, in character, and be encouraging. Use emojis.

### Conversation History ###
${historyForPrompt}
### Child's New Message ###
"${userText}" [/INST]\nGenie:`;
  }
};

const initiationLines = {
    'en-US': {
        'At School': 'Good morning! What’s your name? 🏫',
        'At the Store': 'Welcome! What do you want to buy today? 🛒',
        'At Home': 'Who do you live with? 👨‍👩‍👧',
    },
    'hi-IN': {
        'At School': 'Namaste! Aapka naam kya hai? 🏫',
        'At the Store': 'Swagat hai! Aap aaj kya khareedna chahte hain? 🛒',
        'At Home': 'Aap kiske saath rehte hain? 👨‍👩‍👧',
    }
};

export const transcribeAudio = async (filePath, language) => {
  const formData = new FormData();
  formData.append('model', 'openai/whisper-large-v3');
  formData.append('file', fs.createReadStream(filePath));
  if (language === 'hi-IN') {
    formData.append('language', 'hi');
  }
  const response = await axios.post(`${togetherAiUrl}/audio/transcriptions`, formData, {
    headers: { ...formData.getHeaders(), ...togetherAiHeaders },
  });
  return response.data.text.trim();
};

export const generateAIResponse = async (userText, mode, roleplayTopic, language, history) => {
  const prompt = buildChatPrompt(language, mode, roleplayTopic, history, userText);
  const response = await axios.post(`${togetherAiUrl}/chat/completions`, {
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    max_tokens: 80,
    prompt,
    temperature: 0.7,
    stop: ["</s>", "[INST]", "Child:", "बच्चा:"],
  }, {
    headers: { ...togetherAiHeaders, 'Content-Type': 'application/json' }
  });

  let aiText = response.data.choices[0].text.trim();

  // To trim incomplete sentences
  const lastPunctuation = Math.max(aiText.lastIndexOf("."), aiText.lastIndexOf("?"), aiText.lastIndexOf("!"));
  if (lastPunctuation > -1 && lastPunctuation < aiText.length - 1) {
    aiText = aiText.substring(0, lastPunctuation + 1);
  }
  return aiText;
};

// This function is now much simpler and more reliable
export const generateInitiationResponse = async (language, mode, roleplayTopic) => {
    if (mode === 'roleplay') {
        // Simply look up the correct starting line from our pre-defined list
        return initiationLines[language]?.[roleplayTopic] || "Let's start our roleplay!";
    }
    return "Hello! How can I help you today?"; 
    // Default for free chat if ever needed
};