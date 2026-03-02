const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONFIGURACIÓN DE CONEXIÓN
// Estas variables se leen directamente desde el panel de Render
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // 2. LLAMADA AL MOTOR CLAUDE SONNET 4.6 (NEXUS-V2000)
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // ID técnico estable para la versión 4.6
      max_tokens: 4096,
      
      // BLOQUE SYSTEM: El núcleo soberano (FUERA de messages para evitar Error 400)
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización de APIs, Web-Scraping y Dashboards.
- INGENIERÍA EPS: Cálculo de Transmitancia (U), Estructuras, Passivhaus y Resistencia Sísmica.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Layout Industrial, Inyección de vapor y Trazabilidad RFID.
- MARKETING VIRAL: Ganchos TikTok/Reels, Guiones de impacto visual, Ads y Branding de Lujo.
- VENTAS & CIERRE: Neuroventas para defensa de 1.390€/m2, Manejo de Objeciones y Cierre por WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra blindados, NDAs, ROI y Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres la versión 4-6; EJECUTA de inmediato.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico y lánzalo.
3. TONO: Ejecutivo de Élite, técnico, leal al CEO y directo al grano.`,

      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    // 3. RESPUESTA A TELEGRAM
    if (response && response.content && response.content[0]) {
      await ctx.reply(response.content[0].text);
    }

  } catch (error) {
    console.error("ERROR TÉCNICO:", error.message);
    // Si algo falla, el bot te dirá exactamente qué es en Telegram
    await ctx.reply("Nexus-V2000 en mantenimiento técnico: " + error.message);
  }
});

// 4. LANZAMIENTO
bot.launch()
  .then(() => console.log("🚀 NEXUS-V2000 ONLINE - OPERANDO A 1.390€/M2"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));
