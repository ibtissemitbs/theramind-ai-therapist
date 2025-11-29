"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCrisisStats, type CrisisStats } from "@/lib/api/crisis";

interface CrisisStatsCardProps {
  userId: string;
  className?: string;
}

export function CrisisStatsCard({ userId, className }: CrisisStatsCardProps) {
  const [stats, setStats] = useState<CrisisStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getCrisisStats(userId, 7);
        setStats(data);
      } catch (error) {
        console.error("Error loading crisis stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Recharger toutes les 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <Card className={cn("border-primary/10", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card className={cn("border-primary/10", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Alertes de crise
          </CardTitle>
          <CardDescription>Aucune crise détectée cette semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Le système de détection veille sur votre bien-être 💚
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelData = [
    {
      level: "critical",
      label: "Critique",
      count: stats.byLevel.critical,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      emoji: "🚨",
    },
    {
      level: "high",
      label: "Élevé",
      count: stats.byLevel.high,
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      emoji: "🛑",
    },
    {
      level: "medium",
      label: "Moyen",
      count: stats.byLevel.medium,
      icon: Info,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      emoji: "🔔",
    },
    {
      level: "low",
      label: "Bas",
      count: stats.byLevel.low,
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      emoji: "💙",
    },
  ];

  const hasHighRisk = stats.byLevel.critical > 0 || stats.byLevel.high > 0;

  return (
    <Card className={cn("border-primary/10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {hasHighRisk ? (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              ) : (
                <Info className="w-5 h-5 text-blue-500" />
              )}
              Alertes de crise
            </CardTitle>
            <CardDescription>
              {stats.total} alerte{stats.total > 1 ? "s" : ""} détectée{stats.total > 1 ? "s" : ""} - {stats.period}
            </CardDescription>
          </div>
          {hasHighRisk ? (
            <TrendingUp className="w-5 h-5 text-orange-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-green-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {levelData.map(
            (item) =>
              item.count > 0 && (
                <motion.div
                  key={item.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    item.bgColor
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Niveau {item.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-2xl font-bold", item.color)}>
                      {item.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count > 1 ? "alertes" : "alerte"}
                    </p>
                  </div>
                </motion.div>
              )
          )}
        </div>

        {hasHighRisk && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              ⚠️ Des alertes de niveau élevé ont été détectées. N'hésitez pas à consulter un
              professionnel si nécessaire.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
