import { Request, Response, NextFunction } from "express";
import { Activity, IActivity } from "../models/Activity";
import { logger } from "../utils/logger";
import { sendActivityCompletionEvent } from "../utils/inngestEvents";

// Log a new activity
export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, name, description, duration, difficulty, feedback } =
      req.body;
    
    logger.info("logActivity - req.user:", req.user);
    const userId = req.user?._id;

    if (!userId) {
      logger.error("logActivity - User not authenticated, req.user:", req.user);
      return res.status(401).json({ message: "User not authenticated" });
    }

    logger.info("logActivity - Creating activity for userId:", userId);
    const activity = new Activity({
      userId,
      type,
      name,
      description,
      duration,
      difficulty,
      feedback,
      timestamp: new Date(),
    });

    await activity.save();
    logger.info(`✅ Activity saved to MongoDB: ${activity._id}, user: ${userId}`);

    // Send activity completion event to Inngest
    await sendActivityCompletionEvent({
      userId,
      id: activity._id,
      type,
      name,
      duration,
      difficulty,
      feedback,
      timestamp: activity.timestamp,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// Get all activities for the authenticated user
export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      logger.error("getActivities - User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const activities = await Activity.find({ userId })
      .sort({ timestamp: -1 })
      .exec();

    logger.info(`✅ Retrieved ${activities.length} activities from MongoDB for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
