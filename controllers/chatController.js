import { convertToWav } from "../services/audioService.js";
import { transcribeAudio } from "../services/transcriptionService.js";
import { generateAIResponse, generateInitiationResponse } from "../services/aiService.js";
import { deleteFile } from "../utils/cleanUp.js";
import path from "path";
import fs from "fs";

export const handleChat = async (req, res) => {
  const audioFile = req.file;
  if (!audioFile) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }
  const convertedFilePath = path.join(audioFile.destination, `${audioFile.filename}.wav`);

  try {
    const { mode, roleplayTopic, language, history } = req.body;
    
    await convertToWav(audioFile.path, convertedFilePath);
    
    const userText = await transcribeAudio(convertedFilePath, language);
    console.log(`User said: ${userText}`);

    const aiText = await generateAIResponse(userText, mode, roleplayTopic, language, JSON.parse(history || '[]'));
    console.log(`AI says: ${aiText}`);

    res.json({ userText, aiReply: aiText });

  } catch (error) {
    console.error("Error in handleChat:", error.message);
    res.status(500).json({ error: "Failed to process chat request." });
  } finally {
    fs.unlink(audioFile.path, () => {});
    fs.unlink(convertedFilePath, () => {});
  }
};

// This function handles starting a new roleplay conversation
export const handleInitiateChat = async (req, res) => {
    try {
        const { language, mode, roleplayTopic } = req.body;
        const aiText = await generateInitiationResponse(language, mode, roleplayTopic);
        console.log(`AI initiated with: ${aiText}`);
        res.json({ aiReply: aiText });
    } catch (error) {
        console.error('Error initiating chat:', error.message);
        res.status(500).json({ error: 'Failed to initiate chat.' });
    }
};