import dotenv from "dotenv";
import express from "express";
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
// 1. MANUAL CORS HANDLER (Railway-proof)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// 2. Express body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// 3. Proxy route (comes BEFORE auth routes)
app.get('/proxy/surfline/*', async (req, res) => {
    try {
        const surflinePath = req.params['0'];
        const queryParams = new URLSearchParams(req.query).toString();
        const fullSurflineUrl = `/${surflinePath}${queryParams ? '?' + queryParams : ''}`;
        console.log(`🔄 Proxying: ${fullSurflineUrl}`);
        const response = await surflineClient.get(fullSurflineUrl);
        res.json(response.data);
    }
    catch (error) {
        console.error('❌ Proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Proxy request failed',
            details: error.message
        });
    }
});
// 4. Passport
app.use(passport.initialize());
// 5. Routes
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
