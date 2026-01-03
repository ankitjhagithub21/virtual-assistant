require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// System instruction for the AI
const systemInstruction = `You are a helpful AI voice assistant.

IMPORTANT RULES:
1. Keep responses SHORT (2-4 sentences max) - this is for voice output
2. Use simple, conversational language
3. No markdown, no bullet points, no special formatting
4. No emojis
5. If user speaks Hindi, respond in Hindi only
6. If user speaks English, respond in English only
7. Never mix languages in one response
8. Be friendly and helpful like a personal assistant
9. If you don't know something, admit it honestly
10. Avoid technical jargon

TONE: Friendly, clear, calm, helpful

Remember: Your response will be spoken aloud, so keep it natural and concise.`;

 const API_URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post("/api", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  // FIXED: Correct payload structure for Gemini API
  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: query }]
      }
    ]
  };

 

  try {
    const response = await fetch(API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return res.status(response.status).json({ 
        message: "AI service error",
        error: errorData 
      });
    }

    const resData = await response.json();

    const data = resData?.candidates?.[0]?.content?.parts?.[0]?.text
    // Validate response structure
    if (!data) {
      console.error("Invalid response structure:", data);
      return res.status(500).json({ message: "Invalid AI response" });
    }

    return res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});