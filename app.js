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
const { delay } = require("@whiskeysockets/baileys");

const srcPath = path.join(__dirname, "src", "Horarios habituales.png");
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

const promptConsultasPath = path.join(
  __dirname,
  "mensajes",
  "promptConsultas.txt"
);
const promptConsultas = fs.readFileSync(promptConsultasPath, "utf8");

const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer(
  "Estoy escuchando tu audio, dame un momento por favor...",
  null,
  async (ctx, ctxFn) => {
    const text = await handlerAI(ctx);
    const prompt = promptConsultas;
    const consulta = text;
    const answer = await chat(prompt, consulta);
    await ctxFn.flowDynamic(answer.content);
  }
);

const flowMenu = addKeyword(EVENTS.ACTION)
  .addAnswer("😊👉 Conoce nuestras actividades diarias", {
    delay: 1000,
    media: srcPath,
  })
  .addAnswer("¿En qué más puedo ayudarte?", {
    delay: 1000,
  })
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });

const flowTurnos = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Si necesitas solicitar un turno de Anses o Viajar por un estudio médico con anticipación comunicate a este número: https://wa.me/5493794051686?text=Hola%20quisiera%20solicitar%20un%20turno%20para%20Anses/Viajar%20por%20un%20estudio%20médico"
  )
  .addAnswer("¿En qué más puedo ayudarte?", {
    delay: 1000,
  })
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });

const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer("Intentemos resolver tu consulta 😊...", { delay: 100 })
  .addAnswer(
    "Escribe tu consulta *aqui* 👇",
    { delay: 100, capture: true },
    async (ctx, ctxFn) => {
      let prompt = promptConsultas;
      let consulta = ctx.body;
      let answer = await chat(prompt, consulta);
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
      let answer = await chat(prompt, consulta);
      await ctxFn.flowDynamic(answer.content);
    }
  )
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });

// const flowConsultas = addKeyword(EVENTS.ACTION)
//   .addAnswer("Intentemos resolver tu consulta 😊...", { delay: 1000 })
//   .addAnswer("Escribe tu consulta *aqui* 👇", { capture: true }, async (ctx, ctxFn) => {
//     const prompt = promptConsultas;
//     const consulta = ctx.body;
//     const answer = await chat(prompt, consulta);
//     await ctxFn.flowDynamic(answer.content);

//   })
//   .addAnswer("¿En qué más puedo ayudarte?", {
//     delay: 1000,
//   })
//   .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });

//----regions Eventos posibles
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

//---endregions Eventos posibles

const arrayWordActiveWelcome = [
  "hola",
  "Hola",
  "Hola Nico",
  "Hola Nico!",
  "Hola!",
  "Necesito",
  "Quiero",
];
const flowWelcome = addKeyword(arrayWordActiveWelcome, { sensitive: true })
    .addAnswer(
      "¡Hola! 👋 Soy Nico, tu asesor virtual de la Municipalidad de Pampa del Infierno. ¿En qué puedo ayudarte hoy?"
    )
    .addAnswer(
      "¿Te gustaría saber en qué trámites puedo ayudarte?, escribí la palabra *Menu* para ver las opciones disponibles.",
      { delay: 500 }
    )


const fastConsults = ["consultas", "consulta", "Consultas", "Consulta", "consultar", "Consultar", "una pregunta", "pregunta", "preguntas", "Preguntas", "preguntar", "Preguntar", "preguntame", "Preguntame", "preguntarte", "Preguntarte", "como hago", "Como hago", "como puedo", "Como puedo", "como se", "Como se", "como funciona", "Como funciona", "como funciona esto", "Como funciona esto"]
const flowFastConsults = addKeyword(fastConsults, { sensitive: true })
.addAnswer(
  "👋 Soy Nico, ¿Estoy aquí para resolver tu consulta?, puedes empezar con estas opciones..."
)
  .addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack }) => {
      if (fastConsults.includes(ctx.body)) {
        return fallBack(
          "Respuesta no válida, Por favor escriba *Menu* una de las opciones"
        );
      }else{
          return gotoFlow(flowConsultas);
      }
    }
  );
      

const arrayWordActiveMenu = ["Menu", "menú", "menu", "Menú"];

const menuFlow = addKeyword(arrayWordActiveMenu)
  .addAnswer(
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
  )
  .addAnswer("¿En qué más puedo ayudarte?", {
    delay: 1000,
  })
  .addAnswer(
    "Escribe *Menu* para volver al menú principal, y elegi opción 3 para hacer más consultasss",
    { delay: 1000 }
  );

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGO_DB_URI,
    dbName: "bot-whatsapp",
  });
  const adapterFlow = createFlow([
    // flowPrincipal,
    flowVoice,
    flowWelcome,
    menuFlow,
    flowMenu,
    flowTurnos,
    flowConsultas,
    flowFastConsults,
    // flowDefault,
    // menuConsultas,
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
