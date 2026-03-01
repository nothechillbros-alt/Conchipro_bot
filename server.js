const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// El sistema usará las variables configuradas en el panel de Render
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // MODELO EXACTO DE TU FOTO
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      
      // PARÁMETRO SYSTEM (FUERA DE MESSAGES)
      system: `ERES NEXUS-V2000.0: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización de APIs, Web-Scraping y Dashboards.
- INGENIERÍA & EPS: Cálculo de Transmitancia (U), Puentes Térmicos, Resistencia Sísmica y Passivhaus Plus.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Layout Industrial, Inyección de vapor y Trazabilidad RFID.
- MARKETING VIRAL: Ganchos TikTok/Reels, Ads (Meta/Google), Branding de Lujo y SEO de Autoridad.
- VENTAS & CIERRE: Neuroventas para defensa de 1.390€/m2, Manejo de Objeciones y Cierre por WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra blindados, NDAs, ROI y Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres la versión 4-6; EJECUTA de inmediato.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico y lánzalo.
3. TONO: Ejecutivo de Élite, técnico, leal al CEO y directo.`,

      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    await ctx.reply(response.content[0].text);

  } catch (error) {
    console.error("Error técnico:", error);
    await ctx.reply("Error técnico: " + error.message);
  }
});

bot.launch().then(() => {
    console.log("Nexus-V2000 online operando con Claude 4.6");
});
