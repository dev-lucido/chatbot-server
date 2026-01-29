import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Streaming chat
app.post("/chat-stream", async (req, res) => {
  const { message, history = [] } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `You are a helpful, concise AI chatbot.
             - Only answer questions clearly and politely.
             - Do NOT give legal, medical, or personal advice.
             - If you don't know the answer, admit it.
             - Keep responses short and on-topic.`,
        },
        ...history,
        { role: "user", content: message },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      
      if (content) {
        // Escape newlines so they're preserved in the SSE format
        const escapedContent = content.replace(/\n/g, '\\n');
        res.write(`data: ${escapedContent}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error(err);
    res.write("data: [ERROR]\n\n");
    res.end();
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port", process.env.PORT || 3001);
});