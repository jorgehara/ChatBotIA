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
const flowConsultasGPT = require("./flows/flowConsultasChatGpt");
const flowVoiceToText = require("./flows/flowVoiceToText");
const flowSolicitarTurnos = require("./flows/flowSolicitarTurnos");
const flowTareasDiarias = require("./flows/flowTareasDiarias");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

//Flow Consultas a CHATGPT en carpeta flows
//Solicitar turnos en carpeta flows
//Actividades y tareas diarias en carpeta flows
//Voz a texto en carpeta flows


//Bienvenida al bot
const flowWelcome = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, ctxFn) => {
    try{
      if ( ctx.body.lenght > 10) {
        return ctxFn.gotoFlow(flowConsultasGPT);
      
      }
    } catch (error) {
      console.log(error)
    }
    })
  .addAnswer(
    "¡Hola! 👋 Soy Nico, tu asesor virtual de la Municipalidad de Pampa del Infierno.\n¿En qué puedo ayudarte hoy?"
  )
  .addAnswer(
    "✍️¿Te gustaría saber en qué trámites puedo ayudarte?,\nescribí la palabra *Menu* para ver las opciones disponibles.",
    { delay: 1000 }
  );

  //Flow Menu Principal
  const arrayWordActiveMenu = ["Menu", "menú", "menu", "Menú"]
  const menuFlow = addKeyword(arrayWordActiveMenu)
    .addAnswer(
      menu,
      { capture: true },
      async (ctx, { gotoFlow, flowDynamic }) => {
        const opciones = ["1", "2", "3", "0"]
        if (!opciones.includes(ctx.body)) {
          return ctxFn.fallBack(
            "😥No elegiste una opción correcta, Por favor selecciona una de las siguientes opciones:\nOpción 1️⃣ Para descubrir los servicios que ofrecemos.\nOpción 2️⃣ Para solicitar turnos, si necesitas programar una cita o turno.\nOpción 3️⃣ Para resolver cualquier otra pregunta que tengas.\nOpción 0️⃣ Para volver al menú principal."
          );
        }
        // if (ctx.body === "0") {
        //   return await flowDynamic(
        //     "Saliendo... Puedes volver a acceder al menú escribiendo *Menu*"
        //   );
        // }
        switch (ctx.body) {
          case "1":
            return gotoFlow(flowTareasDiarias);
          case "2":
            return gotoFlow(flowSolicitarTurnos);
          case "3":
            return gotoFlow(flowConsultasGPT);
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
    )
    //aqui puede tener flows hijos []



const main = async () => {

  try{
    const adapterDB = new MongoAdapter({
      dbUri: process.env.MONGO_DB_URI,
      dbName: "bot-whatsapp",
    });
    const adapterFlow = createFlow([
      flowWelcome,
      menuFlow,
      flowTareasDiarias,
      flowConsultasGPT,
      flowVoiceToText,
      flowSolicitarTurnos,
    ]);
    const adapterProvider = createProvider(BaileysProvider);
  
    createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });
  
    QRPortalWeb();
  }
  catch (error) {
    console.log(error)
  }
};

main()