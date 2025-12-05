"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("Token de vérification manquant");
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      console.log("[VERIFY] Envoi de la requête avec token:", token.substring(0, 10) + "...");
      
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      console.log("[VERIFY] Statut de la réponse:", response.status);
      
      const data = await response.json();
      console.log("[VERIFY] Données reçues:", data);

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
        
        // Toujours rediriger vers login pour configurer 2FA
        console.log("[VERIFY] ✅ Email vérifié, redirection vers login...");
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2500);
      } else {
        console.error("[VERIFY] ❌ Erreur HTTP:", response.status, data);
        if (data.expired) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
        setMessage(data.message || "Erreur lors de la vérification");
      }
    } catch (error) {
      console.error("[VERIFY] ❌ Exception:", error);
      setStatus("error");
      setMessage("Erreur de connexion au serveur");
    }
  };

  const handleResendEmail = async () => {
    const email = localStorage.getItem("pendingVerificationEmail");
    
    if (!email) {
      setMessage("Adresse email non trouvée. Veuillez vous réinscrire.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Email de vérification renvoyé ! Vérifiez votre boîte de réception.");
      } else {
        setMessage(data.message || "Erreur lors du renvoi");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur");
      console.error("Error resending email:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      <Container className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-primary/20">
            <CardHeader className="text-center space-y-2">
              {status === "loading" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-2xl">Vérification en cours...</CardTitle>
                  <CardDescription>
                    Veuillez patienter pendant que nous vérifions votre adresse email
                  </CardDescription>
                </>
              )}

              {status === "success" && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                    Email vérifié ! ✅
                  </CardTitle>
                  <CardDescription>{message}</CardDescription>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                    Erreur de vérification
                  </CardTitle>
                  <CardDescription>{message}</CardDescription>
                </>
              )}

              {status === "expired" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
                    Lien expiré ⏱️
                  </CardTitle>
                  <CardDescription>{message}</CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      🔄 Redirection vers la page de connexion...
                    </p>
                    <Button 
                      onClick={() => router.push("/login?verified=true")}
                      className="w-full"
                    >
                      Aller à la page de connexion
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                )}              {(status === "error" || status === "expired") && (
                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="w-full"
                    variant="default"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 w-4 h-4" />
                        Renvoyer l'email de vérification
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => router.push("/signup")}
                    variant="outline"
                    className="w-full"
                  >
                    Retour à l'inscription
                  </Button>
                </div>
              )}

              <div className="text-center pt-4">
                <Button
                  variant="link"
                  onClick={() => router.push("/")}
                  className="text-sm"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
