"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle, 
  Heart, Activity, MessageSquare, Trophy, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getUserCrisisAlerts,
  markAlertAsRead,
  type CrisisAlert,
} from "@/lib/api/crisis";

interface Notification {
  id: string;
  type: "crisis" | "activity" | "mood" | "session" | "achievement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  level?: "critical" | "high" | "medium" | "low";
  data?: any;
}

interface NotificationsProps {
  userId: string;
}

export function Notifications({ userId }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications: Notification[] = [];

      // 1. Charger les alertes de crise
      try {
        const crisisData = await getUserCrisisAlerts(userId);
        const crisisNotifications = crisisData.alerts.map((alert: CrisisAlert) => ({
          id: `crisis-${alert._id}`,
          type: "crisis" as const,
          title: alert.message,
          message: alert.userMessage,
          timestamp: alert.createdAt,
          isRead: alert.isRead,
          level: alert.level,
          data: alert,
        }));
        allNotifications.push(...crisisNotifications);
      } catch (error) {
        console.error("Error loading crisis alerts:", error);
      }

      // 2. Charger les activités récentes depuis localStorage
      try {
        const activitiesStr = localStorage.getItem("user_activities") || "[]";
        const activities = JSON.parse(activitiesStr);
        const recentActivities = activities
          .filter((a: any) => {
            const activityDate = new Date(a.timestamp || a.createdAt);
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return activityDate >= dayAgo;
          })
          .slice(0, 10);

        const activityNotifications = recentActivities.map((activity: any) => {
          let title = "Nouvelle activité";
          let message = activity.name || activity.description || "Activité enregistrée";
          
          if (activity.type === "mood") {
            title = "Humeur enregistrée";
            message = `Score d'humeur : ${activity.moodScore || 0}%`;
          } else if (activity.type === "therapy") {
            title = "Séance de thérapie";
            message = "Session terminée avec succès";
          } else if (activity.completed) {
            title = "Activité complétée";
            message = `${activity.name} ✅`;
          }

          return {
            id: `activity-${activity.id}`,
            type: "activity" as const,
            title,
            message,
            timestamp: activity.timestamp || activity.createdAt || new Date().toISOString(),
            isRead: activity.notificationRead || false,
            data: activity,
          };
        });
        allNotifications.push(...activityNotifications);
      } catch (error) {
        console.error("Error loading activities:", error);
      }

      // 3. Trier par date (plus récent en premier)
      allNotifications.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre de notifications non lues
  const loadUnreadCount = async () => {
    try {
      // Compter depuis toutes les sources
      let count = 0;

      // Crises
      const crisisData = await getUserCrisisAlerts(userId);
      count += crisisData.unreadCount;

      // Activités récentes
      const activitiesStr = localStorage.getItem("user_activities") || "[]";
      const activities = JSON.parse(activitiesStr);
      const unreadActivities = activities.filter((a: any) => {
        const activityDate = new Date(a.timestamp || a.createdAt);
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return activityDate >= dayAgo && !a.notificationRead;
      });
      count += unreadActivities.length;

      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Charger au montage et toutes les 30 secondes
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Charger les notifications quand on ouvre le panneau
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Marquer comme lue
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      if (notification.type === "crisis") {
        await markAlertAsRead(notification.id.replace("crisis-", ""));
      } else if (notification.type === "activity") {
        // Marquer l'activité comme lue
        const activitiesStr = localStorage.getItem("user_activities") || "[]";
        const activities = JSON.parse(activitiesStr);
        const updated = activities.map((a: any) =>
          `activity-${a.id}` === notification.id
            ? { ...a, notificationRead: true }
            : a
        );
        localStorage.setItem("user_activities", JSON.stringify(updated));
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      // Marquer toutes les activités comme lues
      const activitiesStr = localStorage.getItem("user_activities") || "[]";
      const activities = JSON.parse(activitiesStr);
      const updated = activities.map((a: any) => ({ ...a, notificationRead: true }));
      localStorage.setItem("user_activities", JSON.stringify(updated));

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Icône selon le type
  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === "crisis") {
      switch (notification.level) {
        case "critical":
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case "high":
          return <AlertCircle className="w-5 h-5 text-orange-500" />;
        case "medium":
          return <Info className="w-5 h-5 text-yellow-500" />;
        case "low":
          return <CheckCircle className="w-5 h-5 text-blue-500" />;
      }
    } else if (notification.type === "mood") {
      return <Heart className="w-5 h-5 text-pink-500" />;
    } else if (notification.type === "session") {
      return <MessageSquare className="w-5 h-5 text-purple-500" />;
    } else if (notification.type === "achievement") {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
    return <Activity className="w-5 h-5 text-green-500" />;
  };

  // Couleur selon le type
  const getNotificationColor = (notification: Notification) => {
    if (notification.type === "crisis") {
      switch (notification.level) {
        case "critical":
          return "border-red-500 bg-red-50 dark:bg-red-950/20";
        case "high":
          return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
        case "medium":
          return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
        case "low":
          return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
      }
    } else if (notification.type === "mood") {
      return "border-pink-500 bg-pink-50 dark:bg-pink-950/20";
    } else if (notification.type === "session") {
      return "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
    } else if (notification.type === "achievement") {
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
    }
    return "border-green-500 bg-green-50 dark:bg-green-950/20";
  };

  return (
    <>
      {/* Bouton de notification */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panneau de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panneau */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Notifications</h2>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="p-2 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="w-full"
                    >
                      Marquer toutes comme lues
                    </Button>
                  </div>
                )}

                {/* Liste des notifications */}
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucune notification</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vos activités et alertes apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-[1.02]",
                            getNotificationColor(notification),
                            !notification.isRead && "ring-2 ring-primary/20"
                          )}
                          onClick={() => handleMarkAsRead(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(notification)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>

                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(notification.timestamp), "dd MMM yyyy 'à' HH:mm", {
                                  locale: fr,
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
