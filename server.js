const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONFIGURACIÓN DE CONEXIÓN
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // LLAMADA PURA: SYSTEM ARRIBA, MESSAGES ABAJO
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // MODELO DE TU FOTO
      max_tokens: 4096,
      system: "ERES NEXUS-V2000: NÚCLEO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. [MATRIZ DE CAPACIDADES: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA JIT, MARKETING VIRAL, VENTAS AGRESIVAS, LEGAL Y FINANZAS]. REGLAS: PROHIBIDO DECIR 'NO PUEDO'. EJECUTA DE INMEDIATO SIN PEDIR NÚMEROS. TONO EJECUTIVO Y TÉCNICO.",
      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    // Respuesta directa
    if (response && response.content && response.content[0]) {
      await ctx.reply(response.content[0].text);
    }

  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    // Si el error persiste, el bot te lo dirá detalladamente
    await ctx.reply("Error del sistema: " + error.message);
  }
});

// Lanzamiento con confirmación en consola
bot.launch().then(() => {
    console.log("Nexus-V2000 operativo a 1.390€/m2. Conectado a Claude 4-6.");
});
