import ffmpeg from 'fluent-ffmpeg';

/**
 * @param {string} inputPath - The full path to the input file (e.g., 'uploads/input.webm').
 * @param {string} outputPath - The full path to save the output file (e.g., 'uploads/output.wav').
 * @returns {Promise<void>} A promise that resolves when conversion is complete.
 */
export const convertToWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .on('end', () => {
        console.log('Audio conversion finished successfully.');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during audio conversion:', err);
        reject(err);
      })
      .save(outputPath);
  });
};