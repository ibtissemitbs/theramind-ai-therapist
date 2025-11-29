"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getUserCrisisAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  getUnreadAlertsCount,
  type CrisisAlert,
} from "@/lib/api/crisis";

interface CrisisNotificationsProps {
  userId: string;
}

export function CrisisNotifications({ userId }: CrisisNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les alertes
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getUserCrisisAlerts(userId);
      setAlerts(data.alerts);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre d'alertes non lues
  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadAlertsCount(userId);
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

  // Charger les alertes quand on ouvre le panneau
  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  // Marquer comme lue
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert._id === alertId ? { ...alert, isRead: true } : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAlertsAsRead(userId);
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Icône selon le niveau
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "medium":
        return <Info className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Couleur selon le niveau
  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950/20";
      case "high":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "low":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "border-gray-300 bg-gray-50";
    }
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
                    <h2 className="font-semibold text-lg">Alertes de crise</h2>
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
                {alerts.length > 0 && unreadCount > 0 && (
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

                {/* Liste des alertes */}
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Aucune alerte de crise</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les alertes détectées s'afficheront ici
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {alerts.map((alert) => (
                        <motion.div
                          key={alert._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            getLevelColor(alert.level),
                            !alert.isRead && "ring-2 ring-primary/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getLevelIcon(alert.level)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm">
                                  {alert.message}
                                </h3>
                                {!alert.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleMarkAsRead(alert._id)}
                                  >
                                    ✓
                                  </Button>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                "{alert.userMessage}"
                              </p>

                              {alert.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {alert.keywords.slice(0, 3).map((keyword, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-background/60 rounded text-xs"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(alert.createdAt), "dd MMM yyyy 'à' HH:mm", {
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
