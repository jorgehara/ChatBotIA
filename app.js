require('dotenv').config();

const {
  createBot,
  createProvider,
  createFlow,
} = require("@bot-whatsapp/bot");

const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MongoAdapter = require("@bot-whatsapp/database/mongo");

const welcomeFlow = require("./flows/welcome.flow");
const mesaEntradaFlow = require('./flows/mesaEntrada.flow')
const impuestosFlow = require('./flows/impuestos.flow')
const asistenciaFlow = require('./flows/asistencia.flow')

const {init} = require('bot-ws-plugin-openai');
const ServerAPI = require('./http');

/**
 * Configuracion de Plugin
 */
const employeesAddonConfig = {
  model: "gpt-3.5-turbo-16k",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};
const employeesAddon = init(employeesAddonConfig);

employeesAddon.employees([
  {
    name: "EMPLEADO_AREAMESADEENTRADA",
    description:'',
    flow: mesaEntradaFlow,
  },
  {
    name: "EMPLEADO_AREAIMPUESTOSMUNICIPALES",
    description:'',
    flow: impuestosFlow,
  },
  {
    name: "EMPLEADO_AREAASISTENCIASOCIAL",
    description: '',
    flow: asistenciaFlow,
  }
])

/**
 * Función principal para iniciar la aplicación
 */

const main = async () => {
  const uri = process.env.MONGO_URI;
  const adapterDB = new MongoAdapter(
    {
      dbUri: uri,
      dbName: "PampaBotyChatHistory",
    }
  );
  const adapterFlow = createFlow([
    welcomeFlow,
    mesaEntradaFlow,
    impuestosFlow,
    asistenciaFlow 
  ]);
  
  const adapterProvider = createProvider(BaileysProvider);

  const httpServer = new ServerAPI(adapterProvider, adapterDB)

  const configBot = {
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  }

  const configExtra = {
    extensions:{
      employeesAddon
    }
  }

  await createBot(configBot,configExtra);
  httpServer.start()
};

main();