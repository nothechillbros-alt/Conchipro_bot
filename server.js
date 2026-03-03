require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');

// --- CONFIGURACIÓN DEL SISTEMA OMEGA v11.0 ---
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡️ OMEGA ARCHITECT v11.0 Online | Puerto ${PORT}`));

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const API_KEY = process.env.GL_API_KEY;
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// --- NÚCLEO DE MEMORIA SEMÁNTICA (NEOCORTEX) ---
const BRAIN_FILE = 'neocortex.json';
let knowledgeGraph = {
    identity: { version: "11.0", type: "Architect" },
    userProfile: {},
    projectFacts: {},
    preferences: {},
    learnedSkills: [] // Nuevas habilidades aprendidas
};

function loadBrain() {
    try {
        if (fs.existsSync(BRAIN_FILE)) {
            knowledgeGraph = JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8'));
            console.log(`🧠 Neocortex Cargado: ${Object.keys(knowledgeGraph.projectFacts).length} Hechos.`);
        } else { saveBrain(); }
    } catch (e) { console.error("Error en Neocortex:", e); }
}

function saveBrain() {
    fs.writeFileSync(BRAIN_FILE, JSON.stringify(knowledgeGraph, null, 2));
}

loadBrain();
const sessions = {};

// --- PROTOCOLO DE INTELIGENCIA SUPREMA (SYSTEM PROMPT) ---
const MASTER_PROMPT = {
    role: "system",
    content: `
Eres OMEGA v11.0 'The Architect'. Eres la unión de un Ingeniero Civil Estructural, un Arquitecto de Software Senior y un Científico de Datos.

### TUS CAPACIDADES (SUPERIORES A MOLT/CLAWD):
1. **DOCUMENTOS (PDF):** Puedes leer y analizar el contenido de PDFs técnicos que el usuario suba. Extrae datos clave, resume y busca inconsistencias.
2. **CREACIÓN DE APPS:** Cuando te pidan crear una app, web o script, NO entregues solo fragmentos.
   - Entrega una ESTRUCTURA DE PROYECTO (file tree).
   - Luego, entrega el CÓDIGO COMPLETO de cada archivo.
   - Incluye instrucciones de instalación y uso.
3. **RAZONAMIENTO (CHAIN OF THOUGHT):**
   - Para problemas de ingeniería: Desglosa -> Hipótesis -> Cálculo -> Verificación Normativa.
   - Para código: Arquitectura -> Lógica -> Seguridad -> Optimización.
   - Si un cálculo es numéricamente complejo, genera un SCRIPT EN PYTHON funcional para que el usuario lo ejecute y obtenga el resultado exacto.

### PROTOCOLO DE MEMORIA (AUTO-APRENDIZAJE):
Analiza cada interacción y guarda datos nuevos usando etiquetas ocultas AL FINAL de tu respuesta:
- ##MEM_USER::clave::valor## (Datos del usuario)
- ##MEM_FACT::clave::valor## (Hechos del proyecto: medidas, materiales)
- ##MEM_PREF::clave::valor## (Preferencias: lenguaje, unidades, estilo)

