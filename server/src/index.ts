import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import authRouter from "./routes/auth.js";
import "./config/passport.js";
import forecastRouter from "./routes/forecast.js";
import userRouter from "./routes/user.js";
import boardsRouter from "./routes/boards.js";
import sessionRouter from "./routes/session.js";
import postsRouter from "./routes/posts.js";

// Load environment variables FIRST
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Enable CORS only in dev
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
}

// Authentication Route
app.use("/auth", authRouter);
app.use("/forecast", forecastRouter);
app.use("/user", userRouter);
app.use("/boards", boardsRouter);
app.use("/sessions", sessionRouter);
app.use("/posts", postsRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
