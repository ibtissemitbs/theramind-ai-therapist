"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "SessionContext: Token from localStorage:",
        token ? "exists" : "not found"
      );

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("SessionContext: Fetching user data with timestamp", Date.now());
      // Force cache-busting avec timestamp unique + random pour être sûr
      const cacheBuster = `${Date.now()}_${Math.random()}`;
      const response = await fetch(`/api/auth/me?t=${cacheBuster}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });

      console.log("SessionContext: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("SessionContext: User data received:", data);
        const userData = data.user;
        const { password, ...safeUserData } = userData;
        
        console.log("SessionContext: safeUserData profileImage:", safeUserData.profileImage ? `${safeUserData.profileImage.substring(0, 50)}...` : "null");
        
        // Vérifier si c'est un nouvel utilisateur ou si l'utilisateur a changé
        const lastUserId = localStorage.getItem("lastUserId");
        if (lastUserId && lastUserId !== safeUserData._id) {
          console.log("SessionContext: Different user detected, clearing localStorage");
          // Nettoyer toutes les données de l'ancien utilisateur
          const token = localStorage.getItem("token");
          localStorage.clear();
          // Remettre le token
          if (token) localStorage.setItem("token", token);
        }
        
        // Sauvegarder l'ID de l'utilisateur actuel
        localStorage.setItem("lastUserId", safeUserData._id);
        
        // TOUJOURS mettre à jour l'utilisateur avec les nouvelles données
        console.log("SessionContext: Updating user state with fresh data");
        console.log("SessionContext: Before setUser, current user:", user);
        setUser(safeUserData);
        console.log("SessionContext: After setUser called with:", safeUserData);
      } else {
        console.log("SessionContext: Failed to get user data");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("lastUserId");
      }
    } catch (error) {
      console.error("SessionContext: Error checking session:", error);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("lastUserId");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Nettoyer TOUTES les données localStorage à la déconnexion
      console.log("SessionContext: Clearing all localStorage data on logout");
      localStorage.clear();
      setUser(null);
      router.push("/");
    }
  };

  useEffect(() => {
    console.log("SessionContext: Initial check");
    checkSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        checkSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
