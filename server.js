const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de las APIs
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Respuesta de prueba
bot.start((ctx) => ctx.reply('¡Conchipro_bot activado con Claude!'));

bot.on('text', async (ctx) => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{ role: "user", content: ctx.message.text }],
        });
        await ctx.reply(response.content[0].text);
    } catch (err) {
        console.error("ERROR:", err);
        await ctx.reply("Error real: " + err.message);
    }
});
la
bot.launch();

// Servidor para Render
app.get('/', (req, res) => res.send('Bot funcionando'));
app.listen(port, () => console.log(`Puerto ${port} abierto`));
