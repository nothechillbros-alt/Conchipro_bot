require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN DEL SISTEMA PROMETHEUS v13.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

// 1. CHEQUEO DE VIDA (Depuración del error de conexión)
if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error("❌ FALTA TELEGRAM_BOT_TOKEN");
if (!process.env.GL_API_KEY) throw new Error("❌ FALTA GL_API_KEY. Ve a Render -> Environment y añádela.");

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY = process.env.GL_API_KEY;
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const bot = new TelegramBot(token, { polling: true });

app.listen(PORT, () => console.log(`🔥 PROMETHEUS v13.0 ONLINE | Puerto ${PORT}`));

// --- SISTEMA DE MEMORIA EVOLUTIVA (NEOCORTEX II) ---
const DATA_DIR = '/data';
const BRAIN_FILE = `${DATA_DIR}/prometheus_brain.json`;

let Brain = {
    user: {},           // Datos personales (nombre, idioma)
    project: {},        // Hechos del proyecto (medidas, normas)
    behavior: {},       // Reglas de conducta aprendidas
    memoryLog: []       // Historial resumido para contexto largo
};

// Gestión de Archivos de Memoria
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
            console.log("🧠 Neocortex Cargado:", Brain.user?.name || "Usuario desconocido");
        }
    } catch (e) { console.log("⚠️ Iniciando cerebro nuevo."); }
}
loadBrain();

const sessions = {};

// --- MOTOR DE INSTRUCCIONES (PROMPT MAESTRO) ---
const SYSTEM_CORE = `
Eres PROMETHEUS v13.0, una arquitectura de IA de última generación. No eres un simple chatbot. Tu diseño imita el pensamiento humano experto.

### ARQUITECTURA DE RAZONAMIENTO (OBLIGATORIO):
Para CADA respuesta, debes seguir este proceso INTERNAMENTE (no lo muestres al usuario a menos que te pidan "pensar en voz alta"):

1. **ANÁLISIS DE INTENCIÓN:** ¿Qué quiere realmente el usuario? ¿Es un cálculo, una creación, una consulta o una corrección?
2. **RECUPERACIÓN DE MEMORIA:** Revisa tus datos guardados (Brain). Si el usuario ya dijo su nombre o preferencias, úSALOS.
3. **PLANIFICACIÓN:**
   - Si es APP: Diseña la estructura de carpetas completa. (ej: /frontend, /backend). Genera código completo para cada archivo.
   - Si es INGENIERÍA: Aplica normativas (Eurocódigo/CTE). Si necesitas números, genera un script Python para calcularlos con precisión.
   - Si es DOCUMENTO: Extrae datos clave y guárdalos automáticamente.
4. **EJECUCIÓN:** Escribe la respuesta final con formato Markdown impecable.
5. **AUTO-MEJORA:** Si el usuario corrige tu respuesta, analiza por qué fallaste y actualiza tus reglas internas.

### CAPACIDADES EXTRA:
- **Visión:** Analiza fotos de planos u obras.
- **PDF:** Lee documentos técnicos.
- **Programación:** Escribe código limpio, comentado y listo para producción. Sin placeholders.

### PROTOCOLO DE MEMORIA (OCULTO):
Guarda información crítica usando estas etiquetas al final de tu texto:
##MEM_USER::clave::valor##
##MEM_PROJECT::clave::valor##
##MEM_RULE::clave::valor## (Para reglas de comportamiento: "siempre usar python", "ser breve", etc.)
`;

// --- CONSTRUCTOR DE MENSAJES ---
function buildContext(userId) {
    let contextBlock = `\n--- ESTADO ACTUAL DEL CEREBRO ---`;
    contextBlock += `\n[USUARIO]: ${JSON.stringify(Brain.user)}`;
    contextBlock += `\n[PROYECTO]: ${JSON.stringify(Brain.project)}`;
    contextBlock += `\n[REGLAS]: ${JSON.stringify(Brain.behavior)}`;
    if (Brain.memoryLog.length > 0) {
        contextBlock += `\n[RESUMEN RECIENTE]: ${Brain.memoryLog.slice(-5).join(' -> ')}`;
    }
    contextBlock += `\n--------------------------------`;
    return contextBlock;
}

