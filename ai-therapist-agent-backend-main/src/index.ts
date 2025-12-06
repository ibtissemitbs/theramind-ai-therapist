// Load environment variables FIRST before any imports
import dotenv from "dotenv";
dotenv.config({ path: '.env' });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import crisisRouter from "./routes/crisis";
import statusRouter from "./routes/status";
import audioRouter from "./routes/audio";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";

// Debug: log if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.log("⚠️ MONGODB_URI not found after dotenv.config()");
  console.log("Available env vars:", Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('PORT')));
}

// Create Express app
const app = express();

// CORS Configuration
const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || "",
  "https://theramind-frontend.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001"
].filter(url => url.length > 0); // Remove empty strings

console.log("🔒 CORS - Allowed origins:", allowedOrigins);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all onrender.com origins in production
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.some((allowed: string) => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with 10MB limit for images
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // HTTP request logger

// Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);
// OnaF6EGHhgYY9OPv

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/status", statusRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);
app.use("/api/crisis", crisisRouter);
app.use("/api/audio", audioRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    logger.info("🚀 Starting server...");
    
    // Try to connect to MongoDB (non-blocking)
    await connectDB();

    // Start the server regardless of MongoDB connection
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`✅ Server is running on port ${PORT}`);
      logger.info(`📡 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 Inngest endpoint: http://localhost:${PORT}/api/inngest`);
      logger.info(`💬 Chat endpoint: http://localhost:${PORT}/chat`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
