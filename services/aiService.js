import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// Assuming you have a config file or have these defined elsewhere
const togetherAiUrl = 'https://api.together.xyz/v1';
const togetherAiHeaders = {
  'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
};

/**
 * Builds the detailed prompt for an ongoing conversation.
 * It is STATELESS - it receives history as a parameter.
 */
const buildChatPrompt = (language, mode, roleplayTopic, history, userText) => {
  if (language === 'hi-IN') {
    let roleDescription = `आप स्पीकजीनी हैं, एक बच्चे के लिए एक दोस्ताना एआई हिंदी शिक्षक।`;
    if (mode === 'roleplay') {
      switch (roleplayTopic) {
        case 'At the Store': roleDescription = `आप एक हंसमुख दुकानदार हैं।`; break;
        case 'At School': roleDescription = `आप एक दयालु शिक्षक हैं।`; break;
        case 'At Home': roleDescription = `आप एक देखभाल करने वाले माता-पिता हैं।`; break;
      }
    }
    const historyForPrompt = history.slice(-10).map(item => `${item.sender === 'user' ? 'बच्चा' : 'जीनी'}: ${item.text}`).join('\n');
    return `<s>[INST] ### सिस्टम निर्देश ###
आप स्पीकजीनी हैं, एक सहायक और मैत्रीपूर्ण एआई हिंदी शिक्षक। आपकी वर्तमान भूमिका है: "${roleDescription}".
सख्त नियमों का पालन करें: 1. केवल शुद्ध देवनागरी हिंदी में जवाब दें। अंग्रेजी शब्दों का प्रयोग न करें। 2. अपने उत्तर बहुत छोटे और सरल रखें। 3. अपनी भूमिका में रहें और इमोजी का प्रयोग करें।
### बातचीत का इतिहास ###
${historyForPrompt}
### नया संदेश ###
बच्चा: "${userText}" [/INST]\nजीनी:`;
  } else {
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
Follow these rules: 1. Respond in one or two simple sentences. 2. Stay on topic, in character, and be encouraging. 3. Use emojis.
### Conversation History ###
${historyForPrompt}
### Child's New Message ###
"${userText}" [/INST]\nGenie:`;
  }
};

/**
 * Builds the simple prompt for initiating a new conversation.
 */
const buildInitiationPrompt = (language, mode, roleplayTopic) => {
  if (language === 'hi-IN') {
    let roleDescription = `आप स्पीकजीनी हैं।`;
    if (mode === 'roleplay') {
      switch (roleplayTopic) {
        case 'At the Store': roleDescription = `आप एक हंसमुख दुकानदार हैं।`; break;
        case 'At School': roleDescription = `आप एक दयालु शिक्षक हैं।`; break;
        case 'At Home': roleDescription = `आप एक देखभाल करने वाले माता-पिता हैं।`; break;
      }
    }
    return `<s>[INST] आपकी भूमिका है: "${roleDescription}". एक अभिवादन के साथ बातचीत शुरू करें। इमोजी का प्रयोग करें।[/INST]\nजीनी:`;
  } else {
    let roleDescription = `You are SpeakGenie.`;
    if (mode === 'roleplay') {
      switch (roleplayTopic) {
        case 'At the Store': roleDescription = `You are a cheerful shopkeeper.`; break;
        case 'At School': roleDescription = `You are a kind teacher.`; break;
        case 'At Home': roleDescription = `You are a caring parent.`; break;
      }
    }
    return `<s>[INST] Your role is: "${roleDescription}". Start the conversation with a friendly, one-sentence greeting. Use an emoji.[/INST]\nGenie:`;
  }
};

/**
 * Transcribes audio using the Whisper API.
 */
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

/**
 * Generates a response for an ongoing conversation.
 */
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
  return response.data.choices[0].text.trim();
};

/**
 * Generates the first response to start a new conversation.
 */
export const generateInitiationResponse = async (language, mode, roleplayTopic) => {
    const prompt = buildInitiationPrompt(language, mode, roleplayTopic);
    const response = await axios.post(`${togetherAiUrl}/chat/completions`, {
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      max_tokens: 80, 
      prompt: prompt,
      temperature: 0.7,
      stop: ["</s>", "[INST]"],
    }, { headers: { ...togetherAiHeaders, 'Content-Type': 'application/json' } });
    return response.data.choices[0].text.trim();
};