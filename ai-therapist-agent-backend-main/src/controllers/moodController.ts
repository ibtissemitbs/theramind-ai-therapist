import { Request, Response, NextFunction } from "express";
import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";
import { sendMoodUpdateEvent } from "../utils/inngestEvents";

// Create a new mood entry
export const createMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { score, note, context, activities } = req.body;
    
    logger.info("createMood - req.user:", req.user);
    const userId = req.user?._id; // From auth middleware

    if (!userId) {
      logger.error("createMood - User not authenticated, req.user:", req.user);
      return res.status(401).json({ message: "User not authenticated" });
    }

    logger.info("createMood - Creating mood for userId:", userId);
    const mood = new Mood({
      userId,
      score,
      note,
      context,
      activities,
      timestamp: new Date(),
    });

    await mood.save();
    logger.info(`✅ Mood saved to MongoDB: ${mood._id}, user: ${userId}, score: ${score}`);

    // Send mood update event to Inngest
    await sendMoodUpdateEvent({
      userId,
      mood: score,
      note,
      context,
      activities,
      timestamp: mood.timestamp,
    });

    res.status(201).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    next(error);
  }
};

// Get all mood entries for the authenticated user
export const getMoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      logger.error("getMoods - User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const moods = await Mood.find({ userId })
      .sort({ timestamp: -1 })
      .exec();

    logger.info(`✅ Retrieved ${moods.length} moods from MongoDB for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: moods,
    });
  } catch (error) {
    next(error);
  }
};
