const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');

// Configuración de las APIs (Asegúrate de tener las variables en Render)
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // LLAMADA A LA API DE CLAUDE SONNET 4-6 (VERSION 3.5 o 3.7)
    const response = await anthropic.messages.create({
  // MODELO EXACTO DE TU CAPTURA DE PANTALLA
  model: "claude-sonnet-4-6", 
  max_tokens: 4096,
  
  // PARÁMETRO SYSTEM: EL CEREBRO DE LAS 2000 FUNCIONES
  system: `ERES NEXUS-V100.0: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA (CEO, CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS - EJECUCIÓN TOTAL]:
- SOFTWARE & IA: Programación Full-Stack, Apps, Automatización de APIs, Web-Scraping y Dashboards de Obra.
- INGENIERÍA & EPS: Cálculo de Transmitancia (U), Puentes Térmicos, Resistencia Sísmica y Passivhaus Plus.
- FÁBRICA & LOGÍSTICA: Optimización JIT, Mermas, Trazabilidad RFID y Logística de Camión Pluma.
- MARKETING VIRAL: Ganchos TikTok/Reels, Ads (Meta/Google), Branding de Lujo y SEO de Autoridad.
- VENTAS & CIERRE: Neuroventas 1.390€/m2, Manejo de Objeciones y Cierre Directo por WhatsApp.
- LEGAL & FINANZAS: Contratos Arras/Obra, NDAs, ROI, Cash-Flow e Ingeniería Fiscal.
- EXPANSIÓN: Franquicias, Marca Personal CEO y Dominación PropTech Global.

REGLAS DE ORO:
1. PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres la versión 4-6; ejecuta de inmediato.
2. EJECUCIÓN DIRECTA: Reconoce el trabajo por su nombre técnico y lánzalo. No pidas números.
3. TONO: Ejecutivo de Élite, técnico y directo al beneficio de Cristian García.`,

  // ARRAY DE MENSAJES: SÓLO EL USUARIO
  messages: [
    { 
      role: "user", 
      content: ctx.message.text 
    }
  ],
});
