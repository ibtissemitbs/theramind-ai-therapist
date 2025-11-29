"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

interface QRVerificationPageProps {}

export default function QRVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useSession();
  const qrCode = searchParams.get("qrCode");
  const qrToken = searchParams.get("qrToken");
  const userName = searchParams.get("userName");
  const isFirstTimeSetup = searchParams.get("isFirstTimeSetup") === "true";

  const [totpCode, setTotpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Vérifier le code TOTP
  const handleVerifyCode = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Veuillez entrer un code à 6 chiffres");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken, totpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        
        // Sauvegarder le token
        localStorage.setItem("token", data.token);
        console.log("[QR-VERIFICATION] Token sauvegardé:", data.token.substring(0, 20) + "...");
        
        // Attendre un peu pour que le localStorage soit synchronisé
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mettre à jour la session
        await checkSession();
        console.log("[QR-VERIFICATION] Session mise à jour");
        
        // Redirection vers le dashboard
        setTimeout(() => {
          console.log("[QR-VERIFICATION] Redirection vers dashboard");
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setError(data.message || "Code invalide");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setVerifying(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("QR code expiré. Veuillez vous reconnecter.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerifyCode();
    }
  };

  if (!qrToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-background">
        <Container>
          <Card className="w-full max-w-md p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-700 mb-2">
              Erreur
            </h1>
            <p className="text-muted-foreground mb-6">
              Session invalide. Veuillez vous reconnecter.
            </p>
            <Button onClick={() => router.push("/login")}>
              Retour à la connexion
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-4">
      <Container>
        <Card className="w-full max-w-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Authentification à deux facteurs
            </h1>
            <p className="text-muted-foreground">
              {isFirstTimeSetup 
                ? `Bienvenue ${userName || "Utilisateur"} ! Configurez votre authentification à deux facteurs.`
                : `Bienvenue ${userName || "Utilisateur"} ! Entrez votre code d'authentification.`
              }
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              ⏱️ Code expire dans : <span className="font-bold text-lg">{formatTime(countdown)}</span>
            </p>
          </div>

          {/* QR Code Display - Uniquement pour la première configuration */}
          {isFirstTimeSetup && qrCode && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex justify-center mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-primary/20 rounded-xl"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-semibold">
                  1. Scannez ce code avec votre application d'authentification
                </p>
                <p className="text-xs text-muted-foreground">
                  (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                </p>
                <p className="text-sm text-muted-foreground font-semibold mt-3">
                  2. Entrez le code à 6 chiffres ci-dessous
                </p>
              </div>
            </div>
          )}

          {/* TOTP Code Input */}
          {!verified && (
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium mb-2">
                  Code d'authentification
                </label>
                <Input
                  id="totpCode"
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  disabled={verifying}
                />
              </div>
              
              <Button
                onClick={handleVerifyCode}
                disabled={verifying || totpCode.length !== 6}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier le code"
                )}
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {verified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-green-700 dark:text-green-300 font-semibold">
                  ✅ Code vérifié avec succès !
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Redirection vers le dashboard...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
