const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const fs = require('fs')
const path = require('path')
const { chat } = require('../services/chatgpt')

module.exports = addKeyword(EVENTS.ACTION).addAction(async (ctx, { state, flowDynamic }) => {
    try {
        const pathMesaEntrada = path.join(__dirname, '/prompts', 'promptMesaEntrada.txt')
        const prompt = fs.readFileSync(pathMesaEntrada, 'utf8')

        const answ = await chat(prompt, ctx.body)
        return flowDynamic(answ.answer) // Corregido aquí, cambiando answ.content a answ.answer
    } catch (error) {
        console.error(error)
        return "ERROR"
    }
})
