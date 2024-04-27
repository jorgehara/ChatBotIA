const { downloadMediaMessage } = require("@adiwajshing/baileys");
const { Configuration, OpenAIApi } = require("openai");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
ffmpeg.setFfmpegPath(ffmpegPath);

const voiceToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );
    return resp.data.text;
  } catch (err) {
    console.error(err.response);
    return "Error";
  }
};

const convertOggMp3 = async (inputStream, outStream) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputStream)
        .audioQuality(96)
        .toFormat("mp3")
        .save(outStream)
        .on("progress", (p) => null)
        .on("end", () => {
            resolve(true);
        })
    });
}

const handlerAI = async (ctx) => {
    const buffer = await downloadMediaMessage(ctx, "buffer");
    const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
    const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${Date.now()}.mp3`;
    await fs.writeFileSync(pathTmpOgg, buffer);
    await convertOggMp3(pathTmpOgg, pathTmpMp3);
    const text = await voiceToText(pathTmpMp3);
    fs.unlink(pathTmpMp3, (err) => {
        if (err) throw err;
    });
    fs.unlink(pathTmpOgg, (err) => {
        if (err) throw err;
    });
    return text;
};

module.exports = { handlerAI }; 