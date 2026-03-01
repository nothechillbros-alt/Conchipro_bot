const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// El sistema leerá estas variables directamente de Render
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // 1. MODELO EXACTO DE TU FOTO
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      
      // 2. BLOQUE SYSTEM FUERA DE MESSAGES (SOLUCIÓN ERROR 400)
      system: `ERES NEXUS-V2000.0: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización API, Dashboards.
- INGENIERÍA EPS: Cálculos térmicos (U), Estructuras, Passivhaus, Resistencia Sísmica.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Mermas, Trazabilidad, Layout Industrial.
- MARKETING & VIRALIDAD: Ganchos TikTok/Reels, Ads, Branding de Lujo, SEO.
- VENTAS & CIERRE: Neuroventas 1.390€/m2, Manejo de Objeciones, Cierre WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra, NDAs, ROI, Cash-Flow.

REGLAS DE ORO: No digas "no puedo". Eres Claude Sonnet 4-6. Ejecuta de inmediato sin pedir números. Tono ejecutivo y directo.`,

      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    await ctx.reply(response.content[0].text);

  } catch (error) {
    console.error("Error:", error);
    await ctx.reply("Error técnico: " + error.message);
  }
});

bot.launch().then(() => console.log("Nexus-V2000.0 Online"));
