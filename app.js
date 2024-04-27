require("dotenv").config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const path = require("path");
const fs = require("fs");
const chat = require("./chatGPT");
const { handlerAI } = require("./whisper");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

const promptConsultasPath = path.join(__dirname, "mensajes", "promptConsultas.txt");
const promptConsultas = fs.readFileSync(promptConsultasPath, "utf8");

const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer("Esta es una Nota de Voz", null, async (ctx, ctxFn) => {
  const text = await handlerAI(ctx);
  const prompt = promptConsultas;
  const consulta = text;
  const answer = await chat(prompt, consulta);
  await ctxFn.flowDynamic(answer.content);
});

const flowMenu = addKeyword(EVENTS.ACTION).addAnswer("Este es el Flow Menu", {
  media: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUIKMJO0rd3bfbtK5s7R64I-wq9_xGahG5txyrqkyd5qr41Oiv2X2x8AcFx4Fh1-Pe1tZ5D_8U3SQfBoUYuxR44V37CU86ZPuIHlWplRxyB3hiXuHsSAxnXqv6shwp8RbxPLtmYcyQ_C3UHNMwK3orgpYNeTHuHIwqAi-jlCPH-Ltd6U3KScq5iKu6/s1280/HolaMuni%20Chatbot.jpg",
});

const flowTurnos = addKeyword(EVENTS.ACTION).addAnswer("Este es el Flow Turnos, para solicitar un turno de Anses con anticipación comunicate a este número: https://wa.me/5493794051686?text=Hola%20quisiera%20solicitar%20un%20turno%20para%20Anses");

const flowConsultas = addKeyword(EVENTS.ACTION)
.addAnswer("Este es el Flow Consultas")
.addAnswer("Hace tu Consulta", { capture: true }, async (ctx, ctxFn) => {
  const prompt = promptConsultas;
  const consulta = ctx.body;
  const answer = await chat(prompt, consulta);
  await ctxFn.flowDynamic(answer.content);
  // console.log( answer );
});

//-------- regions Eventos posibles
// EVENTS.WELCOME
// const flowWelcome = addKeyword(EVENTS.WELCOME)
// .addAnswer('Bienvenido a Bot Whatsapp')
//comienza cuando no coincide con ninguna palabra clave
// EVENTS.MEDIA
// const flowMedia = addKeyword(EVENTS.MEDIA)
// .addAnswer('📄 Aquí encontras las documentación recuerda que puedes mejorarla')
//comienza cuando se recibe una imagen o video
// EVENTS.LOCATION
// const flowLocation = addKeyword(EVENTS.LOCATION)
// .addAnswer('este es el flujo de location')
//comienza cuando se recibe una ubicación
// EVENTS.DOCUMENT
// const flowDocument = addKeyword(EVENTS.DOCUMENT)
// .addAnswer('este es el flujo de documentos')
//comienza cuando se recibe un documento PDF, WORD
// EVENTS.VOICE_NOTE
// const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE)
// .addAnswer('este es el flujo de notas de voz')
//comienza cuando se recibe una nota de voz

// EVENTS.ACTION ESPECIAL
// const flowAction = addKeyword(EVENTS.ACTION)
// .addAnswer('este es el flujo de acciones')
//comienza cuando se recibe un evento especial porque no se activa por una acción directa del usuario,
//sino que debe ser llamado explícitamente desde otra función dentro del código del bot

//-------- endregions Eventos posibles

const flowWelcome = addKeyword(EVENTS.WELCOME)
  .addAnswer("Bienvenido a Bot Whatsapp")
  .addAnswer("Que puedo hacer por ti?")
  .addAnswer(
    "Este es el flujo de bienvenida",
    {
      delay: 100,
      // media: "https://media.giphy.com/media/3o7TKz9b1Ud8n7R9Ic/giphy.gif",
      //se puede mandar una imagen que esté almacenada de manera local
    },
    async (ctx, ctxFn) => {
      if (ctx.body.includes("Casas")) {
        await ctxFn.flowDynamic("Escribiste Casas");
      } else {
        await ctxFn.flowDynamic("Escribiste otra cosa");
      }

      // console.log(ctx.body)
      //await ctxFn.flowDynamic('Este es un mensaje desde flowDynamic')
    }
  );

const menuFlow = addKeyword("Menu").addAnswer(
  menu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!["1", "2", "3", "0"].includes(ctx.body)) {
      return fallBack(
        "Respuesta no válida, Por favor selecciona una de las opciones"
      );
    }
    switch (ctx.body) {
      case "1":
        return gotoFlow(flowMenu);
      case "2":
        return gotoFlow(flowTurnos);
      case "3":
        return gotoFlow(flowConsultas);
      case "0":
        return await flowDynamic(
          "Saliendo... Puedes volver a acceder al menú escribiendo *Menu*"
        );
    }
  }
);

const main = async () => {
  const adapterDB = new MongoAdapter(
    {
      dbUri: process.env.MONGO_DB_URI,
      dbName: "bot-whatsapp"
    }
  );
  const adapterFlow = createFlow([
    // flowPrincipal,
    flowVoice,
    flowWelcome,
    menuFlow,
    flowMenu,
    flowTurnos,
    flowConsultas,
  ]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();

//-----regions Código base de prueba

// const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

// const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
//     [
//         '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
//         'https://bot-whatsapp.netlify.app/',
//         '\n*2* Para siguiente paso.',
//     ],
//     null,
//     null,
//     [flowSecundario]
// )

// const flowTuto = addKeyword(['tutorial', 'tuto']).addAnswer(
//     [
//         '🙌 Aquí encontras un ejemplo rapido',
//         'https://bot-whatsapp.netlify.app/docs/example/',
//         '\n*2* Para siguiente paso.',
//     ],
//     null,
//     null,
//     [flowSecundario]
// )

// const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
//     [
//         '🚀 Puedes aportar tu granito de arena a este proyecto',
//         '[*opencollective*] https://opencollective.com/bot-whatsapp',
//         '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
//         '[*patreon*] https://www.patreon.com/leifermendez',
//         '\n*2* Para siguiente paso.',
//     ],
//     null,
//     null,
//     [flowSecundario]
// )

// const flowDiscord = addKeyword(['discord']).addAnswer(
//     ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
//     null,
//     null,
//     [flowSecundario]
// )

//------endsregions Código base de prueba
