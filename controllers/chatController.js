import path from 'path';
import fs from 'fs';
import { convertToWav } from '../utils/audioConverter.js';
// Import all necessary functions from your service
import { transcribeAudio, generateAIResponse, generateInitiationResponse } from '../api/togetherApi.js';

// This function handles ongoing chat messages that include an audio file
export const handleChat = async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }
  const convertedFilePath = path.join(audioFile.destination, `${audioFile.filename}.wav`);

  try {
    // 1. Convert Audio
    await convertToWav(audioFile.path, convertedFilePath);
    
    // 2. Transcribe Audio
    const { mode, roleplayTopic, language, history } = req.body; // Correctly get history
    const userText = await transcribeAudio(convertedFilePath, language);
    console.log(`User said: ${userText}`);

    // 3. Get AI Response
    // Pass the history to the service so the AI has context
    const aiText = await generateAIResponse(userText, mode, roleplayTopic, language, JSON.parse(history || '[]'));
    console.log(`AI says: ${aiText}`);

    // 4. Send Response
    res.json({ userText, aiReply: aiText });

  } catch (error) {
    console.error("Error in handleChat:", error.message);
    res.status(500).json({ error: "Failed to process chat request." });
  } finally {
    // 5. Clean up files
    fs.unlink(audioFile.path, () => {});
    fs.unlink(convertedFilePath, () => {});
  }
};

// NEW: This function handles starting a conversation, without an audio file
export const handleInitiateChat = async (req, res) => {
    try {
        const { language, mode, roleplayTopic } = req.body;
        // Call the dedicated service function for generating an opening line
        const aiText = await generateInitiationResponse(language, mode, roleplayTopic);
        console.log(`AI initiated with: ${aiText}`);
        res.json({ aiReply: aiText });
    } catch (error) {
        console.error('Error initiating chat:', error.message);
        res.status(500).json({ error: 'Failed to initiate chat.' });
    }
};