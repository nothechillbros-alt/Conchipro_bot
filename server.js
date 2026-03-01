const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// 1. Configuración de APIs
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 2. Lógica del Bot de Telegram
bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot Conchipro. ¿En qué puedo ayudarte?'));

bot.on('text', async (ctx) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error OpenAI:", error);
        await ctx.reply("Ups, tengo un problema con mi cerebro de IA.");
    }
});

// 3. Lanzar el bot
bot.launch()
    .then(() => console.log('=> Bot de Telegram en marcha'))
    .catch((err) => console.error('Error al lanzar Telegram:', err));

// 4. Servidor web (para que Render no se queje)
app.get('/', (req, res) => res.send('Bot funcionando correctamente'));
app.listen(port, () => console.log(`Servidor web en puerto ${port}`));

