import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_API_URL ||
    "https://theramind-backend.onrender.com";

  console.log("[REGISTER API ROUTE] Calling backend:", `${API_URL}/auth/register`);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 secondes timeout
    });
    const data = await res.json();
    console.log("[REGISTER API ROUTE] Backend response status:", res.status);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[REGISTER API ROUTE] Error:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de l'inscription.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
