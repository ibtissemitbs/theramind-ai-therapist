import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import crisisRouter from "./routes/crisis";
import statusRouter from "./routes/status";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";

// Load environment variables
dotenv.config({ path: '.env' });

// Debug: log if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.log("⚠️ MONGODB_URI not found after dotenv.config()");
  console.log("Available env vars:", Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('PORT')));
}

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
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
