import express from "express";
import {
  createCrisisAlert,
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  getUnreadCount,
  deleteAlert,
  getCrisisStats,
} from "../controllers/crisisController";

const router = express.Router();

// Créer une alerte de crise
router.post("/", createCrisisAlert);

// Récupérer les alertes d'un utilisateur
router.get("/user/:userId", getUserAlerts);

// Obtenir le nombre d'alertes non lues
router.get("/user/:userId/unread-count", getUnreadCount);

// Obtenir les statistiques de crises
router.get("/user/:userId/stats", getCrisisStats);

// Marquer une alerte comme lue
router.put("/:alertId/read", markAlertAsRead);

// Marquer toutes les alertes comme lues
router.put("/user/:userId/read-all", markAllAlertsAsRead);

// Supprimer une alerte
router.delete("/:alertId", deleteAlert);

export default router;
