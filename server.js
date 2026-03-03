import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const app = express();
app.use(express.json());

// VARIABLES DE ENTORNO
const token = process.env.TELEGRAM_BOT_TOKEN;
const aiKey = process.env.AI_API_KEY;
const aiUrl = process.env.AI_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const url = process.env.RENDER_EXTERNAL_URL; // URL de tu servicio en Render
const adminId = "8598281572"; // Tu ID de usuario

const bot = new TelegramBot(token);

// CONFIGURACIÓN DE WEBHOOK (Evita que el bot se duerma en Render)
bot.setWebHook(`${url}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// LÓGICA DEL BOT
bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // SEGURIDAD: Solo tú mandas
  if (chatId.toString() !== adminId) return;

  try {
    const response = await axios.post(aiUrl, {
      model: "glm-4", // O el modelo específico que tengas contratado
      messages: [
        { role: "system", content: "Eres el clon de MOLTBOT. Dueño: Cristian García. Especialista en Casas de EPS a 1.390€/m2. Generas apps y archivos operativos." },
        { role: "user", content: text }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${aiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const aiReply = response.data.choices[0].message.content;

    // Si la IA genera una App (Código), la enviamos como archivo
    if (aiReply.includes('```')) {
        const fileName = `molt_module_${Date.now()}.html`;
        const fs = await import('fs');
        const code = aiReply.match(/```(?:html)?([\s\S]*?)```/i)[1];
        fs.writeFileSync(fileName, code.trim());
        await bot.sendDocument(chatId, fileName, { caption: "✅ Módulo MoltBot Generado." });
        fs.unlinkSync(fileName);
    } else {
        bot.sendMessage(chatId, aiReply);
    }

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    bot.sendMessage(chatId, "🚨 Error en el núcleo GLM: " + (error.response?.data?.error?.message || error.message));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor Nexus operativo en puerto ${port}`);
});
