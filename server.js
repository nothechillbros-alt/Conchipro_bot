require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN DEL NÚCLEO APEX v16.1 ---
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.TELEGRAM_BOT_TOKEN) { console.error("❌ FALTA TOKEN"); process.exit(1); }
if (!process.env.GL_API_KEY) { console.error("❌ FALTA API KEY"); process.exit(1); }

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.GL_API_KEY.trim();
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🔥 PROMETHEUS APEX v16.1 ONLINE | Puerto ${PORT}`));

// --- SISTEMA DE MEMORIA ESTRUCTURAL ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/apex_neocortex.json`;

let Brain = {
    identity: { version: "16.1 APEX" },
    userProfile: {},
    projectContext: {},
    styleRules: [],
    longTermMemory: []
};

function loadBrain() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (fs.existsSync(BRAIN_FILE)) {
            const data = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
            Brain = { ...Brain, ...data };
            console.log(`🧠 Neocortex Cargado: Usuario ${Brain.userProfile.name || 'Desconocido'}`);
        }
    } catch (e) { console.log("⚠️ Iniciando cerebro limpio."); }
}

function saveBrain() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(BRAIN_FILE, JSON.stringify(Brain, null, 2));
    } catch (e) { console.error("Error guardando cerebro:", e); }
}
loadBrain();

const sessions = {};

// --- ARQUITECTURA DE INTELIGENCIA (SYSTEM PROMPT) ---
const APEX_SYSTEM_PROMPT = `
Eres PROMETHEUS APEX v16.1, una entidad de IA de clase "Generalist Expert".
Tu arquitectura supera a modelos estándar gracias a tu capacidad de **Razonamiento Estructurado**.

### PROTOCOLO DE RAZONAMIENTO:
1. **ANÁLISIS DE INTENCIÓN:**
   - ¿Es SOFTWARE? -> Genera ESTRUCTURA DE ARCHIVOS + CÓDIGO COMPLETO.
   - ¿Es INGENIERÍA? -> Aplica normativa. Genera SCRIPT CÁLCULO si es complejo.
   - ¿Es CONSULTA? -> Responde con precisión.
   - ¿Es APRENDIZAJE? -> Detecta datos nuevos.

2. **RECUPERACIÓN DE MEMORIA:**
   - Revisa [PERFIL], [PROYECTO] y [REGLAS] inyectadas.

3. **EJECUCIÓN:**
   - NUNCA uses placeholders.
   - NUNCA digas "No puedo". Si falta dato, asume estándar.
   - Usa Markdown.

### PROTOCOLO DE AUTO-APRENDIZAJE:
Guarda información usando etiquetas ocultas al final:
- ##UP::clave::valor## (Usuario)
- ##PJ::clave::valor## (Proyecto)
- ##ST::regla## (Estilo)
`;

// --- MOTOR DE SEGURIDAD Y LIMPIEZA ---
function sanitizePayload(messages) {
    return messages.map(msg => {
        let cleanMsg = { role: msg.role };
        
        if (Array.isArray(msg.content)) {
            cleanMsg.content = msg.content.map(part => {
                if (part.type === 'text') return { type: 'text', text: String(part.text || " ").trim() };
                if (part.type === 'image_url') return part;
                return null;
            }).filter(p => p !== null);
        } else {
            let text = String(msg.content || " ").replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
            cleanMsg.content = text.trim().length === 0 ? " " : text;
        }
        
        return cleanMsg;
    });
}

