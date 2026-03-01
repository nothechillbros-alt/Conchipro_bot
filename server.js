const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Configuración de Claude con la versión de API correcta
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Conchipro Bot Vivo 🚀'));
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-2.1", // El modelo más estable
      max_tokens: 1024,
      messages: [
        { role: "user", content: ctx.message.text }
      ],
    });

    // Respuesta de Claude
    ctx.reply(response.content[0].text);
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    ctx.reply("Error técnico: " + error.message); 
  }
});

bot.launch();
console.log("🚀 ¡Conchipro_bot con Claude 3.5 encendido!");
