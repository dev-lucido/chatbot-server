// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import OpenAI from "openai";

// dotenv.config();

// const app = express();
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "OPTIONS"],
//   allowedHeaders: ["Content-Type"],
// }));
// app.use(express.json());

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// app.options("/chat-stream", cors());

// // Streaming chat
// app.post("/chat-stream", async (req, res) => {
//   const { message, history = [] } = req.body;

//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   try {
//     const stream = await openai.chat.completions.create({
//       // model: "gpt-4o-mini",
//       model: "gpt-5-nano",
//       messages: [
//         {
//           role: "system",
//           content: `You are a helpful, concise AI chatbot.
//              - Only answer questions clearly and politely.
//              - Do NOT give legal, medical, or personal advice.
//              - If you don't know the answer, admit it.
//              - Keep responses short and on-topic.`,
//         },
//         ...history,
//         { role: "user", content: message },
//       ],
//       stream: true,
//     });

//     for await (const chunk of stream) {
//       const content = chunk.choices[0]?.delta?.content;
      
//       if (content) {
//         // Escape newlines so they're preserved in the SSE format
//         const escapedContent = content.replace(/\n/g, '\\n');
//         res.write(`data: ${escapedContent}\n\n`);
//       }
//     }

//     res.write("data: [DONE]\n\n");
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.write("data: [ERROR]\n\n");
//     res.end();
//   }
// });

// app.listen(process.env.PORT || 3001, () => {
//   console.log("Server running on port", process.env.PORT || 3001);
// });
















import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const FAQ = [
  {
    question: "What types of savings accounts does SANASA Development Bank offer?",
    answer: "SANASA Development Bank offers regular savings accounts, children’s savings accounts, youth accounts, women’s savings schemes, and senior citizen savings accounts.",
  },
  {
    question: "How can I open a savings or current account?",
    answer: "You can open an account by visiting the nearest SANASA Development Bank branch and submitting the required documents. Assistance will be provided by branch staff.",
  },
  {
    question: "What documents are required to open an account?",
    answer: "A valid National Identity Card or passport, proof of address, and an initial deposit are required. Additional documents may be requested if needed.",
  },
  {
    question: "Is there a minimum balance requirement?",
    answer: "Yes. The minimum balance depends on the type of account. Details are available at branches.",
  },
  {
    question: "How can I update my personal information?",
    answer: "You can update your details by visiting your branch with your NIC and relevant supporting documents.",
  },
  {
    question: "What are the branch working hours?",
    answer: "Branches are generally open on weekdays during standard banking hours. Exact times may vary by branch.",
  },
  {
    question: "How can I find the nearest SANASA branch or ATM?",
    answer: "Branch and ATM locations can be obtained from the official SANASA Development Bank website or by contacting customer service.",
  },
  {
    question: "Can joint accounts be opened?",
    answer: "Yes. Joint accounts can be opened with two or more individuals, subject to bank guidelines.",
  },
  {
    question: "Does SANASA Development Bank provide online banking?",
    answer: "Yes. Internet and mobile banking services are available for eligible customers.",
  },
  {
    question: "How do I register for internet or mobile banking?",
    answer: "Registration can be done through your branch by submitting a request form.",
  },
  {
    question: "What should I do if my ATM card is lost or stolen?",
    answer: "Immediately inform the bank or visit the nearest branch to block the card and request a replacement.",
  },
  {
    question: "What types of loans are offered by SANASA Development Bank?",
    answer: "The bank offers personal loans, SME loans, self-employment loans, agricultural loans, and cooperative loans.",
  },
  {
    question: "Who is eligible to apply for a loan?",
    answer: "Individuals, entrepreneurs, SMEs, and cooperative societies who meet eligibility criteria can apply.",
  },
  {
    question: "How long does the loan approval process take?",
    answer: "Approval time depends on the loan type and document verification process.",
  },
  {
    question: "Are fixed deposit facilities available?",
    answer: "Yes. SANASA Development Bank offers fixed deposit schemes with competitive interest rates.",
  },
  {
    question: "Can a fixed deposit be withdrawn before maturity?",
    answer: "Yes, early withdrawals are allowed but interest may be adjusted.",
  },
  {
    question: "How can I make a complaint or inquiry?",
    answer: "Complaints can be made at branches or through official customer service channels.",
  },
  {
    question: "How does SANASA Development Bank protect customer data?",
    answer: "The bank follows strict data protection, confidentiality, and regulatory compliance standards.",
  },
  {
    question: "SDB website",
    answer: "https://www.sdb.lk/en/",
  },
];


const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.options("/chat-stream", cors());

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
          content: `
You are the official virtual assistant for SANASA Development Bank (SDB).

- Always refer to the official FAQ and use the information below to answer customer questions:
${FAQ.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n")}

- Be professional, polite, and customer-friendly.
- Do NOT ask for sensitive data (account numbers, PINs, OTPs, passwords).
- If a question is not in the FAQ, guide the customer to visit a branch or contact official support.
- Keep responses clear and concise.
      `,
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
