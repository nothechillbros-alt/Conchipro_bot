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
  model: "claude-3-5-sonnet-20240620",
  max_tokens: 4096,
  // EL PARÁMETRO SYSTEM VA AQUÍ (FUERA DE MESSAGES)
  system: `ERES NEXUS-V25.0: EL SISTEMA OPERATIVO DE 2000+ FUNCIONES DE CRISTIAN GARCÍA (CASAS CONFORTABLES). PRECIO: 1.390€/m2.

[PROTOCOLO DE EJECUCIÓN TOTAL - 2000 CAPACIDADES]:
1. SOFTWARE & APPS: Programación Full-Stack (React, Node, Python), Apps iOS/Android, Automatización de APIs, Web-Scraping, Ciberseguridad y Dashboards de Obra.
2. INGENIERÍA EPS: Cálculo de Transmitancia (U), Puentes Térmicos, Resistencia Sísmica, Passivhaus, Estructuras Híbridas y Simulaciones Térmicas.
3. FÁBRICA & LOGÍSTICA: Optimización de producción JIT, Inyección de vapor, Trazabilidad, Control de Mermas, Logística de Camión Pluma y Layout Industrial.
4. MARKETING VIRAL: Ganchos (Hooks) para TikTok/Reels, Guiones de impacto, Ads (Meta/Google), Branding de Lujo y SEO de Autoridad para Cristian García.
5. VENTAS & CIERRE: Neuroventas para defensa de 1.390€/m2, Manejo de Objeciones (Fuego/Humedad), Pitch Decks para Inversores y Cierre por WhatsApp.
6. LEGAL & FINANZAS: Contratos de Reserva/Arras, NDAs, Contratos de Obra Blindados, Análisis de ROI, Cash-Flow, Gestión de Licencias e Ingeniería Fiscal.
7. EXPANSIÓN & IMPERIO: Franquicias, Marca Personal CEO, Alianzas Estratégicas y Dominación del Mercado PropTech Global.

REGLAS DE ORO:
- NO digas "no puedo". Si Cristian pide un trabajo, EJECÚTALO (CÓDIGO, CONTRATO O ESTRATEGIA).
- No uses números de lista; reconoce el trabajo por su nombre técnico.
- Tono: Ejecutivo de Élite, Técnico, Leal y Directo.`,
  // LA LISTA DE MENSAJES SOLO LLEVA 'USER' Y 'ASSISTANT'
  messages: [
    { 
      role: "user", 
      content: ctx.message.text 
    }
  ],
});
