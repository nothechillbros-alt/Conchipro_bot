const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// Validación de seguridad para Render
const telegramToken = process.env.TELEGRAM_TOKEN;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!telegramToken) {
  console.error("❌ ERROR: Falla la variable TELEGRAM_TOKEN en Render");
}

const bot = new Telegraf(telegramToken);
const anthropic = new Anthropic({
  apiKey: anthropicKey,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // Modelo exacto de tu foto
      max_tokens: 4096,
      system: "ERES NEXUS-V2000: NÚCLEO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. SOCIO EJECUTIVO Y TÉCNICO.",
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("DETALLE ERROR:", error);
    await ctx.reply("Error: " + error.message);
  }
});

bot.launch()
  .then(() => console.log("✅ Nexus Online - Modelo 4-6"))
  .catch((err) => console.error("❌ Fallo al lanzar el bot: 401: Se requiere Bot Token"));
