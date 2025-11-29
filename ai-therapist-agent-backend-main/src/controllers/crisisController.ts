import { Request, Response } from "express";
import { CrisisAlert } from "../models/CrisisAlert";

// Créer une alerte de crise
export const createCrisisAlert = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId, level, message, keywords, userMessage, resources } = req.body;

    if (!userId || !sessionId || !level || !message || !userMessage) {
      return res.status(400).json({ 
        error: "Missing required fields: userId, sessionId, level, message, userMessage" 
      });
    }

    const alert = new CrisisAlert({
      userId,
      sessionId,
      level,
      message,
      keywords: keywords || [],
      userMessage,
      resources: resources || [],
      isRead: false,
    });

    await alert.save();

    res.status(201).json({
      success: true,
      alert,
      message: "Crisis alert created successfully"
    });
  } catch (error) {
    console.error("Error creating crisis alert:", error);
    res.status(500).json({ 
      error: "Failed to create crisis alert",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Récupérer toutes les alertes d'un utilisateur
export const getUserAlerts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { unreadOnly } = req.query;

    const query: any = { userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const alerts = await CrisisAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await CrisisAlert.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({
      success: true,
      alerts,
      unreadCount,
      total: alerts.length
    });
  } catch (error) {
    console.error("Error fetching user alerts:", error);
    res.status(500).json({ 
      error: "Failed to fetch alerts",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Marquer une alerte comme lue
export const markAlertAsRead = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const alert = await CrisisAlert.findByIdAndUpdate(
      alertId,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({
      success: true,
      alert,
      message: "Alert marked as read"
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({ 
      error: "Failed to mark alert as read",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Marquer toutes les alertes comme lues
export const markAllAlertsAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await CrisisAlert.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      updated: result.modifiedCount,
      message: `${result.modifiedCount} alerts marked as read`
    });
  } catch (error) {
    console.error("Error marking all alerts as read:", error);
    res.status(500).json({ 
      error: "Failed to mark alerts as read",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Obtenir le nombre d'alertes non lues
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await CrisisAlert.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ 
      error: "Failed to get unread count",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Supprimer une alerte
export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const alert = await CrisisAlert.findByIdAndDelete(alertId);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ 
      error: "Failed to delete alert",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Obtenir les statistiques des crises
export const getCrisisStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const alerts = await CrisisAlert.find({
      userId,
      createdAt: { $gte: startDate }
    });

    const stats = {
      total: alerts.length,
      byLevel: {
        critical: alerts.filter(a => a.level === "critical").length,
        high: alerts.filter(a => a.level === "high").length,
        medium: alerts.filter(a => a.level === "medium").length,
        low: alerts.filter(a => a.level === "low").length,
      },
      lastCrisis: alerts.length > 0 ? alerts[0] : null,
      period: `${days} jours`
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error getting crisis stats:", error);
    res.status(500).json({ 
      error: "Failed to get crisis stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
