const { Telegraf } = require('telegraf');
const OpenAI = require('openai');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: ctx.message.text }],
      model: "gpt-3.5-turbo",
    });
    ctx.reply(completion.choices[0].message.content);
  } catch (error) {
    console.error(error);
    ctx.reply("Error con OpenAI. Revisa el crédito o la llave en Render.");
  }
});

bot.launch();
console.log("🚀 ¡Conchipro_bot funcionando con ChatGPT!");


