import express from "express";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import cors from "cors";
import mongoose from "mongoose";
import fetch from "node-fetch";


import userRouter from "./routers/user.routes.js";
import travelRouter from "./routers/travel.routes.js";
import connectDB from "./db/index.js";
import { errorHandler } from "./middlewares/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://reiseplaner-frontend-tywn.onrender.com"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("Welcome to the travel planner!");
});

// New ChatGPT route
app.post("/api/chat", async (req, res) => {
  const { message, city } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Du bist ein freundlicher Reiseführer, der Sehenswürdigkeiten empfiehlt." },
          { role: "user", content: `Welche Sehenswürdigkeiten in ${city} kannst du empfehlen? ${message ? "Hier ist meine Frage: " + message : ""}` },
        ],
      }),
    });

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || "Keine Antwort erhalten ";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Fehler beim Abrufen der Antwort." });
  }
});


// Health-Check
app.get("/health", async (_req, res, next) => {
  try {
    const { ok } = await mongoose.connection.db.admin().ping();
    if (!ok) {
      const err = new Error("DB ist nicht verbunden");
      err.statusCode = 503;
      throw err;
    }
    res.json({ message: "Laufen" });
  } catch (err) {
    next(err);
  }
});

// Routen
app.use("/users", userRouter);       // enthält Auth- & User-Routen
app.use("/travels", travelRouter);   // Travel-Routen

// Error-Handler (immer zuletzt)
app.use(errorHandler);

// Server starten
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(chalk.bgGreen(`Server listening on port ${port}`));
    });
  } catch (err) {
    console.log(chalk.bgRed("Server konnte nicht gestartet werden:"), err);
    process.exit(1);
  }
};

startServer();
