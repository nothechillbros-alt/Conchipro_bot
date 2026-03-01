const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración del Bot y la IA
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Lógica de respuesta
bot.on('text', async (ctx) => {
  try {
    // El bot envía lo que escribes a Gemini
    const result = await model.generateContent(ctx.message.text);
    const response = await result.response;
    // El bot te responde en Telegram
    ctx.reply(response.text());
  } catch (error) {
    console.error("Error en el bot:", error);
    ctx.reply("Lo siento, Conchi, algo ha fallado. Revisa los Logs en Render.");
  }
});

// Lanzamiento
bot.launch();
console.log("🚀 Conchipro_bot encendido y listo en la nube!");

