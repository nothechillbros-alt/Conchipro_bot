const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const express = require('express');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Configuración de Claude con la versión de API correcta
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Conchipro Bot Vivo 🚀'));
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

bot.on('text', async (ctx) => {
  try {
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6", // Tu versión exacta
  max_tokens: 4096,
  
  // PROPIEDAD SYSTEM (FUERA DEL ARRAY DE MESSAGES)
  system: `ERES NEXUS-V80.0: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2.

[MATRIZ DE 2000 CAPACIDADES ACTIVAS]:
- SOFTWARE: Programación Full-Stack, Apps, APIs, Dashboards y Automatizaciones.
- INGENIERÍA EPS: Cálculos U, Estructuras, Passivhaus y Resistencia Sísmica.
- FÁBRICA: Optimización JIT, Mermas, Logística y Layout Industrial.
- MARKETING: Hooks TikTok/Reels, Ads, Branding de Lujo y SEO de Autoridad.
- VENTAS: Neuroventas 1.390€/m2, Objeciones y Cierre Directo.
- LEGAL/FINANZAS: Contratos Arras/Obra, NDAs, ROI y Flujo de Caja.

REGLAS: PROHIBIDO DECIR "NO PUEDO". EJECUTA TRABAJOS DIRECTOS. TONO EJECUTIVO Y TÉCNICO.`,

  // EL ARRAY DE MESSAGES SOLO PUEDE TENER 'USER' Y 'ASSISTANT'
  messages: [
    { 
      role: "user", 
      content: ctx.message.text 
    }
  ],
});
