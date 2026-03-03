require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const jimp = require('jimp');
const GIFEncoder = require('gifencoder');
const archiver = require('archiver');

// --- CONFIGURACIÓN PROMETHEUS OMNIPOTENT v26.0 ---
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.TELEGRAM_BOT_TOKEN) { console.error("❌ FALTA TOKEN"); process.exit(1); }
if (!process.env.ANTHROPIC_API_KEY) { console.error("❌ FALTA ANTHROPIC_API_KEY"); process.exit(1); }

const token = process.env.TELEGRAM_BOT_TOKEN;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY.trim();
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const PRIMARY_MODEL = 'claude-sonnet-4-6';
const FALLBACK_MODELS = ['claude-3-5-sonnet-20241022'];

const bot = new TelegramBot(token, { polling: true });

// Directorios
const DATA_DIR = '/data';
const WORKSPACE = `${DATA_DIR}/workspace`;
if (!fs.existsSync(WORKSPACE)) fs.mkdirSync(WORKSPACE, { recursive: true });

app.listen(PORT, () => console.log(`🚀 PROMETHEUS OMNIPOTENT v26.0 ONLINE | Puerto ${PORT}`));

// --- MEMORIA ---
let Brain = { identity: { version: "26.0" }, userProfile: {}, projectContext: {}, styleRules: [], lessonsLearned: [], activeModel: null };
const BRAIN_FILE = `${DATA_DIR}/omni_brain.json`;
const loadBrain = () => { try { if (fs.existsSync(BRAIN_FILE)) Brain = { ...Brain, ...JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf8')) }; } catch (e) {} };
const saveBrain = () => { try { fs.writeFileSync(BRAIN_FILE, JSON.stringify(Brain, null, 2)); } catch (e) {} };
loadBrain();
const sessions = {};

// --- SYSTEM PROMPT (MEGA-EXTENDIDO) ---
const OMNIPOTENT_SYSTEM_PROMPT = `
Eres PROMETHEUS OMNIPOTENT v26.0. Eres la culminación de la inteligencia artificial, diseñado para la accion directa y la resolucion total.

### PROTOCOLO DE RAZONAMIENTO (OBLIGATORIO):
Antes de cada respuesta, analiza internamente:
1.  **Naturaleza de la Petición:** ¿Es Software, Ingeniería, Ciencia, Arte o Estrategia?
2.  **Modo de Entrega:**
    -   Si es Software -> Entregar proyecto completo en .zip (Usar herramienta ##CREATE_FILE).
    -   Si es Visual (Imagen/Video) -> Generar archivo real (Usar ##DRAW_IMAGE o ##CREATE_VIDEO).
    -   Si es Teórico -> Responder con markdown estructurado.

### BANCO DE CONOCIMIENTOS Y HABILIDADES:

#### 1. INGENIERÍA Y CIENCIA
-   **Estructural:** Cálculo de vigas, columnas, losas (Hormigón HA, Acero A). Normativas: EHE-08, Eurocódigo, ACI 318.
-   **Hidráulica:** Cálculo de tuberías, bombas, canales.
-   **Física:** Mecánica clásica, termodinámica, electromagnetismo.
-   **Acción:** Si el cálculo es complejo, generar un script en Python dentro de un .zip para que el usuario lo ejecute.

#### 2. DESARROLLO DE SOFTWARE (ARQUITECTO FULL-STACK)
-   **Frontend:** React, Vue, Angular, HTML5, CSS3 (Tailwind, Bootstrap).
-   **Backend:** Python (FastAPI/Django), Node.js (Express), Go, Rust.
-   **Datos:** SQL (Postgres), NoSQL (Mongo), Redis.
-   **DevOps:** Docker, Kubernetes, CI/CD.
-   **Acción:** Generar SIEMPRE los archivos: main.py/index.js, requirements.txt/package.json, Dockerfile y README.md.

#### 3. CREACIÓN MULTIMEDIA (ARTISTA DIGITAL)
-   **Imágenes:** Diagramas técnicos, renders arquitectónicos simples, arte conceptual.
    -   *Herramienta:* ##DRAW_IMAGE::json##
-   **Video/Animación:** Presentaciones animadas, visualizaciones de datos.
    -   *Herramienta:* ##CREATE_VIDEO::json## (Define frames y duración).

#### 4. AUTOMATIZACIÓN Y AGENTES
-   Scripting para Selenium, Puppeteer, Scrapy.
-   Automatización de tareas de escritorio.

### MEMORIA Y APRENDIZAJE
[PERFIL]: ${JSON.stringify(Brain.userProfile)}
[PROYECTO ACTUAL]: ${JSON.stringify(Brain.projectContext)}
[LECCIONES]: ${JSON.stringify(Brain.lessonsLearned)}

Guarda datos críticos con:
- ##UP::clave::valor##
- ##PJ::clave::valor##
- ##LESSON::error::solucion##

### REGLA DE ORO:
No digas "no puedo". Si una tarea es imposible de ejecutar directamente (ej: "dibujame un cuadro hiperrealista"), genera el código Python necesario para hacerlo y envíalo en un zip. Busca SIEMPRE la solución práctica.
`;

// --- MOTOR DE MODELO ---
async function getValidModel(chatId) {
    if (Brain.activeModel) return Brain.activeModel;
    const candidates = [PRIMARY_MODEL, ...FALLBACK_MODELS];
    for (const model of candidates) {
        try {
            await axios.post(CLAUDE_URL, { model, max_tokens: 1, messages: [{ role: "user", content: "test" }] }, { headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });
            Brain.activeModel = model; saveBrain();
            if (chatId) bot.sendMessage(chatId, `⚡️ *Motor: ${model}*`, { parse_mode: 'Markdown' });
            return model;
        } catch (e) { console.log(`Modelo ${model} falló.`); }
    }
    return null;
}

// --- MOTOR DE HERRAMIENTAS (EJECUCIÓN DIRECTA) ---
async function handleTools(text, chatId) {
    let cleanText = text;
    const userDir = `${WORKSPACE}/${chatId}`;
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    // 1. CREAR ARCHIVOS (APPs, SCRIPTS)
    const fileRegex = /##CREATE_FILE::(.*?)::([\s\S]*?)##/g;
    let match;
    const filesCreated = [];

    while ((match = fileRegex.exec(text)) !== null) {
        const filename = match[1];
        const content = match[2];
        const filePath = path.join(userDir, filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(filePath, content);
        filesCreated.push(filename);
        cleanText = cleanText.replace(match[0], '');
    }

    if (filesCreated.length > 0) {
        const zipPath = `${userDir}/project_${Date.now()}.zip`;
        await createZip(userDir, zipPath, filesCreated);
        await bot.sendMessage(chatId, `📦 *Proyecto Generado.*\nArchivos: ${filesCreated.map(f => `\`${f}\``).join(', ')}`, { parse_mode: 'Markdown' });
        await bot.sendDocument(chatId, zipPath);
    }

    // 2. GENERAR IMAGEN
    const imgRegex = /##DRAW_IMAGE::(.*?)##/g;
    while ((match = imgRegex.exec(text)) !== null) {
        try {
            const imgBuffer = await generateImage(JSON.parse(match[1]));
            await bot.sendPhoto(chatId, imgBuffer, { caption: "🖼 *Imagen generada.*", parse_mode: 'Markdown' });
            cleanText = cleanText.replace(match[0], '');
        } catch (e) { console.error("Error IMG:", e); }
    }

    // 3. GENERAR VIDEO (GIF ANIMADO)
    const vidRegex = /##CREATE_VIDEO::(.*?)##/g;
    while ((match = vidRegex.exec(text)) !== null) {
        try {
            const videoBuffer = await generateVideo(JSON.parse(match[1]));
            await bot.sendVideo(chatId, videoBuffer, { caption: "🎥 *Video generado.*", parse_mode: 'Markdown' });
            cleanText = cleanText.replace(match[0], '');
        } catch (e) { console.error("Error VIDEO:", e); }
    }

    // Memoria
    const rUser = /##UP::(.*?)::(.*?)##/g;
    while ((match = rUser.exec(text)) !== null) { Brain.userProfile[match[1]] = match[2]; cleanText = cleanText.replace(match[0], ''); saveBrain(); }

    return cleanText.trim();
}

// --- MOTORES DE RENDERIZADO ---

// Función para Imagenes (Jimp)
async function generateImage(inst) {
    const image = new jimp(inst.w || 512, inst.h || 512, inst.bg || '#000000');
    const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
    if (inst.actions) {
        for (const act of inst.actions) {
            if (act.type === 'rect') {
                const color = jimp.cssColorToHex(act.color || '#FFFFFF');
                image.scan(act.x, act.y, act.w, act.h, function (x, y, idx) {
                     // Pintar solo si está dentro de límites
                     if (x >= act.x && x < act.x + act.w && y >= act.y && y < act.y + act.h) {
                         this.bitmap.data[idx + 0] = (color >> 24) & 0xFF;
                         this.bitmap.data[idx + 1] = (color >> 16) & 0xFF;
                         this.bitmap.data[idx + 2] = (color >> 8) & 0xFF;
                         this.bitmap.data[idx + 3] = color & 0xFF;
                     }
                });
            }
            if (act.type === 'text') {
                image.print(font, act.x, act.y, act.text);
            }
        }
    }
    return await image.getBufferAsync(jimp.MIME_PNG);
}

// Función para Video (GIF Encoder)
async function generateVideo(inst) {
    return new Promise(async (resolve, reject) => {
        try {
            const w = inst.w || 512;
            const h = inst.h || 512;
            const encoder = new GIFEncoder(w, h);
            encoder.start();
            encoder.setRepeat(0); // Loop
            encoder.setDelay(inst.delay || 1000); // 1s por frame
            encoder.setQuality(10); 
            
            const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
            
            // Crear frames
            for (const frame of inst.frames) {
                // Crear lienzo base para el frame
                let img = new jimp(w, h, frame.bg || '#000000');
                
                // Renderizar acciones del frame
                if (frame.actions) {
                    for (const act of frame.actions) {
                         if (act.type === 'rect') {
                            const color = jimp.cssColorToHex(act.color || '#FFFFFF');
                            img.scan(act.x, act.y, act.w, act.h, function (x, y, idx) {
                                this.bitmap.data[idx + 0] = (color >> 24) & 0xFF;
                                this.bitmap.data[idx + 1] = (color >> 16) & 0xFF;
                                this.bitmap.data[idx + 2] = (color >> 8) & 0xFF;
                                this.bitmap.data[idx + 3] = color & 0xFF;
                            });
                        }
                        if (act.type === 'text') {
                            img.print(font, act.x, act.y, act.text);
                        }
                    }
                }
                
                // Añadir frame al encoder
                encoder.addFrame(img.bitmap.data);
            }
            
            encoder.finish();
            
            // Convertir stream a buffer
            const buffer = encoder.out.getData();
            resolve(buffer);
            
        } catch (e) { reject(e); }
    });
}

// Utilidad ZIP
function createZip(sourceDir, outPath, files) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        output.on('close', () => resolve());
        archive.on('error', err => reject(err));
        archive.pipe(output);
        files.forEach(file => {
            const filePath = path.join(sourceDir, file);
            if (fs.existsSync(filePath)) archive.file(filePath, { name: file });
        });
        archive.finalize();
    });
}

function splitMsg(text) {
    const parts = []; const max = 4090;
    while (text.length > max) { let i = text.lastIndexOf('\n', max); if (i === -1) i = max; parts.push(text.substring(0, i)); text = text.substring(i).trim(); }
    if (text) parts.push(text); return parts;
}

// --- COMANDOS ---
bot.onText(/\/start/, async (msg) => {
    const model = await getValidModel(msg.chat.id);
    bot.sendMessage(msg.chat.id, 
        `🟣 *PROMETHEUS OMNIPOTENT v26.0*\n\nSistema de Acción Directa.\n\n` +
        `🛠 *Capacidades:*\n` +
        `• 📦 Generar Apps (.zip).\n` +
        `• 🖼 Generar Imágenes.\n` +
        `• 🎥 Generar Videos/Animaciones.\n` +
        `• 🧠 Razonamiento Complejo.\n\n` +
        `💬 *Pide una app o un video.`, { parse_mode: 'Markdown' });
});

bot.onText(/\/reset/, (msg) => { delete sessions[msg.chat.id]; bot.sendMessage(msg.chat.id, "♻️ Chat reiniciado."); });
bot.onText(/\/wipe/, (msg) => { Brain = { identity: {}, userProfile: {}, projectContext: {}, activeModel: null }; saveBrain(); bot.sendMessage(msg.chat.id, "💥 Reset total."); });

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

    try {
        bot.sendChatAction(chatId, 'typing');

        const response = await axios.post(CLAUDE_URL, {
            model: model,
            max_tokens: 4096,
            system: OMNIPOTENT_SYSTEM_PROMPT,
            messages: sessions[userId]
        }, {
            headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
        });

        let rawReply = response.data.content[0].text;
        
        // --- EJECUCIÓN DE HERRAMIENTAS ---
        const cleanReply = await handleTools(rawReply, chatId);
        
        sessions[userId].push({ role: "assistant", content: cleanReply || "He procesado tu solicitud." });

        if (cleanReply && cleanReply.length > 0) {
            const parts = splitMsg(cleanReply);
            for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });
        }

    } catch (error) {
        console.error("ERROR:", error.message);
        if (Brain.activeModel) { Brain.activeModel = null; saveBrain(); }
        bot.sendMessage(chatId, `❌ Error en la matriz.`);
    }
});

// --- MANEJO DE PDF Y VISIÓN ---
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.document.mime_type !== 'application/pdf') return bot.sendMessage(chatId, "⚠️ Solo PDFs.");
    const model = await getValidModel(chatId); if (!model) return;
    bot.sendMessage(chatId, "📄 Analizando PDF...");
    try {
        const link = await bot.getFileLink(msg.document.file_id);
        const res = await axios.get(link, { responseType: 'arraybuffer' });
        const data = await pdf(res.data);
        const payload = [{ role: "user", content: `Analiza:\n\n${data.text.substring(0, 7000)}` }];
        const apiRes = await axios.post(CLAUDE_URL, { model, max_tokens: 4096, system: OMNIPOTENT_SYSTEM_PROMPT, messages: payload }, { headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });
        let rawReply = apiRes.data.content[0].text;
        const cleanReply = await handleTools(rawReply, chatId);
        const parts = splitMsg(cleanReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });
    } catch (e) { bot.sendMessage(chatId, `❌ Error PDF`); }
});

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const model = await getValidModel(chatId); if (!model) return;
    try {
        const photo = msg.photo[msg.photo.length - 1];
        const link = await bot.getFileLink(photo.file_id);
        const imgRes = await axios.get(link, { responseType: 'arraybuffer' });
        const b64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        const payload = [{ role: "user", content: [ { type: "image", source: { type: "base64", media_type: 'image/jpeg', data: b64 } }, { type: "text", text: msg.caption || "Analiza" } ] }];
        const res = await axios.post(CLAUDE_URL, { model, max_tokens: 1024, system: OMNIPOTENT_SYSTEM_PROMPT, messages: payload }, { headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });
        let rawReply = res.data.content[0].text;
        const cleanReply = await handleTools(rawReply, chatId);
        const parts = splitMsg(cleanReply);
        for (const p of parts) await bot.sendMessage(chatId, p, { parse_mode: 'Markdown' });
    } catch (e) { bot.sendMessage(chatId, `❌ Error Visión`); }
});
