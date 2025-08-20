import ffmpeg from 'fluent-ffmpeg';


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