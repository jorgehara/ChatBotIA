require("dotenv").config();
const {
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const path = require("path");
const fs = require("fs");
const chatGPT = require("../chatgpt");

const promptConsultasPath = path.join(
    "mensajes",
    "promptConsultas.txt"
);
const promptConsultas = fs.readFileSync(promptConsultasPath, "utf8");

//Flow consultas ChatGPT
module.exports = addKeyword(EVENTS.ACTION)
  .addAnswer("Intentemos resolver tu consulta 😊...", { delay: 100 })
  .addAnswer(
    "Escribe tu consulta *aqui* 👇",
    { delay: 100, capture: true },
    async (ctx, ctxFn) => {
      let prompt = promptConsultas;
      let consulta = ctx.body;
      let answer = await chatGPT(prompt, consulta);
      await ctxFn.flowDynamic(answer.content);
    }
  )
  .addAnswer(
    "¿Necesitas más información?, sólo cuentame e intentaré resolver tus consultas",
    {
      // delay: 5000,
      capture: true,
    },
    async (ctx, ctxFn) => {
      let prompt = promptConsultas;
      let consulta = ctx.body;
      let answer = await chatGPT(prompt, consulta);
      await ctxFn.flowDynamic(answer.content);
    }
  )
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });
