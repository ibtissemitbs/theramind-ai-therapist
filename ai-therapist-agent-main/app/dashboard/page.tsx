"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";

import {
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/static-dashboard-data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";

import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";
import { Notifications } from "@/components/dashboard/notifications";
import { CrisisStatsCard } from "@/components/dashboard/crisis-stats-card";

/* ===================== Types ===================== */
type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

/* ===================== Calculs ===================== */
const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
          moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
            moodEntries.length
        )
      : null;

  // Compter toutes les sessions wellness (therapy, game, meditation, breathing)
  const wellnessSessions = todaysActivities.filter((a) => 
    ["therapy", "game", "meditation", "breathing"].includes(a.type)
  ).length;
  
  // Calculer le taux de complétion réel
  const completedActivities = todaysActivities.filter((a) => a.completed).length;
  const completionRate = todaysActivities.length > 0 
    ? Math.round((completedActivities / todaysActivities.length) * 100)
    : 100;

  return {
    moodScore: averageMood,
    completionRate,
    mindfulnessCount: wellnessSessions,
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

/* ===================== Reco IA (FR) ===================== */
const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];

  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );

  // Humeur
  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

    if (latestMood > averageMood) {
      insights.push({
        title: "Amélioration de l’humeur",
        description:
          "Vos scores récents sont au-dessus de votre moyenne hebdomadaire. Continuez ainsi !",
        icon: Brain,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "Baisse d’humeur détectée",
        description:
          "On observe un léger creux. Essayez une activité qui remonte le moral.",
        icon: Heart,
        priority: "high",
      });
    }
  }

  // Activités zen
  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 0) {
    const dailyAverage = mindfulnessActivities.length / 7;
    if (dailyAverage >= 1) {
      insights.push({
        title: "Pratique régulière",
        description:
          "Vous réalisez souvent des activités de pleine conscience. Cela réduit le stress 👏",
        icon: Trophy,
        priority: "medium",
      });
    } else {
      insights.push({
        title: "Opportunité de pleine conscience",
        description:
          "Ajoutez une petite activité zen chaque jour pour progresser.",
        icon: Sparkles,
        priority: "low",
      });
    }
  }

  // Taux de complétion
  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate =
    recentActivities.length > 0
      ? (completedActivities.length / recentActivities.length) * 100
      : 0;

  if (completionRate >= 80) {
    insights.push({
      title: "Objectifs atteints",
      description: `Vous avez complété ${Math.round(
        completionRate
      )}% de vos activités cette semaine. Bravo !`,
      icon: Trophy,
      priority: "high",
    });
  } else if (completionRate < 50) {
    insights.push({
      title: "Rappel d’activité",
      description:
        "Fixez-vous des objectifs plus petits et atteignables chaque jour.",
      icon: Calendar,
      priority: "medium",
    });
  }

  // Matin/Soir
  const morningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() < 12
  );
  const eveningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() >= 18
  );

  if (morningActivities.length > eveningActivities.length) {
    insights.push({
      title: "Pic d’énergie le matin",
      description:
        "Vous êtes plus actif(ve) le matin. Programmez vos tâches importantes sur ce créneau.",
      icon: Sun,
      priority: "medium",
    });
  } else if (eveningActivities.length > morningActivities.length) {
    insights.push({
      title: "Routine du soir",
      description:
        "Vous êtes plus actif(ve) le soir. Pensez à un rituel calme avant le coucher.",
      icon: Moon,
      priority: "medium",
    });
  }

  return insights
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);
};

/* ===================== Composant ===================== */
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user, loading, isAuthenticated } = useSession();

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const [insights, setInsights] = useState<
    { title: string; description: string; icon: any; priority: "low" | "medium" | "high" }[]
  >([]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  const transformActivitiesToDayActivity = (activities: Activity[]): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const date = startOfDay(subDays(today, i));
      const dayActivities = activities.filter((activity) =>
        isWithinInterval(new Date(activity.timestamp), { start: date, end: addDays(date, 1) })
      );

      let level: ActivityLevel = "none";
      if (dayActivities.length > 0) {
        if (dayActivities.length <= 2) level = "low";
        else if (dayActivities.length <= 4) level = "medium";
        else level = "high";
      }

      days.push({
        date,
        level,
        activities: dayActivities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          completed: activity.completed,
          time: format(new Date(activity.timestamp), "HH:mm"),
        })),
      });
    }
    return days;
  };

  const loadActivities = useCallback(async () => {
    try {
      const userActivities = await getUserActivities("default-user");
      setActivities(userActivities);
      
      // Calculer les stats du jour directement depuis les activités
      const stats = calculateDailyStats(userActivities);
      setDailyStats(stats);
      
      // Générer les insights
      if (userActivities.length > 0) {
        setInsights(generateInsights(userActivities));
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Recharger les activités toutes les 2 minutes pour mettre à jour le dashboard
  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadActivities]);

  // Calculer données de la semaine
  const lastWeekActivities = activities.filter((a) => {
    const daysDiff = Math.floor((new Date().getTime() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }).length;

  const getMoodData = () => {
    const score = dailyStats.moodScore;
    if (!score) return { color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-950/20 border-gray-200", emoji: "—", label: "Non renseigné" };
    if (score >= 70) return { color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20 border-green-200", emoji: "😊", label: "Excellent" };
    if (score >= 40) return { color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200", emoji: "😐", label: "Correct" };
    return { color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200", emoji: "😟", label: "À améliorer" };
  };

  const moodData = getMoodData();

  const wellnessStats = [
    {
      title: "État émotionnel",
      value: dailyStats.moodScore ? `${dailyStats.moodScore}%` : "--",
      subtitle: `${moodData.emoji} ${moodData.label}`,
      icon: Brain,
      color: moodData.color,
      bgColor: moodData.bg,
      description: "Humeur du jour",
    },
    {
      title: "Progression",
      value: `${dailyStats.completionRate}%`,
      subtitle: dailyStats.totalActivities > 0 
        ? `🎯 ${Math.round((dailyStats.totalActivities * dailyStats.completionRate) / 100)}/${dailyStats.totalActivities} terminées`
        : "Pas encore d'activités",
      icon: Trophy,
      color: dailyStats.completionRate >= 80 ? "text-amber-500" : dailyStats.completionRate >= 50 ? "text-blue-500" : "text-gray-400",
      bgColor: dailyStats.completionRate >= 80 
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200" 
        : dailyStats.completionRate >= 50 
          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200" 
          : "bg-gray-50 dark:bg-gray-950/20 border-gray-200",
      description: "Taux de réussite",
    },
    {
      title: "Sessions bien-être",
      value: `${dailyStats.mindfulnessCount}`,
      subtitle: dailyStats.mindfulnessCount > 0 
        ? `💆‍♀️ Jeux, respiration, méditation` 
        : "Aucune activité wellness",
      icon: Heart,
      color: dailyStats.mindfulnessCount > 0 ? "text-pink-500" : "text-gray-400",
      bgColor: dailyStats.mindfulnessCount > 0 
        ? "bg-pink-50 dark:bg-pink-950/20 border-pink-200" 
        : "bg-gray-50 dark:bg-gray-950/20 border-gray-200",
      description: "Activités relaxantes",
    },
    {
      title: "Activités du jour",
      value: dailyStats.totalActivities.toString(),
      subtitle: lastWeekActivities > 0 ? `📊 ${lastWeekActivities} sur 7 jours` : "Commencez aujourd'hui",
      icon: Activity,
      color: dailyStats.totalActivities > 0 ? "text-blue-500" : "text-gray-400",
      bgColor: dailyStats.totalActivities > 0 
        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200" 
        : "bg-gray-50 dark:bg-gray-950/20 border-gray-200",
      description: "Toutes activités",
    },
  ];

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await saveMoodData({ userId: "default-user", mood: data.moodScore, note: "" });
      setShowMoodModal(false);
      // Recharger les activités pour mettre à jour les stats
      loadActivities();
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowCheckInChat(true);
  };

  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          userId: "default-user",
          type: "game",
          name: gameName,
          description,
          duration: 0,
        });
        // Recharger les activités pour mettre à jour les stats
        await loadActivities();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-20 pb-8 space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Avatar de profil */}
            {user && (
              <div className="relative">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "User"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    key={user.profileImage}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                    <span className="text-2xl font-bold text-primary">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Bonjour, {user?.name || user?.email?.split('@')[0] || "utilisateur"}
              </h1>
              <p className="text-muted-foreground">
                {currentTime.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <Notifications userId="default-user" />
          </div>
        </div>

        {/* LIGNE 1 — KPIs */}
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vue d’ensemble du jour</CardTitle>
                <CardDescription>
                  Vos indicateurs du {format(new Date(), "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={loadActivities} className="h-8 w-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {wellnessStats.map((stat) => (
                <div
                  key={stat.title}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] border-2",
                    stat.bgColor
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  </div>
                  <p className="text-3xl font-bold mb-1" style={{ color: stat.color.replace('text-', '') }}>{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs font-medium mb-1">{stat.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-right">
              Dernière mise à jour : {format(dailyStats.lastUpdated, "HH:mm")}
            </div>
          </CardContent>
        </Card>

        {/* LIGNE 2 — Actions rapides / Recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Actions rapides */}
          <Card className="border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Actions rapides</h3>
                  <p className="text-sm text-muted-foreground">
                    Commencez votre parcours bien-être
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <Button
                  variant="default"
                  className={cn(
                    "w-full justify-between items-center p-6 h-auto",
                    "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                    "hover:from-primary/90 hover:to-primary transition-all"
                  )}
                  onClick={handleStartTherapy}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Démarrer une séance</div>
                      <div className="text-xs opacity-80">Lancer une nouvelle session</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col h-[120px] px-4 py-3 justify-center items-center text-center hover:border-primary/50"
                    onClick={() => setShowMoodModal(true)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Suivre mon humeur</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Comment vous sentez-vous ?
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex flex-col h-[120px] px-4 py-3 justify-center items-center text-center hover:border-primary/50"
                    onClick={handleAICheckIn}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Bilan rapide</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Check-in bien-être
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Recommandations
              </CardTitle>
              <CardDescription>
                Conseils personnalisés selon vos habitudes d’activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg transition-all hover:scale-[1.02]",
                        insight.priority === "high"
                          ? "bg-primary/15"
                          : insight.priority === "medium"
                          ? "bg-primary/10"
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <insight.icon className="w-5 h-5 text-primary" />
                        <p className="font-medium">{insight.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>Réalisez plus d’activités pour recevoir des recommandations.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques de crises */}
        <CrisisStatsCard userId="default-user" />

        {/* Section jeux anti-stress */}
        <AnxietyGames onGamePlayed={handleGamePlayed} />
      </Container>

      {/* Modale — Suivi d’humeur */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Comment vous sentez-vous ?</DialogTitle>
            <DialogDescription>
              Déplacez le curseur pour enregistrer votre humeur actuelle.
            </DialogDescription>
          </DialogHeader>
          <MoodForm onSuccess={() => {
            setShowMoodModal(false);
            loadActivities();
          }} />
        </DialogContent>
      </Dialog>

      {/* Panneau check-in IA */}
      {showCheckInChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">Bilan rapide</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCheckInChat(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Résumé de l'état */}
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-3">
                        <div className="text-5xl">{moodData.emoji}</div>
                        <div>
                          <div className="text-lg font-semibold">{moodData.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {dailyStats.moodScore ? `Score: ${dailyStats.moodScore}%` : "Pas encore de données"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statistiques du jour */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Aujourd'hui</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span className="text-sm">Activités complétées</span>
                        <span className="font-semibold">{dailyStats.totalActivities}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span className="text-sm">Taux de réussite</span>
                        <span className="font-semibold">{dailyStats.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span className="text-sm">Séances bien-être</span>
                        <span className="font-semibold">{dailyStats.mindfulnessCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Actions recommandées</h4>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setShowCheckInChat(false);
                        setShowMoodModal(true);
                      }}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Mettre à jour mon humeur
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setShowCheckInChat(false);
                        handleStartTherapy();
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Démarrer une séance
                    </Button>
                  </div>

                  {/* Conseils */}
                  {insights.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Recommandations</h4>
                      {insights.slice(0, 2).map((insight, index) => (
                        <div key={index} className="p-3 rounded-lg bg-primary/10">
                          <div className="flex items-start gap-2">
                            <insight.icon className="w-4 h-4 text-primary mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{insight.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {insight.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ActivityLogger
        open={false /* tu peux relier à un bouton si besoin */}
        onOpenChange={() => {}}
        onActivityLogged={loadActivities}
      />
    </div>
  );
}
