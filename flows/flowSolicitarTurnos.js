const {
    addKeyword,
    addAnswer,
    EVENTS,
  } = require("@bot-whatsapp/bot");


//Solicitar turnos
module.exports = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "Si necesitas solicitar un turno de Anses o Viajar por un estudio médico con anticipación comunicate a este número: https://wa.me/5493794051686?text=Hola%20quisiera%20solicitar%20un%20turno%20para%20Anses/Viajar%20por%20un%20estudio%20médico"
  )
  .addAnswer("¿En qué más puedo ayudarte?", {
    delay: 1000,  
  })
  .addAnswer("Escribe *Menu* para volver al menú principal", { delay: 1000 });
