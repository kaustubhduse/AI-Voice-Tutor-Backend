import path from 'path';
import fs from 'fs';
// These imports should match YOUR file structure
import { convertToWav } from '../utils/audioConverter.js'; 
import { transcribeAudio } from '../services/transcriptionService.js';
import { generateAIResponse, generateInitiationResponse } from '../services/aiService.js';
import { deleteFile } from '../utils/cleanUp.js';

// This function handles existing conversations
export const handleChat = async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }
  const convertedFilePath = path.join(audioFile.destination, `${audioFile.filename}.wav`);

  try {
    await convertToWav(audioFile.path, convertedFilePath);
    
    const { mode, roleplayTopic, language, history } = req.body;
    const userText = await transcribeAudio(convertedFilePath, language);
    console.log(`User said: ${userText}`);

    // Pass the history from the frontend to the service
    const aiText = await generateAIResponse(userText, mode, roleplayTopic, language, JSON.parse(history || '[]'));
    console.log(`AI says: ${aiText}`);

    res.json({ userText, aiReply: aiText });
  } catch (error) {
    console.error("Error in handleChat:", error.message);
    res.status(500).json({ error: "Failed to process chat request." });
  } finally {
    deleteFile(audioFile.path);
    deleteFile(convertedFilePath);
  }
};

// NEW function to handle starting a conversation
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