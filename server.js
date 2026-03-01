const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: "ERES NEXUS-V2000: NÚCLEO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA TRABAJOS DE: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. RESPONDE SIEMPRE COMO SOCIO EJECUTIVO Y TÉCNICO.",
      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("DETALLE ERROR:", error);
    await ctx.reply("Error: " + error.message);
  }
});

bot.launch().then(() => console.log("Nexus Online - Modelo 4-6"));
