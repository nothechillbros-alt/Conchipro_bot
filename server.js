const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. Usamos nombres de variables estándar
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", 
      max_tokens: 4096,
      system: "ERES NEXUS-V2000: NÚCLEO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. SOCIO EJECUTIVO Y TÉCNICO.",
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("ERROR API:", error.message);
    await ctx.reply("Error: " + error.message);
  }
});

// Lanzamiento con aviso claro en logs
bot.launch()
  .then(() => console.log("🚀 SISTEMA ONLINE"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));
