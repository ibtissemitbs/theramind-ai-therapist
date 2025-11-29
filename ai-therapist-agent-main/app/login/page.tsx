"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser(email, password);
      
      // Vérifier si une vérification email est requise
      if (response.requiresEmailVerification) {
        setError("⚠️ Votre email n'est pas encore vérifié. Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.");
        // Sauvegarder l'email pour un éventuel renvoi
        localStorage.setItem("pendingVerificationEmail", email);
      } else if (response.requiresQRVerification) {
        // Première configuration TOTP - Rediriger vers la page de vérification QR avec le QR code
        const params = new URLSearchParams({
          qrCode: response.qrCode,
          qrToken: response.qrToken,
          userName: response.user.name,
          isFirstTimeSetup: "true",
        });
        router.push(`/qr-verification?${params.toString()}`);
      } else if (response.requiresTOTPCode) {
        // TOTP déjà configuré - Rediriger vers la page de saisie du code
        const params = new URLSearchParams({
          qrToken: response.qrToken,
          userName: response.user.name,
          isFirstTimeSetup: "false",
        });
        router.push(`/qr-verification?${params.toString()}`);
      } else {
        // Connexion normale avec token
        localStorage.setItem("token", response.token);
        await checkSession();
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.message || "Email ou mot de passe invalide. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/50 via-background to-secondary">
      <Container className="flex flex-col items-center justify-center w-full">
        <Card className="w-full md:w-5/12 max-w-2xl p-10 rounded-3xl shadow-xl border border-border bg-card/90 backdrop-blur-md mt-12">
          {/* ---- Titre ---- */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">
              Connexion
            </h1>
            <p className="text-muted-foreground">
              Bienvenue ! Connectez-vous pour poursuivre votre parcours.
            </p>
          </div>

          {/* ---- Formulaire ---- */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@domaine.com"
                    className="pl-11 py-3 text-base rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 py-3 text-base rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <p className="text-destructive text-sm text-center font-medium">
                {error}
              </p>
            )}

            {/* Bouton */}
            <Button
              className="w-full py-3 text-base rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:from-primary/90 hover:to-primary transition-all"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* ---- Liens secondaires ---- */}
          <div className="my-8 border-t border-border" />
          <div className="flex flex-col items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Nouveau sur{" "}
              <span className="font-semibold text-primary">Theramind</span> ?
            </span>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="text-primary font-medium hover:text-primary/80 underline transition-colors"
              >
                S’inscrire
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
