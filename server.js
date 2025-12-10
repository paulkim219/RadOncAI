// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse incoming JSON bodies

// The Route
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server API Key not configured' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-5-nano",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that can answer questions about Radiation Oncology."
                    },
                    {
                        role: "user", 
                        content: userMessage 
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Forward OpenAI error to frontend
            return res.status(response.status).json(data);
        }

        // Send just the relevant text back to frontend
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});