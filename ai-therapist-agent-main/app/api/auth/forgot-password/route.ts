import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const API_URL =
    process.env.BACKEND_API_URL ||
    "http://localhost:3001";

  console.log("[FORGOT-PASSWORD API ROUTE] Calling backend:", `${API_URL}/auth/forgot-password`);

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 secondes timeout
    });
    const data = await res.json();
    console.log("[FORGOT-PASSWORD API ROUTE] Backend response status:", res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[FORGOT-PASSWORD API ROUTE] Error:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de l'envoi de l'email.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
