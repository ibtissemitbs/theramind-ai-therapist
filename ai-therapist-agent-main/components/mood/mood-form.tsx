"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";

interface MoodFormProps {
  onSuccess?: () => void;
}

export function MoodForm({ onSuccess }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your mood",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your mood",
          variant: "destructive",
        });
        return;
      }

      console.log("Sending mood to backend:", { score: moodScore });
      
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ score: moodScore, note: "" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to track mood");
      }

      const data = await response.json();
      console.log("✅ Mood saved successfully:", data);

      // Sauvegarder aussi en localStorage pour affichage immédiat
      try {
        const stored = localStorage.getItem('user_activities') || '[]';
        const activities = JSON.parse(stored);
        const newActivity = {
          id: Date.now().toString(),
          userId: user?.id || "default-user",
          type: "mood",
          name: "Suivi d'humeur",
          description: "",
          timestamp: new Date().toISOString(),
          duration: 0,
          completed: true,
          moodScore: moodScore,
          moodNote: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        activities.unshift(newActivity);
        localStorage.setItem('user_activities', JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving mood to localStorage:', error);
      }

      toast({
        title: "✅ Humeur enregistrée !",
        description: `Votre humeur (${moodScore}%) a été sauvegardée.`,
      });

      // Call onSuccess to close the modal and refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("MoodForm: Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to track mood",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-opacity ${
                Math.abs(moodScore - em.value) < 15
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-4"
        />
      </div>

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
}
