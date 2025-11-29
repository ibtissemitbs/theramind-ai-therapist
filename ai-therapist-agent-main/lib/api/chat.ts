// lib/api/chat.ts

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
  metadata?: {
    technique?: string;
    goal?: string;
    progress?: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  message?: string;       // certains back renvoient "message"
  response?: string;      // d'autres "response"
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
  };
  metadata?: {
    technique?: string;
    goal?: string;
    progress?: any[];
    currentGoal?: string; // suivant les back
  };
}

// --------- Base URL (publique côté navigateur) ----------
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||    // fallback si tu n'as pas NEXT_PUBLIC
  "http://localhost:3001"
).replace(/\/$/, "");

// --------- Auth headers ----------
const getAuthHeaders = () => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
};

// --------- Fetch helper (logs + parse robuste) ----------
async function xfetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { headers: getAuthHeaders(), ...init });

  const raw = await res.text(); // récupère TOUJOURS le texte
  if (!res.ok) {
    console.error("API ERROR", { url, status: res.status, body: raw });
    // essaie d'extraire un message d'erreur JSON
    try {
      const j = JSON.parse(raw);
      throw new Error(j.error || j.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(raw || `HTTP ${res.status}`);
    }
  }

  // essaie de parser le JSON, sinon renvoie le texte
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// =======================================================
// ===============     ENDPOINTS CHAT     ================
// =======================================================

export async function createChatSession(): Promise<string> {
  const data = await xfetch(`${API_BASE}/chat/sessions`, { method: "POST" });
  // attendu: { sessionId: "..." }
  if (typeof data === "object" && data?.sessionId) return data.sessionId;
  console.error("Réponse inattendue de createChatSession:", data);
  throw new Error("Réponse inattendue du serveur (sessionId manquant)");
}

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<ApiResponse> {
  const body = JSON.stringify({ message });
  const data = await xfetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body,
  });

  // data peut être texte ou objet { response, metadata, ... }
  if (typeof data === "string") {
    return { response: data };
  }
  return data as ApiResponse;
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const data = await xfetch(`${API_BASE}/chat/sessions/${sessionId}/history`, {
    method: "GET",
  });

  // attendu: un tableau [{role, content, timestamp, ...}]
  if (!Array.isArray(data)) {
    console.error("Format inattendu pour l'historique:", data);
    throw new Error("Format d'historique invalide");
  }

  return data.map((msg: any) => ({
    role: msg.role as ChatRole,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    metadata: msg.metadata,
  }));
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  const data = await xfetch(`${API_BASE}/chat/sessions`, { method: "GET" });
  // Certains back renvoient {sessions:[...]}, d'autres un array direct
  const list = Array.isArray(data) ? data : data?.sessions || [];

  return list.map((s: any) => ({
    sessionId: s.sessionId,
    createdAt: new Date(s.createdAt || Date.now()),
    updatedAt: new Date(s.updatedAt || Date.now()),
    messages: (s.messages || []).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp || Date.now()),
    })),
  }));
}
