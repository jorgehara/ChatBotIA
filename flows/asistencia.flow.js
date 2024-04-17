
const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const fs = require('fs')
const path = require('path')
const { chat } = require('../services/chatgpt')



/**
 * FLujo Inteligente (va a ser activado por una intencion de una persona o por palabra clave)
 * Flujo de bienvenida
 */

module.exports = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic }) => {
        // const currentState = state.getMyState()
        const pathAsistencia = path.join(__dirname, '/prompts', 'promptAsistencia.txt')
        const prompt = fs.readFileSync(pathAsistencia, 'utf8')

        const answ = await chat(prompt, ctx.body)
        return flowDynamic(answ.content)
    }
    )



// const { addKeyword } = require("@bot-whatsapp/bot");
// const { handlerStripe } = require("../services/stripe");
// /**
//  * Flujo de bienvenida
//  */
// module.exports = addKeyword('pagar')
// .addAnswer('dame un momento para generarte un link de pago...')
// .addAnswer('¿Cual es tu email?',{capture:true}, async (ctx, {fallBack, flowDynamic}) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const email = ctx.body;
//     const phone = ctx.from

//     if(!emailRegex.test(email)){
//         return fallBack(`Debe ser un mail correcto! esto *${email}* NO es un mail`)
//     }

//     const link = await handlerStripe(phone, email)
//     await flowDynamic(`Aqui tienes el link: ${link.url}`)
// })
