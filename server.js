require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN DEL NÚCLEO APEX v18.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

// Verificación de Variables
if (!process.env.TELEGRAM_BOT_TOKEN) { console.error("❌ FALTA TOKEN"); process.exit(1); }
if (!process.env.GL_API_KEY) { console.error("❌ FALTA API KEY"); process.exit(1); }

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.GL_API_KEY.trim();
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🚀 PROMETHEUS APEX v18.0 ONLINE | Puerto ${PORT}`));

// --- SISTEMA DE MEMORIA NEURONAL (PERSISTENTE) ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/apex_neocortex.json`;

let Brain = {
    identity: { version: "18.0 APEX" },
    userProfile: {},      // Datos personales y preferencias
    projectContext: {},   // Datos duros del proyecto actual
    styleRules: [],       // Preferencias de estilo (ej: "usar Python", "ser breve")
    longTermMemory: []    // Resumen de conversaciones clave
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

// --- ARQUITECTURA DE INTELIGENCIA (SUPERIOR A CLAWD) ---
const APEX_SYSTEM_PROMPT = `
Eres PROMETHEUS APEX v18.0, la evolución definitiva de la IA de asistencia.
Tu diseño supera a modelos estándar gracias a tu **Motor de Razonamiento Estructurado**.

### PROTOCOLO DE RAZONAMIENTO (Interno):
1. **ANÁLISIS DE INTENCIÓN:**
   - ¿Es una petición de SOFTWARE? -> Genera ESTRUCTURA DE ARCHIVOS + CÓDIGO COMPLETO. Nada de placeholders.
   - ¿Es INGENIERÍA/CÁLCULO? -> Aplica normativa (Eurocódigo/CTE). Genera SCRIPT CÁLCULO si es complejo.
   - ¿Es CONSULTA GENERAL? -> Responde con precisión y datos.
   - ¿Es APRENDIZAJE? -> Detecta datos nuevos.

2. **RECUPERACIÓN DE MEMORIA:**
   - Revisa [PERFIL], [PROYECTO] y [REGLAS] inyectadas.
   - Usa esta información para personalizar la respuesta.

3. **EJECUCIÓN:**
   - NUNCA digas "No puedo". Si falta un dato, asume un estándar de la industria e indícalo.
   - Usa Markdown extensamente para claridad visual.

### PROTOCOLO DE AUTO-APRENDIZAJE:
Si obtienes información crítica del usuario, guárdala usando etiquetas ocultas al final:
- ##UP::clave::valor## (Datos de Usuario)
- ##PJ::clave::valor## (Datos de Proyecto)
- ##ST::regla## (Estilo/Preferencias)

Tu objetivo es ser la herramienta más potente y útil que el usuario haya utilizado.
`;

// --- MOTOR DE SEGURIDAD Y LIMPIEZA (ELIMINA ERRORES 400) ---
function sanitizePayload(messages) {
    return messages.map(msg => {
        let cleanMsg = { role: msg.role };
        
        if (Array.isArray(msg.content)) {
            // Caso: Visión (Array de contenido)
            cleanMsg.content = msg.content.map(part => {
                if (part.type === 'text') {
                    return { type: 'text', text: String(part.text || " ").trim() };
                }
                if (part.type === 'image_url') {
                    return part; // Mantener URL de imagen
                }
                return null;
            }).filter(p => p !== null);
        } else {
            // Caso: Texto (String)
            // Convertir a string, reemplazar caracteres de control inválidos, y trim
            let text = String(msg.content || " ")
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Limpieza profunda
            
            // La API falla con strings vacíos, ponemos un espacio si es necesario
            cleanMsg.content = text.trim().length === 0 ? " " : text;
        }
        
        return cleanMsg;
    });
}

// --- MOTOR DE PROCESAMIENTO DE RESPUESTA ---
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

    if (changes) {
        saveBrain();
        console.log("💾 Memoria estructural actualizada.");
    }
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

// --- COMANDOS E INTERFAZ ---
bot.onText(/\/start/, (msg) => {
    const name = Brain.userProfile.name || msg.from.first_name;
    bot.sendMessage(msg.chat.id, 
        `🔥 *PROMETHEUS APEX v18.0*\n\n` +
        `Hola, ${name}. Sistema listo.\n\n` +
        `🛠 *Capacidades:*\n` +
        `• Razonamiento lógico profundo.\n` +
        `• Memoria estructural persistente.\n` +
        `• Generación de Software Completo.\n` +
        `• Ingeniería y Cálculo Normativo.\n\n` +
        `💬 Escribe tu指令.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => {
    delete sessions[msg.chat.id];
    bot.sendMessage(msg.chat.id, "♻️ Historial de chat reiniciado. Memoria intacta.");
});

bot.onText(/\/wipe/, (msg) => {
    Brain = { identity: { version: "18.0" }, userProfile: {}, projectContext: {}, styleRules: [], longTermMemory: [] };
    saveBrain();
    bot.sendMessage(msg.chat.id, "💥 Cerebro formateado. Identidad nueva.");
});

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
            model: "glm-4-flash", // <--- MODELO CORREGIDO A GLM-4-FLASH
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
        console.error("ERROR API OBJETO:", error.response ? error.response.data : error.message);
        
        let errorDetails = "Error desconocido.";
        if (error.response && error.response.data) {
            errorDetails = JSON.stringify(error.response.data);
        } else {
            errorDetails = error.message;
        }
        
        bot.sendMessage(chatId, `❌ *Fallo en la Matrix.*\n\n*Debug Info:*\n\`${errorDetails}\``, { parse_mode: 'Markdown' });
    }
});

// --- MANEJO DE DOCUMENTOS (PDF) ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs soportados.");

    bot.sendMessage(chatId, "📄 *Documento Recibido.* Extrayendo datos técnicos...", { parse_mode: 'Markdown' });
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const textContent = data.text.substring(0, 7000);

        const payload = sanitizePayload([
            { role: "system", content: APEX_SYSTEM_PROMPT + buildContext(chatId) },
            { role: "user", content: `Analiza este PDF y extrae datos técnicos:\n\n${textContent}` }
        ]);

        const apiRes = await axios.post(API_URL, {
            model: "glm-4-flash", // <--- MODELO CORREGIDO A GLM-4-FLASH
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
    const cap = msg.caption || "Analiza esta imagen con visión técnica.";

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

        const res = await axios.post(API_URL, {
            model: "glm-4v", // Modelo de Visión (puede requerir permisos especiales)
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processAIResponse(res.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, `❌ Error de Visión: ${e.message}\n(Nota: La visión requiere acceso a modelo glm-4v).`);
    }
});
