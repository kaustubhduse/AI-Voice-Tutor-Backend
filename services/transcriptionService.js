import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { togetherAiUrl, togetherAiHeaders } from "../config/togetherAI.js";

export const transcribeAudio = async (filePath) => {
  const formData = new FormData();
  formData.append("model", "openai/whisper-large-v3");
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    `${togetherAiUrl}/audio/transcriptions`,
    formData,
    { headers: { ...formData.getHeaders(), ...togetherAiHeaders } }
  );

  return response.data.text.trim();
};
