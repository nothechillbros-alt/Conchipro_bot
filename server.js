const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// 1. Configuración de APIs
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 2. Lógica del Bot con Claude
bot.on('text', async (ctx) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // El modelo más potente de Claude
      max_tokens: 1024,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    await ctx.reply(msg.content[0].text);
  } catch (error) {
    console.error("Error con Claude:", error);
    await ctx.reply("Lo siento, mi conexión con Claude ha fallado.");
  }
});

// 3. Lanzar bot y servidor
bot.launch().then(() => console.log('=> Bot con Claude funcionando'));
app.get('/', (req, res) => res.send('Bot de Claude Activo'));
app.listen(port);
