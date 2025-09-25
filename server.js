import express from "express";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import cors from "cors";
import mongoose from "mongoose";

import userRouter from "./routers/user.routes.js";
import travelRouter from "./routers/travel.routes.js";
import connectDB from "./db/index.js";
import { errorHandler } from "./middlewares/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.send("Welcome to the travel planner!");
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