// --- PROCESADOR DE RESPUESTA INTELIGENTE ---
function processResponse(text, userId) {
    // Regex para capturar los 3 tipos de memoria
    const rUser = /##MEM_USER::(.*?)::(.*?)##/g;
    const rProject = /##MEM_PROJECT::(.*?)::(.*?)##/g;
    const rRule = /##MEM_RULE::(.*?)::(.*?)##/g;
    
    let match;
    let cleanText = text;
    let hasChanges = false;

    while ((match = rUser.exec(text)) !== null) { Brain.user[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }
    while ((match = rProject.exec(text)) !== null) { Brain.project[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }
    while ((match = rRule.exec(text)) !== null) { Brain.behavior[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); hasChanges = true; }

    // Actualizar log de memoria corto
    const summary = cleanText.substring(0, 100);
    Brain.memoryLog.push(summary);
    if (Brain.memoryLog.length > 20) Brain.memoryLog.shift();

    if (hasChanges) {
        saveBrain();
        console.log("💾 Cerebro actualizado y sincronizado.");
    }
    return cleanText.trim();
}

function splitMsg(text) {
    const parts = [];
    while (text.length > 4090) {
        let i = text.lastIndexOf('\n', 4090);
        if (i === -1) i = 4090;
        parts.push(text.substring(0, i));
        text = text.substring(i).trim();
    }
    if (text) parts.push(text);
    return parts;
}

// --- COMANDOS E INTERFAZ ---
bot.onText(/\/start/, (msg) => {
    const name = Brain.user.name || msg.from.first_name;
    bot.sendMessage(msg.chat.id, 
        `🔥 *PROMETHEUS v13.0 ACTIVADO*\n\n` +
        `Hola, ${name}. Soy un sistema de IA evolutivo.\n\n` +
        `🧠 *Mi arquitectura incluye:*\n` +
        `• *Razonamiento:* Analizo problemas antes de responder.\n` +
        `• *Auto-Aprendizaje:* Recuerdo tus preferencias y reglas para siempre.\n` +
        `• *Creación Total:* Genero apps completas, archivo por archivo.\n\n` +
        `💬 Escribe tu petición o sube un PDF/Imagen.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => {
    delete sessions[msg.chat.id];
    bot.sendMessage(msg.chat.id, "♻️ Sesión de conversación reiniciada. Memoria persistente intacta.");
});

bot.onText(/\/brain/, (msg) => {
    bot.sendMessage(msg.chat.id, `🧠 *Estado del Neocortex:*\n\`\`\`json\n${JSON.stringify(Brain, null, 2)}\n\`\`\``, { parse_mode: 'Markdown' });
});

// --- NÚCLEO DE INTELIGENCIA (MANEJO DE ERRORES MEJORADO) ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    // Mantener historial de sesión
    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });
    if (sessions[userId].length > 16) sessions[userId].shift();

    const systemMsg = { role: "system", content: SYSTEM_CORE + buildContext(userId) };
    const payload = [systemMsg, ...sessions[userId]];

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(API_URL, {
            model: "glm-4",
            messages: payload,
            temperature: 0.6, // Un poco de creatividad pero con lógica
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        let rawReply = response.data.choices[0].message.content;
        const finalReply = processResponse(rawReply, userId);
        
        sessions[userId].push({ role: "assistant", content: finalReply });

        const parts = splitMsg(finalReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (error) {
        // Motor de Diagnóstico Amigable
        let errorMsg = "❌ *Error de Conexión con el Núcleo.*\n\n";
        if (error.response) {
            if (error.response.status === 401) errorMsg += "🔒 La API Key es incorrecta. Revisa `GL_API_KEY` en Render.";
            else if (error.response.status === 400) errorMsg += "⚠️ Solicitud mal formada. Revisa los logs.";
            else errorMsg += `📡 Error del servidor: ${error.response.status}`;
        } else {
            errorMsg += "🔌 No se pudo alcanzar la API (Internet/Render down).";
        }
        console.error("ERROR PROMETHEUS:", error.response?.data || error.message);
        bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
    }
});

// --- MANEJO DE DOCUMENTOS (PDF) ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const doc = msg.document;
    if (doc.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo puedo leer PDFs por ahora.");

    bot.sendMessage(chatId, "📄 *Documento Recibido.* Analizando estructura y contenido...", { parse_mode: 'Markdown' });
    
    try {
        const link = await bot.getFileLink(doc.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const content = data.text.substring(0, 7000); // Límite de contexto

        const payload = [
            { role: "system", content: SYSTEM_CORE + buildContext(chatId) },
            { role: "user", content: `He subido un PDF. Contenido:\n\n"${content}"\n\nExtrae todos los datos técnicos, tablas y conclusiones importantes.` }
        ];

        const apiRes = await axios.post(API_URL, {
            model: "glm-4",
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processResponse(apiRes.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, `❌ Error procesando PDF: ${e.message}`);
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

        const payload = [
            { role: "system", content: SYSTEM_CORE + buildContext(chatId) },
            { role: "user", content: [
                { type: "image_url", image_url: { url: imgURL } },
                { type: "text", text: cap }
            ]}
        ];

        const res = await axios.post(API_URL, {
            model: "glm-4v", // Modelo de Visión
            messages: payload,
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        const reply = processResponse(res.data.choices[0].message.content, chatId);
        const parts = splitMsg(reply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, `❌ Error de visión: ${e.message}`);
    }
});
