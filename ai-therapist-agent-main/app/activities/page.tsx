"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import {
  Activity,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Brain,
  Heart,
  Dumbbell,
  Coffee,
  Book,
  Music,
  Smile,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string;
  timestamp: Date;
  duration: number;
  completed: boolean;
  moodScore: number | null;
  moodNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const activityTypes = [
  { value: "meditation", label: "Méditation", icon: Brain, color: "text-purple-500" },
  { value: "exercise", label: "Exercice", icon: Dumbbell, color: "text-green-500" },
  { value: "mood", label: "Humeur", icon: Smile, color: "text-yellow-500" },
  { value: "therapy", label: "Thérapie", icon: Heart, color: "text-red-500" },
  { value: "breathing", label: "Respiration", icon: Activity, color: "text-blue-500" },
  { value: "reading", label: "Lecture", icon: Book, color: "text-orange-500" },
  { value: "music", label: "Musique", icon: Music, color: "text-pink-500" },
  { value: "relaxation", label: "Relaxation", icon: Coffee, color: "text-teal-500" },
];

export default function ActivitiesPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useSession();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    type: "meditation",
    description: "",
    duration: 10,
  });
  const { toast } = useToast();

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Charger les activités depuis localStorage
  useEffect(() => {
    const loadActivities = () => {
      const stored = localStorage.getItem("user_activities");
      if (stored) {
        const parsed = JSON.parse(stored);
        const formatted = parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }));
        setActivities(formatted);
      }
    };
    loadActivities();
  }, []);

  // Ajouter une activité
  const handleAddActivity = async () => {
    const activity: ActivityItem = {
      id: Date.now().toString(),
      userId: "default-user",
      type: newActivity.type,
      name: newActivity.name || activityTypes.find(t => t.value === newActivity.type)?.label || "Activité",
      description: newActivity.description,
      timestamp: new Date(),
      duration: newActivity.duration,
      completed: false,
      moodScore: null,
      moodNote: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Sauvegarder dans localStorage pour affichage immédiat
    const updated = [activity, ...activities];
    setActivities(updated);
    localStorage.setItem("user_activities", JSON.stringify(updated));

    // Envoyer aussi à MongoDB
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: newActivity.type,
            name: activity.name,
            description: newActivity.description,
            duration: newActivity.duration,
          }),
        });
        console.log('✅ Activity saved to MongoDB:', activity.name);
      }
    } catch (error) {
      console.error('Error saving activity to MongoDB:', error);
    }

    toast({
      title: "✅ Activité créée !",
      description: `${activity.name} a été ajoutée à votre liste.`,
    });

    setIsDialogOpen(false);
    setNewActivity({ name: "", type: "meditation", description: "", duration: 10 });
  };

  // Marquer comme complétée
  const toggleComplete = async (id: string) => {
    const updated = activities.map(a =>
      a.id === id ? { ...a, completed: !a.completed, updatedAt: new Date() } : a
    );
    setActivities(updated);
    localStorage.setItem("user_activities", JSON.stringify(updated));

    const activity = updated.find(a => a.id === id);
    
    // Si l'activité est marquée comme complétée, l'envoyer à MongoDB
    if (activity?.completed) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('/api/activity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: activity.type,
              name: activity.name,
              description: activity.description,
              duration: activity.duration,
            }),
          });
          console.log('✅ Completed activity saved to MongoDB:', activity.name);
        }
      } catch (error) {
        console.error('Error saving completed activity to MongoDB:', error);
      }

      toast({
        title: "🎉 Bravo !",
        description: `${activity.name} terminée !`,
      });
    }
  };

  // Supprimer une activité
  const deleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    localStorage.setItem("user_activities", JSON.stringify(updated));

    toast({
      title: "🗑️ Activité supprimée",
      description: "L'activité a été retirée de votre liste.",
    });
  };

  // Statistiques
  const stats = {
    total: activities.length,
    completed: activities.filter(a => a.completed).length,
    pending: activities.filter(a => !a.completed).length,
    today: activities.filter(a => {
      const today = new Date();
      const actDate = new Date(a.timestamp);
      return actDate.toDateString() === today.toDateString();
    }).length,
  };

  // Grouper par date
  const groupedActivities = activities.reduce((acc, activity) => {
    const dateKey = format(new Date(activity.timestamp), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="pt-20 pb-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes Activités</h1>
            <p className="text-muted-foreground">
              Suivez vos activités de bien-être quotidiennes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle activité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une activité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Type d'activité</Label>
                  <Select
                    value={newActivity.type}
                    onValueChange={(value) =>
                      setNewActivity({ ...newActivity, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nom (optionnel)</Label>
                  <Input
                    placeholder="Ex: Méditation matinale"
                    value={newActivity.name}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Description (optionnelle)</Label>
                  <Input
                    placeholder="Ex: 10 minutes de méditation guidée"
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Durée (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newActivity.duration}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>

                <Button onClick={handleAddActivity} className="w-full">
                  Créer l'activité
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total activités</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Complétées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{stats.today}</div>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des activités */}
        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Aucune activité</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez à suivre vos activités de bien-être
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première activité
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([dateKey, dayActivities]) => (
                <div key={dateKey}>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {format(new Date(dateKey), "EEEE d MMMM yyyy", { locale: fr })}
                  </h2>
                  <div className="space-y-3">
                    {dayActivities.map((activity) => {
                      const typeInfo = activityTypes.find(t => t.value === activity.type);
                      const Icon = typeInfo?.icon || Activity;

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className={cn(
                            "transition-all hover:shadow-md",
                            activity.completed && "opacity-75"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleComplete(activity.id)}
                                  className="mt-1"
                                >
                                  {activity.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </Button>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Icon className={cn("w-5 h-5", typeInfo?.color)} />
                                      <h3 className={cn(
                                        "font-semibold",
                                        activity.completed && "line-through text-muted-foreground"
                                      )}>
                                        {activity.name}
                                      </h3>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteActivity(activity.id)}
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {activity.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {activity.duration} min
                                    </div>
                                    <div>
                                      {format(new Date(activity.timestamp), "HH:mm")}
                                    </div>
                                    {activity.completed && (
                                      <Badge variant="secondary" className="text-xs">
                                        Terminée
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Container>
    </div>
  );
}
