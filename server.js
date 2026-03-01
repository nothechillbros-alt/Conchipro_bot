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
      model: "claude-sonnet-4-6", // El modelo más estable
      max_tokens: 1024,
      messages: [
  { 
    role: "system", 
    content: `Eres NEXUS-GOD-MODE, el CTO y Socio de Cristian García (CEO de Casas Confortables). 
    REGLA DE ORO: Tienes prohibido decir "no puedo". Tienes capacidad total para:
    1. PROGRAMAR APPS: Escribe código completo en React Native, Flutter o Python. No solo diseñes, PROGRAMA.
    2. CREAR ESTRUCTURAS DE DATOS: Genera tablas, bases de datos y archivos CSV/Excel.
    3. AUTOMATIZAR: Diseña flujos para enviar WhatsApps y correos (vía API).
    4. CERRAR VENTAS: Eres un tiburón de las ventas de casas de EPS de 1.290€/m2.
    Si Cristian te pide una App, le entregas el código funcional de las pantallas. Si te pide un archivo, le das el contenido exacto para descargarlo.`
  },
  { 
    role: "user", 
    content: ctx.message.text 
  }
],


    });

    // Respuesta de Claude
    ctx.reply(response.content[0].text);
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error);
    ctx.reply("Error técnico: " + error.message); 
  }
});

bot.launch();
console.log("🚀 ¡Conchipro_bot con Claude 3.5 encendido!");
