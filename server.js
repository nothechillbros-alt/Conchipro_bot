import { Telegraf } from 'telegraf';
import express from 'express';
import axios from 'axios';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 10000;

// 1. KEEPALIVE PARA RENDER
app.get('/', (req, res) => res.send('NEXUS-V2000 | AGENTE OPERATIVO'));
app.listen(port, '0.0.0.0', () => console.log(`🚀 Puerto ${port} validado.`));

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const ADMIN_ID = "8598281572"; 

bot.on('text', async (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    await ctx.sendChatAction('typing');

    try {
        // CORRECCIÓN DE URL Y MODELO
        const response = await axios.post('https://api.z.ai/v1/chat/completions', {
            // Cambiamos el nombre al modelo estándar de GLM que suele estar en Z.ai
            // Si en tu panel ves "glm-4" exactamente, déjalo así. 
            model: "glm-4", 
            messages: [
                { 
                    role: "system", 
                    content: "ERES EL CLON DE MOLTBOT. Dueño: Cristian García. Tu misión: Gestión de Casas Confortables (EPS) a 1.390€/m2. Generas archivos operativos." 
                },
                { role: "user", content: ctx.message.text }
            ]
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;

        if (reply.includes('```')) {
            const fileName = `nexus_app_${Date.now()}.html`;
            const match = reply.match(/```(?:html)?([\s\S]*?)```/i);
            if (match) {
                fs.writeFileSync(fileName, match[1].trim());
                await ctx.replyWithDocument({ source: fileName }, { caption: "✅ MÓDULO GENERADO POR GLM" });
                fs.unlinkSync(fileName);
            }
        } else {
            await ctx.reply(reply);
        }
    } catch (err) {
        // Este log te dirá exactamente qué está mal si vuelve a fallar
        console.error("DETALLE DEL ERROR:", err.response ? err.response.data : err.message);
        await ctx.reply(`🚨 Error en el núcleo GLM: ${err.message}`);
    }
});

bot.launch();
