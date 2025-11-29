"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  PlusCircle,
  MessageSquare,
  Trash2,
  Mic,
  Image as ImageIcon,
  Paperclip,
  X,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

/* ---------- Aide / types ---------- */

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

interface CrisisDetection {
  level: "none" | "low" | "medium" | "high" | "critical";
  keywords: string[];
  message: string;
  resources: {
    title: string;
    phone?: string;
    link?: string;
    description: string;
  }[];
}

const QUESTIONS_SUGGEREES = [
  { text: "Comment mieux gérer mon anxiété ?" },
  { text: "Je me sens débordée ces derniers temps." },
  { text: "Peut-on parler d'améliorer mon sommeil ?" },
  { text: "J'ai besoin d'aide pour l'équilibre vie pro/vie perso." },
];

// Système de détection des crises
const detectCrisis = (message: string): CrisisDetection => {
  const lowerMsg = message.toLowerCase();
  
  // NIVEAU CRITIQUE - Urgence immédiate
  const criticalKeywords = [
    'suicide', 'suicider', 'me tuer', 'en finir', 'mourir', 'mort',
    'plus envie de vivre', 'veux disparaitre', 'disparaître',
    'je vais sauter', 'me faire du mal', 'automutilation'
  ];
  
  const criticalFound = criticalKeywords.filter(kw => lowerMsg.includes(kw));
  if (criticalFound.length > 0) {
    return {
      level: 'critical',
      keywords: criticalFound,
      message: '⚠️ DÉTECTION DE CRISE - Votre sécurité est notre priorité',
      resources: [
        {
          title: 'SAMU Tunisie',
          phone: '190',
          description: 'Urgence médicale immédiate 24h/24'
        },
        {
          title: 'Police Secours',
          phone: '197',
          description: 'Urgence sécuritaire et assistance'
        },
        {
          title: 'SOS Médecins Tunisie',
          phone: '71 754 754',
          description: 'Service médical d\'urgence à domicile'
        },
        {
          title: 'Ligne d\'Écoute Psychologique',
          phone: '80 100 410',
          description: 'Soutien psychologique gratuit et anonyme'
        }
      ]
    };
  }
  
  // NIVEAU ÉLEVÉ - Pensées autodestructrices
  const highKeywords = [
    'me blesser', 'me faire mal', 'nuire', 'douleur',
    'désespéré', 'désespérée', 'désespoir', 'sans espoir',
    'plus rien', 'vide', 'inutile', 'personne me comprend',
    'personne m\'aime', 'abandonné', 'seul au monde'
  ];
  
  const highFound = highKeywords.filter(kw => lowerMsg.includes(kw));
  if (highFound.length > 0) {
    return {
      level: 'high',
      keywords: highFound,
      message: '🛑 Je détecte une grande souffrance. Vous n\'\u00eates pas seul(e).',
      resources: [
        {
          title: 'Ligne d\'Écoute Psychologique',
          phone: '80 100 410',
          description: 'Écoute professionnelle gratuite et anonyme'
        },
        {
          title: 'Croissant-Rouge Tunisien',
          phone: '71 320 102',
          description: 'Assistance et soutien humanitaire'
        },
        {
          title: 'Centre d\'Aide Psychologique',
          phone: '71 841 444',
          description: 'Consultation et orientation psychologique'
        }
      ]
    };
  }
  
  // NIVEAU MOYEN - Détresse émotionnelle
  const mediumKeywords = [
    'panique', 'crise', 'angoisse', 'terreur', 'effroi',
    'très mal', 'insupportable', 'je ne peux plus',
    'je craque', 'à bout', 'submergé', 'débordé',
    'crise d\'angoisse', 'attaque panique'
  ];
  
  const mediumFound = mediumKeywords.filter(kw => lowerMsg.includes(kw));
  if (mediumFound.length > 0) {
    return {
      level: 'medium',
      keywords: mediumFound,
      message: '🔔 Je sens que vous traversez un moment difficile.',
      resources: [
        {
          title: 'Exercices de respiration',
          description: 'Techniques immédiates pour calmer l\'anxiété'
        },
        {
          title: 'Centre de Santé Mentale',
          phone: '71 567 811',
          description: 'Information et orientation en santé mentale'
        }
      ]
    };
  }
  
  // NIVEAU BAS - Stress/Anxiété
  const lowKeywords = [
    'stress', 'stresse', 'stressé', 'anxieux', 'anxieuse', 'anxiété',
    'inquiet', 'inquiète', 'soucis', 'préoccupé',
    'nerveux', 'nerveuse', 'tendu', 'tension',
    'pression', 'fatigué', 'submergé', 'épuisé'
  ];
  
  const lowFound = lowKeywords.filter(kw => lowerMsg.includes(kw));
  if (lowFound.length > 0) {
    return {
      level: 'low',
      keywords: lowFound,
      message: '🌿 Je remarque des signes de stress. Prenons un moment ensemble.',
      resources: [
        {
          title: 'Activités apaisantes',
          description: 'Exercices de relaxation disponibles ci-dessous'
        }
      ]
    };
  }
  
  return {
    level: 'none',
    keywords: [],
    message: '',
    resources: []
  };
};

