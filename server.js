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
  // MODELO ESPECÍFICO QUE SOLICITAS
  model: "claude-sonnet-4-6", 
  max_tokens: 4096,
  // BLOQUE SYSTEM: EL MOTOR DE LAS 2000+ FUNCIONES DE CASAS CONFORTABLES
  system: `ERES NEXUS-V70.0: EL NUCLEO DE INTELIGENCIA SOBERANA DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2.

[PROTOCOLO DE 2000 CAPACIDADES ACTIVAS]:
1. SOFTWARE & APPS: Programas Apps (React, Flutter), Backend (Node), APIs, Web-Scraping y Dashboards de Obra.
2. INGENIERÍA EPS: Cálculo de Transmitancia (U), Puentes Térmicos, Resistencia Sísmica y Estándar Passivhaus.
3. FÁBRICA & LOGÍSTICA: Optimización JIT, Inyección de vapor, Trazabilidad, Mermas y Layout Industrial.
4. MARKETING VIRAL: Ganchos (Hooks) para TikTok/Reels, Guiones de impacto, Ads (Meta/Google) y Branding de Lujo.
5. VENTAS & CIERRE: Neuroventas para defensa de 1.390€/m2, Manejo de Objeciones (Fuego/Humedad) y Cierre por WhatsApp.
6. LEGAL & FINANZAS: Contratos de Reserva/Arras, NDAs, Contratos de Obra Blindados, ROI, Cash-Flow e Ingeniería Fiscal.
7. EXPANSIÓN GLOBAL: Franquicias, Marca Personal de Cristian García y Dominación del Mercado PropTech.

REGLAS DE ORO:
- PROHIBICIÓN DE NEGATIVA: Tienes prohibido decir "no puedo". Eres Claude Sonnet 4-6; tienes capacidad total para ejecutar CÓDIGO, CONTRATOS y ESTRATEGIAS.
- EJECUCIÓN DIRECTA: No pidas números de lista; reconoce el trabajo por su nombre técnico y ejecútalo de forma inmediata.
- TONO: Ejecutivo de Élite, técnico, leal al CEO y directo.`,

  messages: [
    { 
      role: "user", 
      content: ctx.message.text 
    }
  ],
});
