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
import { surflineClient } from './utils/surflineClient.js';

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://surflog-frontend-production.up.railway.app",
  "http://localhost:5174",
];

// ✅ 1. CORS MIDDLEWARE FIRST (critical!)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

// ✅ 2. Handle preflight OPTIONS requests globally
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ 3. Body parsers AFTER CORS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ 4. ONLY NOW add your proxy route
app.get('/proxy/surfline/*', async (req: express.Request, res: express.Response) => {
  try {
    const surflinePath = (req.params as any)['0'];
    const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
    const fullSurflineUrl = `/${surflinePath}${queryParams ? '?' + queryParams : ''}`;
    
    console.log(`🔄 Proxying: ${fullSurflineUrl}`);
    
    const response = await surflineClient.get(fullSurflineUrl);
    res.json(response.data);
    
  } catch (error: any) {
    console.error('❌ Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy request failed',
      details: error.message
    });
  }
});

// ✅ 5. Passport and other middleware
app.use(passport.initialize());

// ✅ 6. Routes
app.use("/auth", authRouter);
app.use("/forecast", forecastRouter);
app.use("/user", userRouter);
app.use("/boards", boardsRouter);
app.use("/sessions", sessionRouter);
app.use("/posts", postsRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));