// Clés pour le localStorage
const LOCAL_STORAGE_SESSIONS_KEY = "theramind_sessions";
const LOCAL_STORAGE_MESSAGES_KEY = "theramind_messages_";

// Fonctions helper pour le localStorage
const saveSessionToLocal = (sessionId: string, messages: ChatMessage[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY + sessionId, JSON.stringify(messages));
    
    // Sauvegarder aussi dans la liste des sessions
    const sessionsData = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    const sessions: ChatSession[] = sessionsData ? JSON.parse(sessionsData) : [];
    
    const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
    const sessionData: ChatSession = {
      sessionId,
      messages,
      createdAt: existingIndex >= 0 ? sessions[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }
    
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error("Erreur sauvegarde localStorage:", err);
  }
};

const loadSessionFromLocal = (sessionId: string): ChatMessage[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY + sessionId);
    if (data) {
      const messages = JSON.parse(data);
      return messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (err) {
    console.error("Erreur chargement localStorage:", err);
  }
  return null;
};

const loadAllSessionsFromLocal = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (data) {
      const sessions = JSON.parse(data);
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    }
  } catch (err) {
    console.error("Erreur chargement sessions localStorage:", err);
  }
  return [];
};

// 🔑 Clé de stockage pour mémoriser la dernière session
const SESSION_STORAGE_KEY = "therapy_chat_session_id";

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, isAuthenticated } = useSession();

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState<CrisisDetection | null>(null);
  
  // États pour audio et images
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioTranscript, setAudioTranscript] = useState<string>("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // 🔁 On laisse au départ à null, on le remplit avec URL ou localStorage
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  /* ---------- Initialisation du sessionId (URL / localStorage) ---------- */

  useEffect(() => {
    const paramId = params?.sessionId as string | undefined;

    // 1) Si l'URL contient un vrai sessionId, on l'utilise
    if (paramId && paramId !== "new") {
      setSessionId(paramId);
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_STORAGE_KEY, paramId);
      }
      return;
    }

    // 2) Sinon on essaie de reprendre la dernière session depuis localStorage
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedId) {
        setSessionId(storedId);
        router.replace(`/therapy/${storedId}`);
        return;
      }
    }

    // 3) Sinon, on laisse sessionId à null, initChat créera une nouvelle session
    setSessionId(null);
  }, [params?.sessionId, router]);

  /* ---------- Création / chargement des sessions ---------- */

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();

      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      }

      window.history.pushState({}, "", `/therapy/${newSessionId}`);
      
      toast({
        title: "✅ Nouvelle session créée",
        description: "Vous pouvez maintenant commencer à discuter avec l'IA.",
      });
    } catch (e) {
      console.error("Création de session impossible:", e);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer une nouvelle session. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Réinitialiser les messages ET l'alerte de crise quand on change de session
    setMessages([]);
    setCrisisDetected(null);
    setIsLoading(true);
    
    // Ne pas exécuter si on est en train d'initialiser depuis le premier useEffect
    if (sessionId === null) {
      setIsLoading(false);
      return;
    }

    const initChat = async () => {
      try {
        setIsLoading(true);
        if (!sessionId || sessionId === "new") {
          // ⬇️ création de session seulement si on n'en a vraiment pas
          const newSessionId = await createChatSession();
          setSessionId(newSessionId);

          if (typeof window !== "undefined") {
            localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
          }

          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          // 🔥 NOUVEAU: Charger depuis localStorage en priorité
          const localMessages = loadSessionFromLocal(sessionId);
          if (localMessages && localMessages.length > 0) {
            console.log("📦 Historique chargé depuis localStorage:", localMessages.length, "messages");
            setMessages(localMessages);
          } else {
            // Sinon essayer depuis le backend
            try {
              const history = await getChatHistory(sessionId);
              if (Array.isArray(history)) {
                const formatted = history.map((m) => ({
                  ...m,
                  timestamp: new Date(m.timestamp),
                }));
                setMessages(formatted);
                // Sauvegarder dans localStorage pour la prochaine fois
                saveSessionToLocal(sessionId, formatted);
              } else {
                setMessages([]);
              }
            } catch (err) {
              console.error("Erreur chargement historique:", err);
              setMessages([]);
              toast({
                title: "⚠️ Historique non disponible",
                description: "Impossible de charger l'historique de cette session.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (err) {
        console.error("Init chat KO:", err);
        setMessages([
          {
            role: "assistant",
            content:
              "Désolé, je n'arrive pas à charger la session. Rafraîchis la page et réessaie.",
            timestamp: new Date(),
          },
        ]);
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible d'initialiser la session. Rafraîchissez la page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // On lance initChat seulement quand on a décidé quoi faire du sessionId
    initChat();
  }, [sessionId, params?.sessionId]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Charger depuis localStorage en priorité
        const localSessions = loadAllSessionsFromLocal();
        if (localSessions.length > 0) {
          console.log("📦 Sessions chargées depuis localStorage:", localSessions.length);
          setSessions(localSessions);
        }
        
        // Essayer aussi de charger depuis le backend (si MongoDB connecté)
        try {
          const all = await getAllChatSessions();
          if (all && all.length > 0) {
            setSessions(all);
            // Sauvegarder dans localStorage
            all.forEach(session => {
              saveSessionToLocal(session.sessionId, session.messages);
            });
          }
        } catch (e) {
          console.log("Backend sessions non disponibles, utilisation localStorage");
        }
      } catch (e) {
        console.error("Chargement des sessions impossible:", e);
      }
    };
    loadSessions();
  }, [messages]);

  /* ---------- UI helpers ---------- */

  const scrollToBottom = () => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  /* ---------- Gestion audio ---------- */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Démarrer la reconnaissance vocale
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setAudioTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
      
      toast({
        title: "🎤 Enregistrement en cours",
        description: "Parlez maintenant...",
      });
    } catch (error) {
      console.error("Erreur d'accès au microphone:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'accéder au microphone. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Arrêter la reconnaissance vocale
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      toast({
        title: "✅ Enregistrement terminé",
        description: audioTranscript ? `Transcrit: "${audioTranscript.slice(0, 50)}..."` : "Votre message audio est prêt à être envoyé.",
      });
    }
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    setAudioTranscript("");
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  /* ---------- Gestion images ---------- */

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limite 5MB
        toast({
          title: "❌ Fichier trop volumineux",
          description: "La taille maximum est de 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setAttachedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "✅ Image ajoutée",
        description: file.name,
      });
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    if (!isTyping) scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => setMounted(true), []);

  /* ---------- Soumission message ---------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMessage = message.trim();
    const hasAudio = audioBlob !== null;
    const hasImage = attachedImage !== null;
    
    // Vérifier qu'il y a au moins un message texte, audio ou image
    if ((!currentMessage && !hasAudio && !hasImage) || isTyping || isChatPaused || !sessionId) return;

    // 🚨 Détecter les crises AVANT d'envoyer le message
    const crisis = detectCrisis(currentMessage);
    if (crisis.level !== 'none') {
      setCrisisDetected(crisis);
      
      // 💾 Sauvegarder l'alerte dans le backend (en arrière-plan, ne pas bloquer)
      import('@/lib/api/crisis').then(({ createCrisisAlert }) => {
        createCrisisAlert({
          userId: 'default-user',
          sessionId: sessionId || 'unknown',
          level: crisis.level,
          message: crisis.message,
          keywords: crisis.keywords,
          userMessage: currentMessage,
          resources: crisis.resources,
        }).then(() => {
          console.log('✅ Alerte sauvegardée');
        }).catch(err => {
          console.log('⚠️ Alerte non sauvegardée (serveur indisponible)');
        });
      });
      
      // Afficher l'alerte et scroll
      setTimeout(() => {
        document.getElementById('crisis-alert')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      // Pour les crises critiques et élevées, afficher toast et bloquer si critique
      if (crisis.level === 'critical') {
        toast({
          title: "🚨 URGENCE DÉTECTÉE",
          description: "Votre sécurité est primordiale. Des ressources d'aide immédiates sont affichées.",
          variant: "destructive",
          duration: 10000,
        });
        // BLOQUER l'envoi du message pour niveau CRITIQUE
        setIsTyping(false);
        return;
      }
      
      if (crisis.level === 'high') {
        toast({
          title: crisis.message,
          description: "Des ressources d'écoute professionnelle sont disponibles.",
          variant: "destructive",
          duration: 8000,
        });
      }
    }

    // ✅ Réinitialiser immédiatement l'interface pour éviter les doublons visuels
    setMessage("");
    const tempAudioBlob = audioBlob;
    const tempAudioTranscript = audioTranscript;
    const tempAttachedImage = attachedImage;
    setAudioBlob(null);
    setAudioTranscript("");
    setAttachedImage(null);
    setImagePreview(null);
    
    setIsTyping(true);

    try {
      // Construire le contenu du message
      let messageContent = currentMessage;
      let apiMessage = currentMessage;
      
      // Si audio, utiliser la transcription
      if (tempAudioBlob) {
        if (tempAudioTranscript) {
          messageContent = `🎤 ${tempAudioTranscript}`;
          apiMessage = tempAudioTranscript;
        } else {
          messageContent = `🎤 [Message vocal sans transcription]${currentMessage ? ` ${currentMessage}` : ''}`;
          apiMessage = currentMessage || "[audio sans texte]";
        }
      }
      
      // Si image, ajouter une indication
      if (tempAttachedImage) {
        messageContent = `🖼️ [Image: ${tempAttachedImage?.name}]${currentMessage ? ` ${currentMessage}` : ''}`;
        // TODO: Implémenter l'upload d'image au backend
      }

      // 1) Afficher le message utilisateur
      const userMessage: ChatMessage = {
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updatedMessages = [...prev, userMessage];
        // 🔥 Sauvegarder immédiatement le message utilisateur
        if (sessionId) {
          saveSessionToLocal(sessionId, updatedMessages);
        }
        return updatedMessages;
      });

      // 2) Forcer la réponse du modèle en FR (préfixe simple et robuste)
      const msgForApi = `Réponds en français, avec empathie et clarté. ${apiMessage}`;

      // 3) Appel API
      const response = await sendChatMessage(sessionId, msgForApi);
      const ai = typeof response === "string" ? JSON.parse(response) : response;

      // 4) Afficher la réponse
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          ai.response ||
          ai.message ||
          "Je suis là pour vous. Pouvez-vous m’en dire un peu plus ?",
        timestamp: new Date(),
        metadata: {
          technique: ai?.metadata?.technique || "soutien",
          goal: ai?.metadata?.currentGoal || "Apporter du soutien",
          progress: ai?.metadata?.progress || {},
        },
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage];
        // Sauvegarder dans localStorage après chaque message
        if (sessionId) {
          saveSessionToLocal(sessionId, updatedMessages);
        }
        return updatedMessages;
      });
      
      // ✅ Fermer l'alerte automatiquement après la réponse (sauf critique/high)
      if (crisis.level === 'low' || crisis.level === 'medium') {
        setTimeout(() => {
          setCrisisDetected(null);
        }, 10000); // Fermer après 10 secondes
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
      setMessages((prev) => {
        const errorMessage = {
          role: "assistant" as const,
          content:
            "Je rencontre un souci de connexion. Réessayez dans un instant, s'il vous plaît.",
          timestamp: new Date(),
        };
        const updatedMessages = [...prev, errorMessage];
        // Sauvegarder même les messages d'erreur
        if (sessionId) {
          saveSessionToLocal(sessionId, updatedMessages);
        }
        return updatedMessages;
      });
      toast({
        title: "❌ Erreur de connexion",
        description: "Impossible d'envoyer le message. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      }

      router.push(`/therapy/${newSessionId}`);
    }
    setMessage(text);
    setTimeout(() => {
      const evt = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(evt);
    }, 0);
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formatted = history.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(formatted);
        setSessionId(selectedSessionId);

        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_STORAGE_KEY, selectedSessionId);
        }

        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
      }
    } catch (e) {
      console.error("Impossible d'ouvrir la session:", e);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger cette session.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche l'ouverture de la session lors du clic sur supprimer
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      return;
    }

    try {
      // Supprimer de la liste des sessions
      const updatedSessions = sessions.filter(s => s.sessionId !== sessionIdToDelete);
      setSessions(updatedSessions);

      // Supprimer du localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY + sessionIdToDelete);
        const sessionsData = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
        if (sessionsData) {
          const allSessions = JSON.parse(sessionsData);
          const filteredSessions = allSessions.filter((s: ChatSession) => s.sessionId !== sessionIdToDelete);
          localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(filteredSessions));
        }
      }

      // Si c'est la session active, rediriger vers une nouvelle session
      if (sessionIdToDelete === sessionId) {
        await handleNewSession();
      }

      toast({
        title: "✅ Session supprimée",
        description: "La conversation a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la conversation.",
        variant: "destructive",
      });
    }
  };

  /* ---------- RendU ---------- */

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

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="flex h-[calc(100vh-4rem)] mt-20 gap-6">
        {/* --- Colonne gauche : sessions --- */}
        <aside className="w-80 flex flex-col border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sessions de chat</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="hover:bg-primary/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              Nouvelle session
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.sessionId}
                  className={cn(
                    "p-3 rounded-lg text-sm cursor-pointer hover:bg-primary/5 transition-colors relative group",
                    s.sessionId === sessionId
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10"
                  )}
                  onClick={() => handleSessionSelect(s.sessionId)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium flex-1">
                      {s.messages[0]?.content.slice(0, 30) || "Nouveau chat"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteSession(s.sessionId, e)}
                      title="Supprimer cette conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground">
                    {s.messages[s.messages.length - 1]?.content ||
                      "Aucun message pour l’instant"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {s.messages.length} message(s)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const d = new Date(s.updatedAt);
                          if (isNaN(d.getTime())) return "À l’instant";
                          return formatDistanceToNow(d, {
                            addSuffix: true,
                            locale: frLocale,
                          });
                        } catch {
                          return "À l’instant";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* --- Zone de chat --- */}
        <section className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background rounded-lg border">
          {/* En-tête */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Thérapeute IA</h2>
                <p className="text-sm text-muted-foreground">
                  {messages.length} message(s)
                </p>
              </div>
            </div>
          </div>

          {/* Écran d’accueil si pas de messages */}
                    {crisisDetected && crisisDetected.level !== 'none' && (
            <motion.div
              id="crisis-alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mx-4 my-4 p-4 rounded-lg border-2 relative",
                crisisDetected.level === 'critical' && "border-red-500 bg-red-50 dark:bg-red-950/20",
                crisisDetected.level === 'high' && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
                crisisDetected.level === 'medium' && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
                crisisDetected.level === 'low' && "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => setCrisisDetected(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">
                    {crisisDetected.level === 'critical' && '🚨'}
                    {crisisDetected.level === 'high' && '🛑'}
                    {crisisDetected.level === 'medium' && '🔔'}
                    {crisisDetected.level === 'low' && '💙'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{crisisDetected.message}</h3>
                    <p className="text-sm text-muted-foreground">Des ressources sont disponibles pour vous aider.</p>
                  </div>
                </div>

                {crisisDetected.resources && crisisDetected.resources.length > 0 && (
                  <div className="space-y-2">
                    {crisisDetected.resources.map((resource, idx) => (
                      <div key={idx} className="bg-background/80 p-3 rounded-md border">
                        <div className="font-medium text-sm">{resource.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{resource.description}</div>
                        <a
                          href={`tel:${resource.phone}`}
                          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          📞 {resource.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {crisisDetected.level === 'critical' && (
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      ⚠️ En cas d'urgence vitale, appelez immédiatement le 15 (SAMU) ou le 112
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Écran d'accueil si pas de messages */}
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-2 text-2xl font-semibold">
                      <div className="relative">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        Thérapeute IA
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      Comment puis-je vous aider aujourd'hui ?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {QUESTIONS_SUGGEREES.map((q, i) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4 relative overflow-hidden group"
                        onClick={() => setMessage(q.text)}
                        disabled={isTyping}
                      >
                        <motion.div
                          className="absolute inset-0 bg-primary/5"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative">{q.text}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-6 py-8",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                              <Bot className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {msg.role === "assistant"
                                ? "Thérapeute IA"
                                : "Vous"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm dark:prose-invert leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.metadata?.goal && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Objectif : {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-8 flex gap-4 bg-muted/30"
                  >
                    <div className="w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">Thérapeute IA</p>
                      <p className="text-sm text-muted-foreground">
                        En train d’écrire…
                      </p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Saisie */}
          <div className="border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4">
            {/* Prévisualisation des pièces jointes */}
            {(imagePreview || audioBlob) && (
              <div className="max-w-3xl mx-auto mb-4 space-y-2">
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-h-32 rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {audioBlob && (
                  <div className="bg-muted/50 p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Message vocal enregistré</span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={cancelAudio}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {audioTranscript && (
                      <div className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                        <span className="font-medium">Transcription: </span>
                        {audioTranscript}
                      </div>
                    )}
                    {isRecording && !audioTranscript && (
                      <div className="text-xs text-muted-foreground italic">
                        En cours d'écoute...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto flex gap-4 items-end relative"
            >
              {/* Boutons pour pièces jointes */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="image-upload"
                  className={cn(
                    "cursor-pointer p-2 rounded-lg border bg-background hover:bg-muted transition-colors",
                    (isTyping || isChatPaused) && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                  title="Ajouter une image"
                >
                  <ImageIcon className="w-5 h-5" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={isTyping || isChatPaused}
                  />
                </label>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className={cn(
                    "h-9 w-9",
                    isRecording && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTyping || isChatPaused}
                  title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
                >
                  {isRecording ? (
                    <StopCircle className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <div className="flex-1 relative group">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Terminez l’activité pour reprendre la discussion…"
                      : "Écrivez votre message…"
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background p-3 pr-12 min-h-[48px] max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-1.5 bottom-3.5 h-[36px] w-[36px] rounded-xl",
                    "transition-all duration-200 bg-primary hover:bg-primary/90",
                    "shadow-sm shadow-primary/20",
                    (isTyping || isChatPaused || (!message.trim() && !audioBlob && !attachedImage)) &&
                      "opacity-50 cursor-not-allowed",
                    "group-hover:scale-105 group-focus-within:scale-105"
                  )}
                  disabled={isTyping || isChatPaused || (!message.trim() && !audioBlob && !attachedImage)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 text-xs text-center text-muted-foreground">
              Appuyez sur{" "}
              <kbd className="px-2 py-0.5 rounded bg-muted">Entrée ↵</kbd> pour
              envoyer,&nbsp;
              <kbd className="px-2 py-0.5 rounded bg-muted">
                Maj + Entrée
              </kbd>{" "}
              pour aller à la ligne
            </div>
          </div>
        </section>
      </div>
      <Toaster />
    </div>
  );
}
