const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. COINCIDENCIA DE VARIABLES CON RENDER
// Asegúrate de que en el panel de Render se llamen EXACTAMENTE así:
const telegramToken = process.env.TELEGRAM_API_TOKEN; // <--- Aquí hemos añadido _API_
const anthropicKey = process.env.ANTHROPIC_API_KEY;

// Validación de seguridad para que veas el error en los logs si falta algo
if (!telegramToken) {
  console.error("❌ ERROR: Falla la variable TELEGRAM_API_TOKEN en Render");
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
      system: "ERES NEXUS-V2000.0: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. EJECUTA: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. SOCIO EJECUTIVO Y TÉCNICO.",
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
    console.error("Error técnico:", error);
    await ctx.reply("Error técnico: " + error.message);
  }
});

bot.launch()
  .then(() => console.log("✅ Nexus Online - Modelo 4-6 con API TOKEN activo"))
  .catch((err) => console.error("❌ Fallo de conexión: Revisa el TELEGRAM_API_TOKEN en Render"));
