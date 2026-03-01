const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONFIGURACIÓN DE CONEXIÓN (Nombres exactos de Render)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN); 
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Aquí el "API" suele ir al final del nombre
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      // EL BLOQUE SYSTEM: El cerebro de las 2000 funciones
      system: "ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. SOCIO EJECUTIVO Y TÉCNICO.",
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
    console.error("ERROR:", error.message);
    await ctx.reply("Error técnico: " + error.message);
  }
});

bot.launch().then(() => {
    console.log("✅ Nexus Online - Conexión restablecida con éxito");
});
