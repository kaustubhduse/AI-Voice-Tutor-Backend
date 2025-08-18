import { convertToWav } from "../services/audioService.js";
import { transcribeAudio } from "../services/transcriptionService.js";
import { generateAIResponse } from "../services/aiService.js";
import { deleteFile } from "../utils/cleanUp.js";
import path from "path";

export const handleChat = async (req, res) => {
  const audioFile = req.file;
  const convertedFilePath = path.join(
    audioFile.destination,
    `${audioFile.filename}.wav`
  );

  try {
    // Convert → Transcribe → Generate AI Reply
    await convertToWav(audioFile.path, audioFile.destination, audioFile.filename);
    const userText = await transcribeAudio(convertedFilePath);
    const { mode, roleplayTopic } = req.body;
    const aiText = await generateAIResponse(userText, mode, roleplayTopic);

    res.json({ userText, aiReply: aiText });
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to process chat request." });
  } finally {
    deleteFile(audioFile.path);
    deleteFile(convertedFilePath);
  }
};
