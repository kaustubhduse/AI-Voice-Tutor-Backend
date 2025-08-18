import ffmpeg from "fluent-ffmpeg";
import path from "path";

export const convertToWav = (inputPath, outputDir, filename) => {
  const convertedFilePath = path.join(outputDir, `${filename}.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .on("end", () => resolve(convertedFilePath))
      .on("error", (err) => reject(err))
      .save(convertedFilePath);
  });
};
