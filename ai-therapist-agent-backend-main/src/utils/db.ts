import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDB = async () => {
  // Lire MONGODB_URI ici, après que dotenv.config() ait été appelé
  const MONGODB_URI = process.env.MONGODB_URI || "";
  
  if (!MONGODB_URI) {
    logger.error("❌ MONGODB_URI not configured in .env file");
    logger.warn("⚠️  Server will start WITHOUT database connection");
    return;
  }

  try {
    logger.info("🔄 Connecting to MongoDB...");
    logger.info("MongoDB URI:", MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Log URI sans le mot de passe
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Timeout après 30 secondes (augmenté)
      socketTimeoutMS: 45000, // Socket timeout
      family: 4, // Utiliser IPv4
    });
    logger.info("✅ Connected to MongoDB successfully");
  } catch (error: any) {
    logger.error("❌ MongoDB connection error:", error.message);
    logger.warn("⚠️  Server will start WITHOUT database connection");
    logger.warn("⚠️  Please check:");
    logger.warn("    1. Your IP is whitelisted in MongoDB Atlas (Network Access)");
    logger.warn("       → Go to: https://cloud.mongodb.com → Network Access → Add IP Address");
    logger.warn("       → Add your current IP or use 0.0.0.0/0 (allow all - for testing only)");
    logger.warn("    2. Your MongoDB credentials are correct");
    logger.warn("    3. Your internet connection is working");
    logger.warn("    4. MongoDB cluster is not paused");
    // Ne pas arrêter le serveur, juste avertir
  }
};
