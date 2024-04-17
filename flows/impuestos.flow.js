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
        const pathImpuestos = path.join(__dirname, '/prompts', 'promptImpuestos.txt')
        const prompt = fs.readFileSync(pathImpuestos, 'utf8')

        const answ = await chat(prompt, ctx.body)
        return flowDynamic(answ.content)
    }
    )