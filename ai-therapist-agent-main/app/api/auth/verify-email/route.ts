import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "https://theramind-backend.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("[VERIFY-EMAIL API] Envoi au backend:", BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[VERIFY-EMAIL API] Réponse backend:", data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[VERIFY-EMAIL API] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification de l'email" },
      { status: 500 }
    );
  }
}
