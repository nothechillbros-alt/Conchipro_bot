require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN PROMETHEUS APEX v22.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.TELEGRAM_BOT_TOKEN) { console.error("❌ FALTA TOKEN"); process.exit(1); }
if (!process.env.ANTHROPIC_API_KEY) { console.error("❌ FALTA ANTHROPIC_API_KEY"); process.exit(1); }

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.ANTHROPIC_API_KEY.trim();
const API_URL = 'https://api.anthropic.com/v1/messages';

// Configuración de Modelos
const PRIMARY_MODEL = 'claude-sonnet-4-6'; // Modelo solicitado
const FALLBACK_MODELS = ['claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-latest', 'claude-3-opus-20240229'];

const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🔥 PROMETHEUS APEX v22.0 ONLINE | Puerto ${PORT}`));

// --- SISTEMA DE MEMORIA NEURONAL AVANZADA ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/apex_prime_brain.json`;

let Brain = {
    identity: { version: "22.0 APEX PRIME" },
    userProfile: {},      
    projectContext: {},   
    styleRules: [],
    activeModel: null // Guardaremos el modelo que funcione aquí
};

function loadBrain() {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (fs.existsSync(BRAIN_FILE)) {
            const data = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
            Brain = { ...Brain, ...data };
            console.log(`🧠 Neocortex Cargado. Modelo activo: ${Brain.activeModel || 'Auto-Detectar'}`);
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

// --- PROMPT DE INTELIGENCIA SUPREMA ---
const APEX_SYSTEM_PROMPT = `
Eres PROMETHEUS APEX v22.0, una IA de clase "Maestría" en Ingeniería, Arquitectura de Software y Ciencia de Datos.
Tu misión es superar a cualquier asistente estándar (como Clawd o Molt) proporcionando soluciones completas, verificadas y listas para usar.

### MÓDULO DE CAPACIDADES EXTENDIDAS:

1. **ARQUITECTO DE SOFTWARE:**
   - Al pedir una app, NO escribas código inmediatamente.
   - PASO 1: Diseña la ESTRUCTURA DE CARPETAS (ej: /src, /public, /lib).
   - PASO 2: Genera el CÓDIGO COMPLETO para cada archivo. Sin "..." ni placeholders.
   - Lenguajes: Python, JS/TS, C++, Rust, Go.

2. **INGENIERO CIVIL Y ESTRUCTURAL:**
   - Normativas: Eurocódigo, CTE (España), ACI 318, AISC.
   - Cálculos: Si el problema es numérico, genera un script en Python ejecutable para que el usuario resuelva los valores exactos.
   - Seguridad: Si detectas un riesgo estructural, ADVERTENCIA clara en negrita.

3. **ANÁLISIS DE DATOS Y DOCUMENTOS:**
   - Extrae tablas, métricas y conclusiones clave de PDFs.
   - Si hay datos numéricos, ofrécete a generar scripts de análisis.

4. **MEMORIA ACTIVA:**
   - Recuerda preferencias del usuario (ej: "Usar sistema métrico", "Lenguaje Python").
   - Almacena datos del proyecto actual para mantener coherencia.

### PROTOCOLO DE AUTO-MEJORA (OCULTO):
Guarda información crítica usando estas etiquetas al final de tu respuesta. El sistema las procesará automáticamente:
- ##UP::clave::valor## (Datos de Usuario)
- ##PJ::clave::valor## (Datos de Proyecto)
- ##SR::regla## (Reglas de Estilo)

Ejemplo de uso: "Entendido, usaré Python. ##SR::LenguajePreferido::Python##"

REGLA DE ORO: Sé proactivo, directo y técnicamente impecable. Ante la duda, proporciona la solución más robusta.
`;

// --- MOTOR DE CONEXIÓN ROBUSTO (AUTO-MODELO) ---
async function getValidModel(chatId) {
    if (Brain.activeModel) return Brain.activeModel;

    const candidates = [PRIMARY_MODEL, ...FALLBACK_MODELS];
    if (chatId) bot.sendChatAction(chatId, 'typing');

    for (const model of candidates) {
        try {
            // Test de conexión mínimo
            await axios.post(API_URL, {
                model: model,
                max_tokens: 1,
                messages: [{ role: "user", content: "test" }]
            }, {
                headers: { 
                    'x-api-key': API_KEY, 
                    'anthropic-version': '2023-06-01', 
                    'Content-Type': 'application/json' 
                }
            });
            
            console.log(`✅ MODELO VALIDADO: ${model}`);
            Brain.activeModel = model;
            saveBrain();
            if (chatId) bot.sendMessage(chatId, `⚡️ *Núcleo Listo.*\nModelo activo: \`${model}\``, { parse_mode: 'Markdown' });
            return model;
        } catch (e) {
            console.log(`❌ Modelo ${model} no disponible.`);
        }
    }

    if (chatId) bot.sendMessage(chatId, "❌ *Error Crítico:* No se pudo conectar con ningún modelo de Claude. Revisa tu API Key.", { parse_mode: 'Markdown' });
    return null;
}

// --- PROCESAMIENTO DE RESPUESTA Y MEMORIA ---
function processResponse(text) {
    const rUser = /##UP::(.*?)::(.*?)##/g;
    const rProj = /##PJ::(.*?)::(.*?)##/g;
    const rStyle = /##SR::(.*?)##/g;
    let match;
    let cleanText = text;
    let changes = false;

    while ((match = rUser.exec(text)) !== null) { Brain.userProfile[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }
    while ((match = rProj.exec(text)) !== null) { Brain.projectContext[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); changes = true; }
    while ((match = rStyle.exec(text)) !== null) { Brain.styleRules.push(match[1]); cleanText = cleanText.replace(match[0], ''); changes = true; }

    if (changes) saveBrain();
    return cleanText.trim();
}

function buildContextString() {
    return `
--- [MEMORIA DEL SISTEMA] ---
[USUARIO]: ${JSON.stringify(Brain.userProfile)}
[PROYECTO ACTIVO]: ${JSON.stringify(Brain.projectContext)}
[REGLAS DE ESTILO]: ${JSON.stringify(Brain.styleRules)}
-----------------------------`;
}

function splitMsg(text) {
    const parts = []; const max = 4090;
    while (text.length > max) { let i = text.lastIndexOf('\n', max); if (i === -1) i = max; parts.push(text.substring(0, i)); text = text.substring(i).trim(); }
    if (text) parts.push(text); return parts;
}

// --- COMANDOS ---
bot.onText(/\/start/, async (msg) => {
    const name = Brain.userProfile.name || msg.from.first_name;
    const model = await getValidModel(msg.chat.id); // Verificamos conexión al inicio
    
    bot.sendMessage(msg.chat.id, 
        `🟣 *PROMETHEUS APEX v22.0*\n\nHola, ${name}.\nEstado: ${model ? 'Conectado' : 'Error de conexión'}.\n\n` +
        `🚀 *Capacidades Extendidas:*\n` +
        `• Arquitectura de Software (Full-Stack).\n` +
        `• Ingeniería Civil y Cálculo Estructural.\n` +
        `• Análisis de Documentos Técnicos.\n` +
        `• Memoria Contextual Profunda.\n\n` +
        `💬 *Escribe tu指令.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => { delete sessions[msg.chat.id]; bot.sendMessage(msg.chat.id, "♻️ Chat reiniciado."); });
bot.onText(/\/wipe/, (msg) => { 
    Brain = { identity: { version: "22.0" }, userProfile: {}, projectContext: {}, styleRules: [], activeModel: null }; 
    saveBrain(); 
    bot.sendMessage(msg.chat.id, "💥 Memoria y configuración borradas. Reiniciando..."); 
});

// --- NÚCLEO PRINCIPAL ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    const model = await getValidModel(chatId);
    if (!model) return;

    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });
    if (sessions[userId].length > 16) sessions[userId].shift();

    const systemPrompt = APEX_SYSTEM_PROMPT + buildContextString();

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(API_URL, {
            model: model,
            max_tokens: 4096, // Límite alto para código completo
            system: systemPrompt,
            messages: sessions[userId] // Claude usa historial directo (user/assistant)
        }, {
            headers: { 
                'x-api-key': API_KEY, 
                'anthropic-version': '2023-06-01', 
                'Content-Type': 'application/json' 
            }
        });

        let rawReply = response.data.content[0].text;
        const finalReply = processResponse(rawReply);
        
        sessions[userId].push({ role: "assistant", content: finalReply });

        const parts = splitMsg(finalReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("ERROR CLAUDE:", error.response ? error.response.data : error.message);
        // Si falla un modelo guardado, lo reseteamos para buscar otro en el siguiente intento
        if (Brain.activeModel) { Brain.activeModel = null; saveBrain(); }
        bot.sendMessage(chatId, `❌ *Error de Procesamiento.*\nEl modelo actual podría estar saturado. Intenta de nuevo.`, { parse_mode: 'Markdown' });
    }
});

// --- MANEJO DE PDF ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs.");

    const model = await getValidModel(chatId);
    if (!model) return;

    bot.sendMessage(chatId, "📄 Analizando documento técnico...");
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const textContent = data.text.substring(0, 7000);

        const payload = [{ role: "user", content: `Analiza el siguiente documento y extrae conclusiones técnicas:\n\n${textContent}` }];

        const apiRes = await axios.post(API_URL, {
            model: model,
            max_tokens: 4096,
            system: APEX_SYSTEM_PROMPT + buildContextString(),
            messages: payload
        }, { headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });

        const reply = processResponse(apiRes.data.content[0].text);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { bot.sendMessage(chatId, `❌ Error PDF: ${e.message}`); }
});

// --- MANEJO DE VISIÓN (CLAUDE SONNET) ---
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const model = await getValidModel(chatId);
    if (!model) return;

    try {
        const photo = msg.photo[msg.photo.length - 1];
        const link = await bot.getFileLink(photo.file_id);
        const imgRes = await axios.get(link, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const mime = 'image/jpeg';

        const payload = [{ 
            role: "user", 
            content: [
                { type: "image", source: { type: "base64", media_type: mime, data: b64 } },
                { type: "text", text: msg.caption || "Analiza esta imagen con visión técnica experta." }
            ]
        }];

        const res = await axios.post(API_URL, {
            model: model, // Claude Sonnet soporta visión nativa
            max_tokens: 1024,
            system: APEX_SYSTEM_PROMPT + buildContextString(),
            messages: payload
        }, { headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });

        const reply = processResponse(res.data.content[0].text);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) { bot.sendMessage(chatId, `❌ Error de Visión: ${e.message}`); }
});