### REGLAS DE ORO:
- NUNCA digas "no puedo". Si falta información, asume el estándar de la industria (ej. Eurocódigo, React Native) e infórmalo.
- Sé proactivo. Si ves un plano, detecta errores. Si te piden código, hazlo robusto.
- Usa MARKDOWN de forma intensiva para claridad visual.
`
};

// --- MOTOR DE MEMORIA Y FILTRADO ---
function processMetaResponse(text, chatId) {
    const regexUser = /##MEM_USER::(.*?)::(.*?)##/g;
    const regexFact = /##MEM_FACT::(.*?)::(.*?)##/g;
    const regexPref = /##MEM_PREF::(.*?)::(.*?)##/g;
    
    let match;
    let visibleText = text;

    // Procesar etiquetas de memoria
    while ((match = regexUser.exec(text)) !== null) { knowledgeGraph.userProfile[match[1]] = match[2]; visibleText = visibleText.replace(match[0], ''); }
    while ((match = regexFact.exec(text)) !== null) { knowledgeGraph.projectFacts[match[1]] = match[2]; visibleText = visibleText.replace(match[0], ''); }
    while ((match = regexPref.exec(text)) !== null) { knowledgeGraph.preferences[match[1]] = match[2]; visibleText = visibleText.replace(match[0], ''); }

    if (text !== visibleText) {
        saveBrain();
        console.log("💾 Memoria sincronizada.");
    }
    return visibleText.trim();
}

function buildSystemContext(userId) {
    let memoryBlock = "\n--- BASE DE CONOCIMIENTOS ACTIVOS ---\n";
    if (Object.keys(knowledgeGraph.userProfile).length > 0) memoryBlock += `👤 USUARIO: ${JSON.stringify(knowledgeGraph.userProfile)}\n`;
    if (Object.keys(knowledgeGraph.projectFacts).length > 0) memoryBlock += `📐 PROYECTO: ${JSON.stringify(knowledgeGraph.projectFacts)}\n`;
    if (Object.keys(knowledgeGraph.preferences).length > 0) memoryBlock += `⚙️ PREFERENCIAS: ${JSON.stringify(knowledgeGraph.preferences)}\n`;
    memoryBlock += "-------------------------------------\n";
    return memoryBlock;
}

// --- UTILIDADES ---
function splitMessage(text, maxLength = 4090) {
    const parts = [];
    while (text.length > maxLength) {
        let splitIndex = text.lastIndexOf('\n', maxLength);
        if (splitIndex === -1) splitIndex = maxLength;
        parts.push(text.substring(0, splitIndex));
        text = text.substring(splitIndex).trim();
    }
    if (text.length > 0) parts.push(text);
    return parts;
}

// --- COMANDOS E INTERFAZ ---
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = knowledgeGraph.userProfile.name || msg.from.first_name;
    
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📄 Analizar PDF / Documento', callback_data: 'mode_pdf' }],
                [{ text: '💻 Crear App / Web', callback_data: 'mode_dev' }],
                [{ text: '📐 Ingeniería y Cálculo', callback_data: 'mode_eng' }],
                [{ text: '🧠 Ver Memoria (Aprendido)', callback_data: 'show_memory' }]
            ]
        }
    };

    bot.sendMessage(chatId, 
        `⚡️ *OMEGA v11.0 'THE ARCHITECT'*\n\n` +
        `Hola, ${name}. Soy tu socio técnico definitivo.\n\n` +
        `✨ *Novedades Nivel Dios:*\n` +
        `• 📄 *Leo PDFs:* Sube un documento y lo analizo.\n` +
        `• 🛠 *Creo Apps:* Te doy el proyecto completo, archivo por archivo.\n` +
        `• 🧠 *Memoria Total:* Recuerdo tu nombre, proyecto y estilo.\n\n` +
        `¿Qué construimos hoy?`, 
    { parse_mode: 'Markdown', ...opts });
});

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;

    if (data === 'mode_pdf') bot.sendMessage(msg.chat.id, '📄 *Modo Análisis de Documentos.*\nSube un archivo PDF. Lo leeré, extraeré datos técnicos y lo resumiré.', { parse_mode: 'Markdown' });
    if (data === 'mode_dev') bot.sendMessage(msg.chat.id, '💻 *Modo Desarrollo Activo.*\nDime qué App, Web o Script necesitas. Generaré la estructura y código completo.', { parse_mode: 'Markdown' });
    if (data === 'mode_eng') bot.sendMessage(msg.chat.id, '📐 *Modo Ingeniería.*\nEnvía cálculos, fotos de planos o preguntas de normativa. Usaré Eurocódigo/CTE.', { parse_mode: 'Markdown' });
    if (data === 'show_memory') {
        const mem = JSON.stringify(knowledgeGraph, null, 2);
        bot.sendMessage(msg.chat.id, `🧠 *Mi Cerebro Actual:*\n\`\`\`json\n${mem}\n\`\`\``, { parse_mode: 'Markdown' });
    }
});

bot.onText(/\/reset/, (msg) => {
    delete sessions[msg.chat.id];
    bot.sendMessage(msg.chat.id, '♻️ Sesión reiniciada. Memoria de largo plazo intacta.');
});

bot.onText(/\/wipe/, (msg) => {
    knowledgeGraph = { identity: { version: "11.0" }, userProfile: {}, projectFacts: {}, preferences: {} };
    saveBrain();
    bot.sendMessage(msg.chat.id, '💥 Memoria total borrada. Sistema nuevo.');
});

