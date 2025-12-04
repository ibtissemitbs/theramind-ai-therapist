const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  totpEnabled: boolean;
  profileImage?: string;
  createdAt: Date;
}

/**
 * Obtenir le profil de l'utilisateur connecté
 */
export const getProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Non authentifié");
  }

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la récupération du profil");
  }

  const data = await response.json();
  return data.user;
};

/**
 * Mettre à jour le profil utilisateur
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Non authentifié");
  }

  console.log("[API] Mise à jour profil avec:", profileData);

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  console.log("[API] Response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error("[API] Erreur response:", error);
    throw new Error(error.message || "Erreur lors de la mise à jour du profil");
  }

  const data = await response.json();
  console.log("[API] Profil mis à jour:", data);
  return data.user;
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("Non authentifié");
  }

  console.log("[API] Changement mot de passe...");

  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  console.log("[API] Response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error("[API] Erreur response:", error);
    throw new Error(error.message || "Erreur lors du changement de mot de passe");
  }

  const data = await response.json();
  console.log("[API] Mot de passe changé:", data);
  return data;
};

/**
 * Uploader une image de profil (base64)
 */
export const uploadProfileImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };
    
    reader.readAsDataURL(file);
  });
};
