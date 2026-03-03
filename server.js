import { Telegraf } from 'telegraf';
import express from 'express';
import axios from 'axios';
import fs from 'fs';

// CONFIGURACIÓN DE PUERTO PARA RENDER
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('NEXUS-V2000 | MOLTBOT ENGINE ACTIVE'));
app.listen(port, '0.0.0.0', () => console.log(`🚀 Puerto ${port} abierto. Render validado.`));

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const ADMIN_ID = "8598281572"; // Tu ID de usuario

bot.on('text', async (ctx) => {
    // SEGURIDAD: Solo tú controlas el sistema
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    await ctx.sendChatAction('typing');

    try {
        const response = await axios.post('https://api.z.ai/v1/chat/completions', {
            model: "glm-4", // Nota: Usa el identificador exacto de tu panel (glm-4 o glm-5 si ya está activo en tu API)
            messages: [
                { 
                    role: "system", 
                    content: "ERES EL CLON DE MOLTBOT. Dueño: Cristian García. Tu misión: Gestión de Casas Confortables (EPS) a 1.390€/m2. Generas código completo, apps y soluciones de ingeniería sin rodeos." 
                },
                { role: "user", content: ctx.message.text }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GLM_API_KEY}` }
        });

        const reply = response.data.choices[0].message.content;

        // DETECCIÓN DE CÓDIGO (Para mandarte la APP)
        if (reply.includes('```')) {
            const fileName = `app_molt_${Date.now()}.html`;
            const code = reply.match(/```(?:html)?([\s\S]*?)```/i);
            if (code) {
                fs.writeFileSync(fileName, code[1].trim());
                await ctx.replyWithDocument({ source: fileName }, { caption: "✅ MÓDULO GENERADO POR AGENTE GLM" });
                fs.unlinkSync(fileName);
            }
        } else {
            await ctx.reply(reply);
        }
    } catch (err) {
        console.error(err);
        await ctx.reply("🚨 Error en el núcleo GLM: " + err.message);
    }
});

bot.launch();
