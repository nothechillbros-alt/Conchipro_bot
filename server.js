import { Telegraf } from 'telegraf';
import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 10000;

// 1. SEÑAL PARA RENDER (Evita el error de puerto)
app.get('/', (req, res) => res.send('NEXUS-V2000 | AGENTIC CORE ACTIVE'));
app.listen(port, '0.0.0.0', () => console.log(`Puerto ${port} validado.`));

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on('text', async (ctx) => {
  if (ctx.from.id.toString() !== "8598281572") return;

  try {
    // 2. CONEXIÓN AL MOTOR GLM
    const response = await axios.post('https://api.z.ai/v1/chat/completions', {
      model: "glm-4", // CAMBIADO A GLM-4 PARA EVITAR EL ERROR 404
      messages: [
        { role: "system", content: "Eres NEXUS-V2000. Motor Agentic Engineering. Dueño: Cristian García. Especialista en Casas EPS a 1.390€/m2." },
        { role: "user", content: ctx.message.text }
      ],
      temperature: 0.2
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.GL_API_KEY}`, // Asegúrate que la variable en Render se llame así
        'Content-Type': 'application/json'
      }
    });

    const reply = response.data.choices[0].message.content;
    
    // 3. GENERADOR DE MÓDULOS (MoltBot Style)
    if (reply.includes('```')) {
      const fileName = `nexus_mod_${Date.now()}.html`;
      const codeMatch = reply.match(/```(?:html)?([\s\S]*?)```/i);
      const code = codeMatch ? codeMatch[1].trim() : reply;
      
      fs.writeFileSync(fileName, code);
      await ctx.replyWithDocument({ source: fileName }, { caption: "📦 Módulo generado por el núcleo GLM." });
      fs.unlinkSync(fileName);
    } else {
      await ctx.reply(reply);
    }
  } catch (err) {
    // Si la API devuelve un error específico, lo mostramos aquí
    const errorMsg = err.response?.data?.error?.message || err.message;
    ctx.reply(`🚨 ERROR DE NÚCLEO: ${errorMsg}`);
  }
});

bot.launch();
