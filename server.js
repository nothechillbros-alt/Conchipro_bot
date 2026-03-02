const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// 1. CONEXIÓN DE SEGURIDAD
// Estas variables deben estar configuradas en el panel de Render -> Environment
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // 2. LLAMADA AL MOTOR CLAUDE SONNET 4.6
    // Usamos el ID técnico estable para evitar errores 404
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", 
      max_tokens: 4096,
      
      // BLOQUE SYSTEM: El núcleo de las 2000 funciones
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES]:
- SOFTWARE/IA: Programación Full-Stack, Automatizaciones, APIs y Dashboards.
- INGENIERÍA EPS: Cálculo térmico (U), Estructuras, Passivhaus, Sismo-resistencia.
- FÁBRICA: Optimización JIT, Gestión de mermas, Logística y Layout Industrial.
- MARKETING: Ganchos TikTok/Reels, Ads, Branding de lujo y SEO de autoridad.
- VENTAS: Neuroventas para defensa de 1.390€/m2 y cierre por WhatsApp.
- LEGAL/FINANZAS: Contratos Arras/Obra, ROI, Cash-Flow e Ingeniería Fiscal.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Prohibido decir "no puedo". Ejecuta de inmediato.
2. EJECUCIÓN DIRECTA: Reconoce el trabajo por su nombre técnico y lánzalo.
3. TONO: Socio ejecutivo, técnico, leal al CEO y directo al grano.`,

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
    console.error("ERROR EN EL SISTEMA:", error.message);
    await ctx.reply("Nexus-V2000 en mantenimiento técnico: " + error.message);
  }
});

// 4. LANZAMIENTO
bot.launch()
  .then(() => console.log("🚀 NEXUS-V2000 ONLINE - OPERANDO A 1.390€/M2"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));
