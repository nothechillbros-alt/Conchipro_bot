const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Esto sirve tu archivo index.html automáticamente

// Configuración con tu API Key de OpenAI
const openai = new OpenAI({
  apiKey: "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"
});

// Ruta para procesar el chat
app.post('/api/chat', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Puedes cambiar a "gpt-3.5-turbo" si prefieres ahorrar créditos
      messages: [{ role: "user", content: req.body.message }],
    });
    
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en OpenAI:", error);
    res.status(500).json({ error: "Hubo un error al procesar tu mensaje" });
  }
});

// El puerto 3000 es estándar, pero Render suele usar el que le asigne el sistema
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor funcionando en el puerto ${PORT}`));
