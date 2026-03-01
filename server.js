const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Puerto para que Render no dé error de puerto
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot Vivo 🚀'));
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

bot.on('text', async (ctx) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [{ role: "user", content: ctx.message.text }],
    });
    ctx.reply(msg.content[0].text);
  } catch (error) {
    console.error(error);
    ctx.reply("Conchi, hay un problema con la conexión a Claude.");
  }
});

bot.launch();
console.log("🚀 Conchipro_bot con Claude encendido!");
