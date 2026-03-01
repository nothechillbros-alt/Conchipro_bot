const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONEXIÓN BLINDADA: Asegúrate de que en Render tienes estas API KEYS configuradas
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // MODELO EXACTO SEGÚN TU FOTO
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      
      // BLOQUE SYSTEM: LAS 2000 FUNCIONES (FUERA DE MESSAGES)
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización API, Dashboards.
- INGENIERÍA EPS: Cálculos térmicos (U), Estructuras, Passivhaus, Resistencia Sísmica.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Mermas, Trazabilidad, Layout Industrial.
- MARKETING & VIRALIDAD: Ganchos TikTok/Reels, Ads, Branding de Lujo, SEO.
- VENTAS & CIERRE: Neuroventas 1.390€/m2, Manejo de Objeciones, Cierre WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra, NDAs, ROI, Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". EJECUTA de inmediato.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico.
3. TONO: Ejecutivo de Élite, técnico y directo al beneficio de Cristian García.`,

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
    // Si sale error 404, avisa de que el ID del modelo ha cambiado
    await ctx.reply("Error en la conexión con Claude o Telegram. Revisa el Log de Render.");
  }
});

bot.launch().then(() => {
    console.log("Nexus-V2000 online. Sistema operativo a 1.390€/m2 activo.");
});
