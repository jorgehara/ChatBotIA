const {
    addKeyword,
    EVENTS,
  } = require("@bot-whatsapp/bot");

const path = require("path");

const srcPath = path.join(__dirname, "../src", "Horarios habituales.png");

//Actividades y tareas diarias
module.exports = addKeyword(EVENTS.ACTION)
  .addAnswer("😊👉 Conoce nuestras actividades diarias", {
    delay: 1000,
    media: srcPath,
  })
  .addAnswer("¿En qué más puedo ayudarte?", {
    delay: 1000,
  })
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });

