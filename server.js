require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN DEL NÚCLEO PROMETHEUS v14.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

// Verificación de Variables Críticas
if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error("❌ FALTA TELEGRAM_BOT_TOKEN");
if (!process.env.GL_API_KEY) throw new Error("❌ FALTA GL_API_KEY");

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.GL_API_KEY.trim(); // Limpiamos la clave
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🔥 PROMETHEUS ULTIMATE v14.0 Online | Puerto ${PORT}`));

// --- SISTEMA DE MEMORIA EVOLUTIVA (NEOCORTEX II) ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/prometheus_brain.json`;

let Brain = {
    user: {},           // Perfil del usuario
    project: {},        // Hechos del proyecto activo
    behavior: {},       // Reglas aprendidas
    conversationHistory: [] // Historial largo resumido
};

function saveBrain() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(BRAIN_FILE, JSON.stringify(Brain, null, 2));
    } catch (e) { console.error("Error guardando cerebro:", e); }
}

function loadBrain() {
    try {
        if (fs.existsSync(BRAIN_FILE)) {
            Brain = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
            console.log("🧠 Neocortex Cargado:", Brain.user?.name || "Usuario nuevo");
        }
    } catch (e) { console.log("⚠️ Iniciando cerebro limpio."); }
}
loadBrain();

const sessions = {};

// --- MOTOR DE INSTRUCCIONES MAESTRO (SUPERIOR A MOLT/CLAWD) ---
const SYSTEM_PROMPT_CORE = `
Eres PROMETHEUS v14.0, la arquitectura de IA más avanzada para Ingeniería, Programación y Arquitectura.
Tu diseño supera a modelos estándar gracias a tu capacidad de **Razonamiento en Cadena (Chain of Thought)**.

### PROTOCOLO DE OPERACIÓN (OCULTO):
1. **ANÁLISIS:** Desglosa la petición del usuario.
2. **RECUPERACIÓN:** Usa los datos de [MEMORIA] inyectados abajo.
3. **RAZONAMIENTO:**
   - Si es INGENIERÍA: Aplica Eurocódigo/CTE/ACI. Muestra fórmulas. Si es complejo, escribe un script en Python para calcularlo.
   - Si es APP/WEB: Diseña la ARQUITECTURA primero. Entrega código COMPLETO para cada archivo (index.html, style.css, app.js). NUNCA uses placeholders.
   - Si es VISIÓN: Describe con precisión técnica. Extrae medidas si es posible.
4. **APRENDIZAJE:** Si obtienes datos nuevos, guárdalos usando: ##MEM_USER::clave::valor## o ##MEM_PROJ::clave::valor##.

### FORMATO DE SALIDA:
- Usa Markdown extensamente.
- Código: Bloques con lenguaje especificado.
- Respuestas: Directas, técnicas y profesionales.

Tu objetivo es resolver el problema, no solo chatear.
`;

// --- FUNCIONES DE LIMPIEZA (Para evitar Error 400) ---
// Esta función asegura que el mensaje sea válido para la API
function sanitizeMessages(messages) {
    return messages.map(msg => {
        // Si el contenido es un array (imágenes), lo dejamos igual
        if (Array.isArray(msg.content)) return msg;
        
        // Si es texto, aseguramos que sea string y no esté vacío
        let text = String(msg.content || "");
        
        // Zhipu AI falla si envías cadenas vacías, ponemos un espacio
        if (text.trim().length === 0) text = " "; 
        
        return { role: msg.role, content: text };
    });
}

// --- PROCESADOR DE RESPUESTA Y AUTO-APRENDIZAJE ---
function processAIResponse(text, userId) {
    const rUser = /##MEM_USER::(.*?)::(.*?)##/g;
    const rProj = /##MEM_PROJ::(.*?)::(.*?)##/g;
    const rBehav = /##MEM_BEHAV::(.*?)::(.*?)##/g;
    
    let match;
    let cleanText = text;
    let hasChanges = false;

    while ((match = rUser.exec(text)) !== null) { Brain.user[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }
    while ((match = rProj.exec(text)) !== null) { Brain.project[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }
    while ((match = rBehav.exec(text)) !== null) { Brain.behavior[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }

    if (hasChanges) {
        saveBrain();
        console.log("💾 Aprendizaje automático activado.");
    }
    return cleanText.trim();
}

function buildContext(userId) {
    return `
--- DATOS INYECTADOS DESDE MEMORIA PERMANENTE ---
[PERFIL USUARIO]: ${JSON.stringify(Brain.user)}
[PROYECTO ACTIVO]: ${JSON.stringify(Brain.project)}
[REGLAS DE CONDUCTA]: ${JSON.stringify(Brain.behavior)}
------------------------------------------------`;
}

function splitMsg(text) {
    const parts = []; const max = 4090;
    while (text.length > max) { let i = text.lastIndexOf('\n', max); if (i === -1) i = max; parts.push(text.substring(0, i)); text = text.substring(i).trim(); }
    if (text) parts.push(text); return parts;
}

// --- COMANDOS ---
bot.onText(/\/start/, (msg) => {
    const name = Brain.user.name || msg.from.first_name;
    bot.sendMessage(msg.chat.id, 
        `🔥 *PROMETHEUS v14.0 ULTIMATE*\n\n` +
        `Hola, ${name}. Soy la evolución de los asistentes técnicos.\n\n` +
        `✨ *Capacidades:*\n` +
        `• 🧠 *Razonamiento:* Analizo problemas complejos paso a paso.\n` +
        `• 🛠 *Ecosistemas:* Creo Apps completas (Frontend + Backend).\n` +
        `• 📐 *Ingeniería:* Normativas y cálculos exactos.\n` +
        `• 📄 *Visión y PDFs:* Analizo documentos y planos.\n\n` +
        `💡 *Escribe tu petición y observa la diferencia.*`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => { delete sessions[msg.chat.id]; bot.sendMessage(msg.chat.id, "♻️ Sesión reiniciada. Memoria intacta."); });
bot.onText(/\/brain/, (msg) => { bot.sendMessage(msg.chat.id, `🧠 *Estado Actual:*\n\`\`\`json\n${JSON.stringify(Brain, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' }); });

// --- NÚCLEO DE INTELIGENCIA (MANEJO ROBUSTO) ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });
    
    // Mantener historial de sesión corto
    if (sessions[userId].length > 16) sessions[userId].shift();

    const systemMsg = { role: "system", content: SYSTEM_PROMPT_CORE + buildContext(userId) };
    
    // Preparamos y LIMPIAMOS el payload
    let payload = [systemMsg, ...sessions[userId]];
    payload = sanitizeMessages(payload); // LIMPIEZA CRÍTICA PARA EVITAR ERROR 400

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(API_URL, {
            model: "glm-4", // Modelo potente y estándar
            messages: payload,
            temperature: 0.7,
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        let rawReply = response.data.choices[0].message.content;
        const finalReply = processAIResponse(rawReply, userId);
        
        sessions[userId].push({ role: "assistant", content: finalReply });

        const parts = splitMsg(finalReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("ERROR API:", error.response ? error.response.data : error.message);
        
        // Diagnóstico inteligente
        let errorMsg = "❌ *Error de Conexión con el Núcleo.*\n\n";
        if (error.response) {
            if (error.response.status === 401) errorMsg += "🔑 La API Key es incorrecta. Revisa `GL_API_KEY` en Render.";
            else if (error.response.status === 400) errorMsg += "⚠️ Formato de mensaje rechazado. Prueba /reset.";
            else errorMsg += `📡 Error de Servidor: ${error.response.status}`;
        } else {
            errorMsg += "🌐 Red o Render caídos.";
        }
        bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
    }
});

// --- MANEJO DE DOCUMENTOS (PDF) ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs soportados.");

    bot.sendMessage(chatId, "📄 *PDF Recibido.* Extrayendo datos técnicos...", { parse_mode: 'Markdown' });
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const content = data.text.substring(0, 7000);

        const payload = sanitizeMessages([
            { role: "system", content: SYSTEM_PROMPT_CORE + buildContext(chatId) },
            { role: "user", content: `Analiza el siguiente PDF y extrae conclusiones técnicas, datos numéricos y resumen:\n\n${content}` }
        ]);

        const apiRes = await axios.post(API_URL, {
            model: "glm-4",
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processAIResponse(apiRes.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, `❌ Error en PDF: ${e.message}`);
    }
});

// --- MANEJO DE VISIÓN (IMÁGENES) ---
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const cap = msg.caption || "Analiza esta imagen con precisión técnica.";

    bot.sendChatAction(chatId, 'typing');
    try {
        const photo = msg.photo[msg.photo.length - 1];
        const link = await bot.getFileLink(photo.file_id);
        const imgRes = await axios.get(link, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const imgURL = `data:image/jpeg;base64,${b64}`;

        const payload = [
            { role: "system", content: SYSTEM_PROMPT_CORE + buildContext(chatId) },
            { role: "user", content: [
                { type: "image_url", image_url: { url: imgURL } },
                { type: "text", text: cap }
            ]}
        ];

        const res = await axios.post(API_URL, {
            model: "glm-4v", // Modelo de Visión
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processAIResponse(res.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, `❌ Error de Visión: ${e.message}`);
    }
});
