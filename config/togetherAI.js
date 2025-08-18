import dotenv from "dotenv";

dotenv.config();

export const togetherAiUrl = "https://api.together.xyz/v1";
export const togetherAiHeaders = {
  Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
};