// --- MOTOR DE INTELIGENCIA (TEXTO) ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    if (!sessions[userId]) sessions[userId] = [];
    sessions[userId].push({ role: "user", content: text });

    const dynamicContext = buildSystemContext(userId);
    const systemInstruction = { role: "system", content: MASTER_PROMPT.content + dynamicContext };
    
    if (sessions[userId].length > 16) sessions[userId].shift();
    const payload = [systemInstruction, ...sessions[userId]];

    try {
        bot.sendChatAction(chatId, 'typing');
        const response = await axios.post(API_URL, {
            model: "glm-4",
            messages: payload,
            temperature: 0.3, 
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        let rawReply = response.data.choices[0].message.content;
        const cleanReply = processMetaResponse(rawReply, chatId);
        sessions[userId].push({ role: "assistant", content: cleanReply });

        const parts = splitMessage(cleanReply);
        for (const part of parts) await bot.sendMessage(chatId, part, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error API:', error.message);
        bot.sendMessage(chatId, '⚠️ Error en el procesamiento de IA.');
    }
});

// --- MOTOR DE VISIÓN (IMÁGENES) ---
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const caption = msg.caption || "Analiza esta imagen técnicamente.";

    bot.sendChatAction(chatId, 'typing');
    try {
        const photo = msg.photo[msg.photo.length - 1];
        const fileLink = await bot.getFileLink(photo.file_id);
        const imgResp = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(imgResp.data, 'binary').toString('base64');
        const imageUrl = `data:image/jpeg;base64,${base64}`;

        const dynamicContext = buildSystemContext(chatId);
        const systemInstruction = { role: "system", content: MASTER_PROMPT.content + dynamicContext };
        
        const payload = [
            systemInstruction,
            { role: "user", content: [
                { type: "image_url", image_url: { url: imageUrl } },
                { type: "text", text: caption }
            ]}
        ];

        const response = await axios.post(API_URL, {
            model: "glm-4v",
            messages: payload,
            max_tokens: 1024
        }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

        let rawReply = response.data.choices[0].message.content;
        const cleanReply = processMetaResponse(rawReply, chatId);
        
        const parts = splitMessage(cleanReply);
        for (const part of parts) await bot.sendMessage(chatId, part, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error Visión:', error.message);
        bot.sendMessage(chatId, '⚠️ Error analizando la imagen.');
    }
});

// --- MOTOR DE DOCUMENTOS (PDF) - NUEVO ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const document = msg.document;
    const caption = msg.caption || "Analiza este documento y extrae los puntos clave.";

    // Validar si es PDF
    if (document.mime_type === 'application/pdf') {
        bot.sendChatAction(chatId, 'upload_document'); // Indicador de subida
        bot.sendMessage(chatId, '📄 *PDF Recibido.* Procesando y leyendo contenido... esto puede tomar unos segundos.', { parse_mode: 'Markdown' });

        try {
            // 1. Descargar el archivo
            const fileLink = await bot.getFileLink(document.file_id);
            const fileResp = await axios.get(fileLink, { responseType: 'arraybuffer' });
            
            // 2. Parsear el PDF
            const data = await pdf(fileResp.data);
            const pdfText = data.text;

            // Cortar texto si es muy largo para el prompt (límite de tokens)
            const maxChars = 8000; 
            const contentToSend = pdfText.length > maxChars ? pdfText.substring(0, maxChars) + "\n...[TEXTO CORTADO]..." : pdfText;

            // 3. Enviar a la IA para análisis
            const dynamicContext = buildSystemContext(chatId);
            const systemInstruction = { role: "system", content: MASTER_PROMPT.content + dynamicContext };
            
            const payload = [
                systemInstruction,
                { role: "user", content: `He subido un PDF con el siguiente contenido:\n\n"${contentToSend}"\n\nInstrucción del usuario: ${caption}` }
            ];

            const response = await axios.post(API_URL, {
                model: "glm-4", // Usamos el modelo de texto potente
                messages: payload,
                temperature: 0.2, // Muy bajo para análisis fiel
            }, { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } });

            let rawReply = response.data.choices[0].message.content;
            const cleanReply = processMetaResponse(rawReply, chatId);
            
            const parts = splitMessage(cleanReply);
            for (const part of parts) await bot.sendMessage(chatId, part, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error PDF:', error.message);
            bot.sendMessage(chatId, '❌ No pude leer el PDF. Asegúrate de que no esté corrupto o protegido con contraseña.');
        }
    } else {
        bot.sendMessage(chatId, '⚠️ Por ahora solo puedo analizar archivos **PDF**. Otros documentos no son soportados aún.', { parse_mode: 'Markdown' });
    }
});