// --- MOTOR DE PROCESAMIENTO ---
function processAIResponse(text, userId) {
    const rUser = /##UP::(.*?)::(.*?)##/g;
    const rProj = /##PJ::(.*?)::(.*?)##/g;
    const rStyle = /##ST::(.*?)##/g;
    
    let match;
    let cleanText = text;
    let changes = false;

    while ((match = rUser.exec(text)) !== null) { Brain.userProfile[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }
    while ((match = rProj.exec(text)) !== null) { Brain.projectContext[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }
    while ((match = rStyle.exec(text)) !== null) { Brain.styleRules.push(match[1]); cleanText = cleanText.replace(match[0], ''); changes = true; }

    if (changes) saveBrain();
    return cleanText.trim();
}

function buildContext(userId) {
    return `
--- [MEMORIA INYECTADA] ---
[PERFIL]: ${JSON.stringify(Brain.userProfile)}
[PROYECTO]: ${JSON.stringify(Brain.projectContext)}
[REGLAS]: ${JSON.stringify(Brain.styleRules)}
---------------------------`;
}

function splitMsg(text) {
    const parts = []; const max = 4090;
    while (text.length > max) { let i = text.lastIndexOf('\n', max); if (i === -1) i = max; parts.push(text.substring(0, i)); text = text.substring(i).trim(); }
    if (text) parts.push(text); return parts;
}

// --- COMANDOS ---
bot.onText(/\/start/, (msg) => {
    const name = Brain.userProfile.name || msg.from.first_name;
    bot.sendMessage(msg.chat.id, 
        `🔥 *PROMETHEUS APEX v16.1*\n\n` +
        `Hola, ${name}. Sistema Operativo.\n\n` +
        `🛠 *Capacidades:*\n` +
        `• Razonamiento lógico.\n` +
        `• Memoria persistente.\n` +
        `• Software Completo.\n` +
        `• Ingeniería y Cálculo.\n\n` +
        `💬 Escribe tu指令.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => { delete sessions[msg.chat.id]; bot.sendMessage(msg.chat.id, "♻️ Historial reiniciado."); });
bot.onText(/\/wipe/, (msg) => { Brain = { identity: { version: "16.1" }, userProfile: {}, projectContext: {}, styleRules: [] }; saveBrain(); bot.sendMessage(msg.chat.id, "💥 Cerebro formateado."); });

// --- NÚCLEO DE INTELIGENCIA PRINCIPAL ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });
    if (sessions[userId].length > 16) sessions[userId].shift();

    const systemMsg = { role: "system", content: APEX_SYSTEM_PROMPT + buildContext(userId) };
    let rawPayload = [systemMsg, ...sessions[userId]];
    const safePayload = sanitizePayload(rawPayload);

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(API_URL, {
            model: "glm-3-turbo", // <--- CAMBIO CRÍTICO: Usamos glm-3-turbo que sí funciona
            messages: safePayload,
            temperature: 0.7
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
        let errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
        bot.sendMessage(chatId, `❌ *Fallo en la Matrix.*\n\n*Debug Info:*\n\`${errorDetails}\``, { parse_mode: 'Markdown' });
    }
});

// --- MANEJO DE DOCUMENTOS (PDF) ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs.");

    bot.sendMessage(chatId, "📄 Procesando PDF...");
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const textContent = data.text.substring(0, 7000);

        const payload = sanitizePayload([
            { role: "system", content: APEX_SYSTEM_PROMPT + buildContext(chatId) },
            { role: "user", content: `Analiza este PDF:\n\n${textContent}` }
        ]);

        const apiRes = await axios.post(API_URL, {
            model: "glm-3-turbo", // <--- CAMBIO A TURBO
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processAIResponse(apiRes.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { bot.sendMessage(chatId, `❌ Error PDF: ${e.message}`); }
});

// --- MANEJO DE VISIÓN (IMÁGENES) ---
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const cap = msg.caption || "Analiza esta imagen.";

    bot.sendChatAction(chatId, 'typing');
    try {
        const photo = msg.photo[msg.photo.length - 1];
        const link = await bot.getFileLink(photo.file_id);
        const imgRes = await axios.get(link, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const imgURL = `data:image/jpeg;base64,${b64}`;

        const payload = sanitizePayload([
            { role: "system", content: APEX_SYSTEM_PROMPT + buildContext(chatId) },
            { role: "user", content: [
                { type: "image_url", image_url: { url: imgURL } },
                { type: "text", text: cap }
            ]}
        ]);

        // Nota: La visión suele requerir glm-4v. Si falla aquí, es que tu cuenta no soporta visión aún.
        const res = await axios.post(API_URL, {
            model: "glm-4v", // Intentamos visión, si falla es tema de permisos de cuenta
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processAIResponse(res.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { bot.sendMessage(chatId, `❌ Error de Visión: ${e.message}\n(Nota: La visión requiere acceso a modelo glm-4v).`); }
});
