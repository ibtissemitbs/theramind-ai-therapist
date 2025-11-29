// Static data for the dashboard
const staticChatHistory = [
  {
    id: "1",
    userId: "user1",
    message: "Hi, how are you feeling today?",
    role: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    sentiment: "positive",
    context: null,
  },
  {
    id: "2",
    userId: "user1",
    message: "I'm feeling a bit anxious about my presentation tomorrow.",
    role: "user",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    sentiment: "negative",
    context: null,
  },
  {
    id: "3",
    userId: "user1",
    message:
      "I understand presentations can be stressful. Would you like to try a quick breathing exercise together?",
    role: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    sentiment: "neutral",
    context: null,
  },
];

const staticSessions = [
  {
    id: "1",
    userId: "user1",
    title: "First Therapy Session",
    status: "completed",
    summary: "Discussed anxiety management techniques",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "2",
    userId: "user1",
    title: "Follow-up Session",
    status: "scheduled",
    summary: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

const staticActivities = [
  {
    id: "1",
    userId: "user1",
    type: "meditation",
    name: "Morning Meditation",
    description: "10-minute guided meditation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: 10,
    completed: true,
    moodScore: 8,
    moodNote: "Feeling refreshed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    userId: "user1",
    type: "exercise",
    name: "Evening Walk",
    description: "30-minute walk in the park",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    duration: 30,
    completed: false,
    moodScore: null,
    moodNote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
  },
];

export const getSessionChatHistory = async (sessionId: string) => {
  return staticChatHistory;
};

export const saveChatMessage = async (data: {
  userId: string;
  message: string;
  role: "user" | "assistant";
  context?: any;
}) => {
  const newMessage = {
    id: Math.random().toString(36).substr(2, 9),
    userId: data.userId,
    message: data.message,
    role: data.role,
    timestamp: new Date(),
    sentiment: "neutral",
    context: data.context,
  };
  staticChatHistory.push(newMessage);
  return newMessage;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: string
) => {
  const session = staticSessions.find((s) => s.id === sessionId);
  if (session) {
    session.status = status;
    session.updatedAt = new Date();
  }
  return session;
};

export const updateTherapySession = async (
  sessionId: string,
  data: {
    status?: string;
    summary?: string;
    title?: string;
  }
) => {
  const session = staticSessions.find((s) => s.id === sessionId);
  if (session) {
    if (data.status) session.status = data.status;
    if (data.summary) session.summary = data.summary;
    if (data.title) session.title = data.title;
    session.updatedAt = new Date();
  }
  return session;
};

export const getTodaysActivities = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return staticActivities.filter(
    (activity) =>
      activity.userId === userId &&
      activity.timestamp >= today &&
      activity.timestamp < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  );
};

export const updateActivityStatus = async (
  activityId: string,
  completed: boolean
) => {
  const activity = staticActivities.find((a) => a.id === activityId);
  if (activity) {
    activity.completed = completed;
    activity.updatedAt = new Date();
  }
  return activity;
};

export const getLatestHealthMetrics = async (userId: string) => {
  return {
    heartRate: 72,
    steps: 5432,
    sleepHours: 7.5,
    stressLevel: "low",
  };
};

export const getUserActivities = async (userId: string) => {
  // Charger depuis localStorage au lieu des données statiques
  try {
    const stored = localStorage.getItem('user_activities') || '[]';
    const activities = JSON.parse(stored);
    return activities.map((a: any) => ({
      id: a.id || Math.random().toString(36).substr(2, 9),
      userId: userId,
      type: a.type || 'activity',
      name: a.name || a.description || 'Activité',
      description: a.description || a.name || '',
      timestamp: new Date(a.timestamp || a.createdAt || Date.now()),
      duration: a.duration || 0,
      completed: a.completed || false,
      moodScore: a.moodScore || null,
      moodNote: a.moodNote || a.note || null,
      createdAt: new Date(a.createdAt || a.timestamp || Date.now()),
      updatedAt: new Date(a.updatedAt || a.timestamp || Date.now()),
    }));
  } catch (error) {
    console.error('Error loading activities from localStorage:', error);
    return [];
  }
};

export const saveMoodData = async (data: {
  userId: string;
  mood: number;
  note?: string;
}) => {
  const newActivity = {
    id: Date.now().toString(),
    userId: data.userId,
    type: "mood",
    name: "Suivi d'humeur",
    description: data.note || "",
    timestamp: new Date().toISOString(),
    duration: 0,
    completed: true,
    moodScore: data.mood,
    moodNote: data.note || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Sauvegarder dans localStorage pour affichage immédiat
  try {
    const stored = localStorage.getItem('user_activities') || '[]';
    const activities = JSON.parse(stored);
    activities.unshift(newActivity);
    localStorage.setItem('user_activities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving mood to localStorage:', error);
  }

  // Envoyer aussi à MongoDB via l'API activity
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
          type: 'mood',
          name: 'Suivi d\'humeur',
          description: data.note || '',
          duration: 0,
        }),
      });
      console.log('✅ Mood activity saved to MongoDB');
    }
  } catch (error) {
    console.error('Error saving mood to MongoDB:', error);
  }
  
  return newActivity;
};

export const logActivity = async (data: {
  userId: string;
  type: string;
  name: string;
  description?: string;
  duration?: number;
}) => {
  const newActivity = {
    id: Date.now().toString(),
    userId: data.userId,
    type: data.type,
    name: data.name,
    description: data.description || "",
    timestamp: new Date().toISOString(),
    duration: data.duration || 0,
    completed: true,
    moodScore: null,
    moodNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Sauvegarder dans localStorage pour affichage immédiat
  try {
    const stored = localStorage.getItem('user_activities') || '[]';
    const activities = JSON.parse(stored);
    activities.unshift(newActivity);
    localStorage.setItem('user_activities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error logging activity to localStorage:', error);
  }

  // Envoyer aussi à MongoDB via l'API
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
          type: data.type,
          name: data.name,
          description: data.description || '',
          duration: data.duration || 0,
        }),
      });
      console.log('✅ Activity saved to MongoDB:', data.name);
    }
  } catch (error) {
    console.error('Error saving activity to MongoDB:', error);
  }
  
  return newActivity;
};
