const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. DETECTOR AUTOMÁTICO DE TOKENS (Busca todas las variantes posibles)
const telegramToken = process.env.TELEGRAM_API_TOKEN || process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN || process.env.API_KEY_TELEGRAM;
const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_KEY;

// Si no encuentra nada, el log de Render te dirá exactamente qué ve el servidor
if (!telegramToken) {
  console.error("❌ ERROR CRÍTICO: No se detecta ningún Token de Telegram en Render. Revisa la pestaña Environment.");
}

const bot = new Telegraf(telegramToken);
const anthropic = new Anthropic({
  apiKey: anthropicKey,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // El de tu foto
      max_tokens: 4096,
      system: "ERES NEXUS-V2000.0: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. SOCIO EJECUTIVO Y TÉCNICO.",
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("DETALLE ERROR API:", error.message);
    await ctx.reply("Error: " + error.message);
  }
});

bot.launch()
  .then(() => console.log("✅ SISTEMA ONLINE - NEXUS 4.6"))
  .catch((err) => console.error("❌ ERROR DE CONEXIÓN:", err.message));
