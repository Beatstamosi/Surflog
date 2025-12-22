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
import { surflineClient } from "./utils/surflineClient.js";

// Load environment variables FIRST
dotenv.config();

const app = express();

const allowedOrigins = [
  "https://surflog-frontend-production.up.railway.app",
  "http://localhost:5174",
];

// CORS must be configured BEFORE other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server, Railway internal, etc.)
      if (!origin) return callback(null, true);

      // Allow your frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Add this route BEFORE app.use(express.json()) and other routes
app.get(
  "/proxy/surfline/*",
  async (req: express.Request, res: express.Response) => {
    try {
      // 1. Get the Surfline API path - TypeScript needs explicit typing
      const surflinePath = (req.params as any)["0"]; // Fixed line

      // 2. Forward all query parameters from the original request
      const queryParams = new URLSearchParams(
        req.query as Record<string, string>
      ).toString();

      // 3. Build the full Surfline URL
      const fullSurflineUrl = `/${surflinePath}${
        queryParams ? "?" + queryParams : ""
      }`;

      console.log(`🔄 Proxying: ${fullSurflineUrl}`);

      // 4. Use your existing surflineClient (with all the good headers)
      const response = await surflineClient.get(fullSurflineUrl);

      // 5. Send the Surfline data back to the client
      res.json(response.data);
    } catch (error: any) {
      console.error("❌ Proxy error:", error.message);
      // Pass through the Surfline error status if available
      res.status(error.response?.status || 500).json({
        error: "Proxy request failed",
        details: error.message,
      });
    }
  }
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

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

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
