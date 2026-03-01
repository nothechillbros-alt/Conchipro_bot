<!-- end list -->
  const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

bot.on('text', async (ctx) => {
  try {
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    ctx.reply(response.text());
  } catch (error) {
    console.error(error);
    ctx.reply("Uy, algo ha fallado. Revisa las APIs.");
  }
});

bot.launch();
console.log("Conchipro_bot encendido!");
