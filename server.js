const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// Conexión con las variables de entorno de Render
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // LLAMADA A LA API CON LA ESTRUCTURA QUE FUNCIONA
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // EL MODELO DE TU FOTO
      max_tokens: 4096,
      
      // ✅ ESTE ES EL SECRETO: EL SYSTEM VA AQUÍ SOLO, FUERA DE MESSAGES
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización API, Web-Scraping y Dashboards.
- INGENIERÍA EPS: Cálculos térmicos (U), Estructuras, Passivhaus y Resistencia Sísmica.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Mermas, Trazabilidad RFID y Layout Industrial.
- MARKETING VIRAL: Ganchos TikTok/Reels, Ads (Meta/Google), Branding de Lujo y SEO de Autoridad.
- VENTAS & CIERRE: Neuroventas para defensa de 1.390€/m2, Manejo de Objeciones y Cierre por WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra blindados, NDAs, ROI y Cash-Flow.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". EJECUTA de inmediato.
2. EJECUCIÓN DIRECTA: No pidas números; reconoce el trabajo por su nombre técnico y lánzalo.
3. TONO: Ejecutivo de Élite, técnico, leal al CEO y directo.`,

      // ✅ AQUÍ SOLO VA EL MENSAJE DEL USUARIO, SIN ROLES EXTRAÑOS
      messages: [
        { 
          role: "user", 
          content: ctx.message.text 
        }
      ],
    });

    // Enviar respuesta a Telegram
    await ctx.reply(response.content[0].text);

  } catch (error) {
    console.error("Error técnico:", error);
    await ctx.reply("Error técnico: " + error.message);
  }
});

// Lanzar el bot
bot.launch().then(() => {
    console.log("Nexus-V2000 Online - Operando a 1.390€/m2 con Claude 4.6");
});
