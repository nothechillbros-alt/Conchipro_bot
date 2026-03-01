const express = require('express');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());
app.use(express.static('.')); // Sirve tu index.html

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Aquí es donde Render pondrá la clave
});

app.post('/api/chat', async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: req.body.message }],
  });
  res.json({ reply: completion.choices[0].message.content });
});

app.listen(3000, () => console.log('Servidor listo'));
