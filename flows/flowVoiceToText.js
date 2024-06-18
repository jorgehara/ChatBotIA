require("dotenv").config();
const {
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const { handlerAI } = require("../whisper");
const chatGPT = require("../chatgpt");


//Voz a texto
module.exports = addKeyword(EVENTS.VOICE_NOTE).addAnswer(
    "Estoy escuchando tu audio, dame un momento por favor...",
    null,
    async (ctx, ctxFn) => {
      const text = await handlerAI(ctx);
      const prompt = promptConsultas;
      const consulta = text;
      const answer = await chatGPT(prompt, consulta);
      await ctxFn.flowDynamic(answer.content);
    }
  )