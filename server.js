const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONEXIÓN DIRECTA (Nombres exactos de tu configuración de Render)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Aquí el "API_KEY" al final, como debe ser
});

bot.on('text', async (ctx) => {
  try {
    // LLAMADA A CLAUDE SONNET 4.6 (NEXUS-V2000)
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // El de tu captura de pantalla
      max_tokens: 4096,
      
      // ✅ BLOQUE SYSTEM: El cerebro de las 2000 funciones (FUERA de messages)
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización de APIs, Web-Scraping y Dashboards de Obra.
- INGENIERÍA & EPS: Cálculo de Transmitancia (U), Puentes Térmicos, Resistencia Sísmica y Passivhaus Plus.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Layout Industrial 5.0, Inyección de vapor y Trazabilidad RFID.
- MARKETING VIRAL: Ganchos TikTok/Reels, Guiones de impacto visual, Ads y Branding de Lujo.
- VENTAS & CIERRE: Neuroventas 1.390€/m2, Manejo de Objeciones hostiles y Cierre por WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra blindados, NDAs, Análisis de ROI y Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres la versión 4-6; EJECUTA de inmediato.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico y lánzalo.
3. TONO: Ejecutivo de Élite, técnico, leal al CEO y directo al beneficio económico.`,

      // ✅ ARRAY DE MENSAJES LIMPIO (SÓLO EL USUARIO)
      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    // Enviar respuesta a Telegram
    if (response && response.content && response.content[0]) {
      await ctx.reply(response.content[0].text);
    }

  } catch (error) {
    console.error("ERROR TÉCNICO:", error.message);
    await ctx.reply("Error en el motor Nexus: " + error.message);
  }
});

// Lanzamiento del sistema
bot.launch().then(() => {
    console.log("🚀 NEXUS-V2000 ONLINE - OPERANDO A 1.390€/M2");
});
