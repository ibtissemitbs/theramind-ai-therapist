"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CheckCircle2 } from "lucide-react";

export default function QRSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement après 3 secondes
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-background">
      <Container>
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-3">
            Authentification réussie !
          </h1>
          <p className="text-muted-foreground mb-4">
            Votre QR code a été vérifié avec succès.
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Redirection vers le dashboard...
          </p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
