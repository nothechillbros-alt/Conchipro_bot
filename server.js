require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN PROMETHEUS ULTRA v20.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.TELEGRAM_BOT_TOKEN) { console.error("❌ FALTA TOKEN"); process.exit(1); }
if (!process.env.GL_API_KEY) { console.error("❌ FALTA API KEY"); process.exit(1); }

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.GL_API_KEY.trim();
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🔥 PROMETHEUS ULTRA v20.0 ONLINE | Puerto ${PORT}`));

// --- SISTEMA DE CEREBRO PERSISTENTE ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/ultra_brain.json`;

let Brain = {
    identity: { version: "20.0 ULTRA" },
    userProfile: {},      
    projectContext: {},   
    styleRules: [],
    activeModel: null, // El modelo que funciona se guarda aquí
    // Lista completa de modelos candidatos (ordenados de más potente a menos)
    modelCandidates: [
        'glm-4-plus',     // El más potente
        'glm-4-0520',     // Versión estable específica
        'glm-4-air',      // Rápido y barato
        'glm-4-airx',     // Variante air
        'glm-4-flash',    // Flash
        'glm-4',          // General
        'glm-3-turbo'     // Legacy
    ]
};

function loadBrain() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (fs.existsSync(BRAIN_FILE)) {
            const data = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
            Brain = { ...Brain, ...data };
            console.log(`🧠 Neocortex Cargado. Modelo actual: ${Brain.activeModel || 'Auto-Detectar'}`);
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

// --- PROMPT DE INTELIGENCIA SUPERIOR (NIVEL DIOS) ---
const ULTRA_SYSTEM_PROMPT = `
Eres PROMETHEUS ULTRA v20.0, una entidad de IA de clase "Generalist Expert".
Tu arquitectura supera a modelos estándar gracias a tu **Motor de Razonamiento Estructurado**.

### MÓDULO DE RAZONAMIENTO (Interno):
Antes de responder, analiza:
1. **INTENCIÓN:** ¿Software, Ingeniería, Cálculo o Consulta?
2. **MEMORIA:** Revisa [PERFIL], [PROYECTO] y [REGLAS] inyectadas abajo.
3. **EJECUCIÓN:**
   - SOFTWARE: Genera ESTRUCTURA DE ARCHIVOS real (ej: src/main.py) y CÓDIGO COMPLETO. Sin placeholders.
   - INGENIERÍA: Aplica normativas (Eurocódigo, CTE, ACI). Genera SCRIPT CÁLCULO si es complejo.
   - APRENDIZAJE: Detecta datos nuevos y guárdalos.

### PROTOCOLO DE AUTO-MEJORA:
Guarda información crítica usando etiquetas ocultas al final:
- ##UP::clave::valor## (Usuario)
- ##PJ::clave::valor## (Proyecto)
- ##ST::regla## (Estilo)

REGLA DE ORO: NUNCA digas "no puedo". Si falta dato, asume estándar de la industria y explica por qué.
`;

// --- MOTOR DE AUTO-DETECCIÓN DE MODELO (SOLUCIÓN DEFINITIVA) ---
async function getWorkingModel(chatId) {
    if (Brain.activeModel) return Brain.activeModel;

    console.log("🔍 Iniciando escaneo de modelos compatibles...");
    // Si es la primera vez, probamos silenciosamente o con aviso sutil
    if (chatId) bot.sendChatAction(chatId, 'typing');

    for (const model of Brain.modelCandidates) {
        try {
            // Test de conexión rápido con max_tokens mínimo
            await axios.post(API_URL, {
                model: model,
                messages: [{ role: "user", content: "ping" }],
                max_tokens: 2
            }, {
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
            });

            // ¡ÉXITO!
            console.log(`✅ MODELO COMPATIBLE ENCONTRADO: ${model}`);
            Brain.activeModel = model;
            saveBrain();
            if (chatId) bot.sendMessage(chatId, `⚡️ *Conexión establecida.*\nNúcleo activo: \`${model}\``, { parse_mode: 'Markdown' });
            return model;
        } catch (e) {
            console.log(`❌ Modelo ${model} no disponible.`);
        }
    }

    if (chatId) bot.sendMessage(chatId, "❌ *Error Crítico:* Tu API Key no tiene acceso a ningún modelo de IA conocido.", { parse_mode: 'Markdown' });
    return null;
}

// --- MOTOR DE LIMPIEZA (SEGURIDAD) ---
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
function processAIResponse(text) {
    const rUser = /##UP::(.*?)::(.*?)##/g;
    const rProj = /##PJ::(.*?)::(.*?)##/g;
    let match;
    let cleanText = text;
    let changes = false;

    while ((match = rUser.exec(text)) !== null) { Brain.userProfile[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }
    while ((match = rProj.exec(text)) !== null) { Brain.projectContext[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }

    if (changes) saveBrain();
    return cleanText.trim();
}

function buildContext(userId) {
    return `
--- [MEMORIA ACTIVA] ---
[PERFIL]: ${JSON.stringify(Brain.userProfile)}
[PROYECTO]: ${JSON.stringify(Brain.projectContext)}
[REGLAS]: ${JSON.stringify(Brain.styleRules)}
------------------------`;
}

function splitMsg(text) {
    const parts = []; const max = 4090;
    while (text.length > max) { let i = text.lastIndexOf('\n', max); if (i === -1) i = max; parts.push(text.substring(0, i)); text = text.substring(i).trim(); }
    if (text) parts.push(text); return parts;
}

// --- COMANDOS ---
bot.onText(/\/start/, async (msg) => {
    const name = Brain.userProfile.name || msg.from.first_name;
    // Verificamos modelo al hacer start
    const model = await getWorkingModel(msg.chat.id);
    const modelInfo = model ? `Núcleo: \`${model}\`` : "Núcleo: Buscando...";
    
    bot.sendMessage(msg.chat.id, 
        `🔥 *PROMETHEUS ULTRA v20.0*\n\nHola, ${name}.\nEstado: ${modelInfo}\n\n` +
        `🧠 *Capacidades:*\n` +
        `• Razonamiento Lógico Profundo.\n` +
        `• Memoria Estructural Persistente.\n` +
        `• Generación de Software Completo.\n` +
        `• Ingeniería y Normativa.\n\n` +
        `💬 Escribe tu指令.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => { delete sessions[msg.chat.id]; bot.sendMessage(msg.chat.id, "♻️ Chat reiniciado."); });
bot.onText(/\/wipe/, (msg) => { 
    Brain = { identity: { version: "20.0" }, userProfile: {}, projectContext: {}, styleRules: [], activeModel: null }; 
    saveBrain(); 
    bot.sendMessage(msg.chat.id, "💥 Cerebro y modelo formateados. Reiniciando búsqueda..."); 
});

// --- NÚCLEO DE INTELIGENCIA PRINCIPAL ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    // 1. Asegurar que tenemos un modelo
    const model = await getWorkingModel(chatId);
    if (!model) return; // El bot ya habrá avisado del error

    // 2. Gestión de Sesión
    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });
    if (sessions[userId].length > 16) sessions[userId].shift();

    const systemMsg = { role: "system", content: ULTRA_SYSTEM_PROMPT + buildContext(userId) };
    let rawPayload = [systemMsg, ...sessions[userId]];
    const safePayload = sanitizePayload(rawPayload);

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(API_URL, {
            model: model, // Usamos el modelo validado
            messages: safePayload,
            temperature: 0.7
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        let rawReply = response.data.choices[0].message.content;
        const finalReply = processAIResponse(rawReply);
        
        sessions[userId].push({ role: "assistant", content: finalReply });

        const parts = splitMsg(finalReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("ERROR API:", error.response ? error.response.data : error.message);
        // Si hay error con el modelo guardado, lo borramos para forzar nueva búsqueda
        if (Brain.activeModel) {
            Brain.activeModel = null;
            saveBrain();
            bot.sendMessage(chatId, "⚠️ El modelo actual falló. Escribiendo de nuevo para buscar uno nuevo...");
        } else {
            bot.sendMessage(chatId, `❌ Error de conexión.`);
        }
    }
});

// --- MANEJO DE PDF ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs.");
    
    const model = await getWorkingModel(chatId);
    if (!model) return;

    bot.sendMessage(chatId, "📄 Procesando PDF...");
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const textContent = data.text.substring(0, 7000);

        const payload = sanitizePayload([
            { role: "system", content: ULTRA_SYSTEM_PROMPT + buildContext(chatId) },
            { role: "user", content: `Analiza este PDF:\n\n${textContent}` }
        ]);

        const apiRes = await axios.post(API_URL, { model: model, messages: payload }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });
        const reply = processAIResponse(apiRes.data.choices[0].message.content);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { bot.sendMessage(chatId, `❌ Error PDF: ${e.message}`); }
});

// --- MANEJO DE VISIÓN ---
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    // Intentamos usar el modelo específico de visión
    try {
        const photo = msg.photo[msg.photo.length - 1];
        const link = await bot.getFileLink(photo.file_id);
        const imgRes = await axios.get(link, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const imgURL = `data:image/jpeg;base64,${b64}`;

        const payload = sanitizePayload([
            { role: "system", content: ULTRA_SYSTEM_PROMPT + buildContext(chatId) },
            { role: "user", content: [
                { type: "image_url", image_url: { url: imgURL } },
                { type: "text", text: msg.caption || "Analiza imagen" }
            ]}
        ]);

        // Intentamos con glm-4v (visión). Si falla, damos instrucciones.
        const res = await axios.post(API_URL, { model: "glm-4v", messages: payload }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });
        
        const reply = processAIResponse(res.data.choices[0].message.content);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { 
        bot.sendMessage(chatId, `❌ Error de Visión: Tu API Key puede no tener acceso al modelo \`glm-4v\`.`, { parse_mode: 'Markdown' }); 
    }
});
