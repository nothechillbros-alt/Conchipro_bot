const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Configuración
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
    console.log("Mensaje recibido:", ctx.message.text);
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{ role: "user", content: ctx.message.text }],
        });

        await ctx.reply(response.content[0].text);
    } catch (err) {
        console.error("ERROR DETECTADO:", err.message);
        // Esto nos dirá en Telegram qué está pasando realmente
        await ctx.reply("Error: " + err.message);
    }
});

bot.launch().then(() => console.log("=> Bot Conchipro_bot conectado a Telegram"));

app.get('/', (req, res) => res.send('Servidor de Conchipro_bot Activo'));
app.listen(port, () => console.log(`Puerto ${port} listo`));
