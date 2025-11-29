const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface CrisisAlert {
  _id: string;
  userId: string;
  sessionId: string;
  level: "low" | "medium" | "high" | "critical";
  message: string;
  keywords: string[];
  userMessage: string;
  resources: Array<{
    title: string;
    phone?: string;
    description: string;
    link?: string;
  }>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrisisStats {
  total: number;
  byLevel: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastCrisis: CrisisAlert | null;
  period: string;
}

// Créer une alerte de crise
export const createCrisisAlert = async (data: {
  userId: string;
  sessionId: string;
  level: string;
  message: string;
  keywords: string[];
  userMessage: string;
  resources: any[];
}): Promise<CrisisAlert> => {
  try {
    const response = await fetch(`${API_URL}/api/crisis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create crisis alert");
    }

    const result = await response.json();
    
    // Sauvegarder aussi en local
    const localAlert = {
      ...result.alert,
      _id: result.alert._id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts = JSON.parse(stored);
    alerts.unshift(localAlert);
    localStorage.setItem('crisis_alerts', JSON.stringify(alerts));
    
    return result.alert;
  } catch (error) {
    // Si l'API échoue, sauvegarder en local uniquement
    console.warn('⚠️ API indisponible, sauvegarde locale seulement');
    const localAlert: CrisisAlert = {
      _id: Date.now().toString(),
      userId: data.userId,
      sessionId: data.sessionId,
      level: data.level as any,
      message: data.message,
      keywords: data.keywords,
      userMessage: data.userMessage,
      resources: data.resources,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts = JSON.parse(stored);
    alerts.unshift(localAlert);
    localStorage.setItem('crisis_alerts', JSON.stringify(alerts.slice(0, 50))); // Garder max 50
    
    return localAlert;
  }
};

// Récupérer les alertes d'un utilisateur
export const getUserCrisisAlerts = async (
  userId: string,
  unreadOnly: boolean = false
): Promise<{ alerts: CrisisAlert[]; unreadCount: number }> => {
  try {
    const url = `${API_URL}/api/crisis/user/${userId}${
      unreadOnly ? "?unreadOnly=true" : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch crisis alerts");
    }

    const result = await response.json();
    return {
      alerts: result.alerts,
      unreadCount: result.unreadCount,
    };
  } catch (error) {
    // Charger depuis localStorage en cas d'erreur
    console.warn('⚠️ API indisponible, chargement local');
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts: CrisisAlert[] = JSON.parse(stored);
    
    const filtered = unreadOnly ? alerts.filter(a => !a.isRead) : alerts;
    const unreadCount = alerts.filter(a => !a.isRead).length;
    
    return {
      alerts: filtered,
      unreadCount,
    };
  }
};

// Obtenir le nombre d'alertes non lues
export const getUnreadAlertsCount = async (userId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/api/crisis/user/${userId}/unread-count`);

    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }

    const result = await response.json();
    return result.unreadCount;
  } catch (error) {
    // Compter depuis localStorage
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts: CrisisAlert[] = JSON.parse(stored);
    return alerts.filter(a => !a.isRead).length;
  }
};

// Marquer une alerte comme lue
export const markAlertAsRead = async (alertId: string): Promise<CrisisAlert> => {
  try {
    const response = await fetch(`${API_URL}/api/crisis/${alertId}/read`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Failed to mark alert as read");
    }

    const result = await response.json();
    
    // Mettre à jour aussi en local
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts: CrisisAlert[] = JSON.parse(stored);
    const updated = alerts.map(a => 
      a._id === alertId ? { ...a, isRead: true, updatedAt: new Date().toISOString() } : a
    );
    localStorage.setItem('crisis_alerts', JSON.stringify(updated));
    
    return result.alert;
  } catch (error) {
    // Mettre à jour en local seulement
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts: CrisisAlert[] = JSON.parse(stored);
    const updated = alerts.map(a => 
      a._id === alertId ? { ...a, isRead: true, updatedAt: new Date().toISOString() } : a
    );
    localStorage.setItem('crisis_alerts', JSON.stringify(updated));
    const alert = updated.find(a => a._id === alertId);
    if (!alert) throw new Error("Alert not found");
    return alert;
  }
};

// Marquer toutes les alertes comme lues
export const markAllAlertsAsRead = async (userId: string): Promise<number> => {
  const response = await fetch(`${API_URL}/api/crisis/user/${userId}/read-all`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to mark all alerts as read");
  }

  const result = await response.json();
  return result.updated;
};

// Supprimer une alerte
export const deleteAlert = async (alertId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/crisis/${alertId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete alert");
  }
};

// Obtenir les statistiques de crises
export const getCrisisStats = async (
  userId: string,
  days: number = 7
): Promise<CrisisStats> => {
  try {
    const response = await fetch(
      `${API_URL}/api/crisis/user/${userId}/stats?days=${days}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crisis stats");
    }

    const result = await response.json();
    return result.stats;
  } catch (error) {
    // Calculer les stats depuis localStorage
    console.warn('⚠️ API indisponible, calcul des stats locales');
    const stored = localStorage.getItem('crisis_alerts') || '[]';
    const alerts: CrisisAlert[] = JSON.parse(stored);
    
    // Filtrer par période
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentAlerts = alerts.filter(a => {
      const alertDate = new Date(a.createdAt);
      return alertDate >= cutoffDate;
    });
    
    // Calculer les stats
    const stats: CrisisStats = {
      total: recentAlerts.length,
      byLevel: {
        critical: recentAlerts.filter(a => a.level === 'critical').length,
        high: recentAlerts.filter(a => a.level === 'high').length,
        medium: recentAlerts.filter(a => a.level === 'medium').length,
        low: recentAlerts.filter(a => a.level === 'low').length,
      },
      lastCrisis: recentAlerts.length > 0 ? recentAlerts[0] : null,
      period: `${days} derniers jours`,
    };
    
    return stats;
  }
};
