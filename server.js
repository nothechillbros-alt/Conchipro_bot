const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONFIGURACIÓN DE CONEXIÓN (Render leerá estas claves de tu panel)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // MODELO EXACTO SEGÚN TU FOTO 1
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      
      // ✅ BLOQUE SYSTEM: LAS 2000 FUNCIONES (SOLUCIÓN AL ERROR 400)
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización API, Web-Scraping.
- INGENIERÍA & EPS: Cálculos térmicos (U), Estructuras, Passivhaus, Resistencia Sísmica.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Mermas, Trazabilidad, Layout Industrial.
- MARKETING VIRAL: Ganchos TikTok/Reels, Ads (Meta/Google), Branding de Lujo.
- VENTAS & CIERRE: Neuroventas 1.390€/m2, Manejo de Objeciones, Cierre WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra, NDAs, ROI y Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres Claude 4-6; EJECUTA.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico.
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

// Lanzamiento del bot
bot.launch().then(() => {
    console.log("Nexus-V2000 online operando con Claude 4-6 a 1.390€/m2");
});
