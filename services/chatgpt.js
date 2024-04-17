const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

/**
 *
 * @param {*} text
 */

const chat = async (prompt, text, last2) => {
    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: `Historial de conversacion: ${last2} Pregunta a responder: ${text}` },
            ],
        });
        return completion.data.choices[0].message;
    } catch (err) {
        console.log(err.response.data);
        return "ERROR";
    }
};

/**
 * 
 * @returns 
 */


const completion = async (dataIn = "") => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: dataIn,
        max_tokens: 210,
        temperature: 0,
    });

    return response
}

module.exports = { chat, completion };