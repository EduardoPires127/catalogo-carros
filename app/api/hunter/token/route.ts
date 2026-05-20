import { NextResponse } from "next/server";

let mlToken: { access_token: string; expires_at: number } | null = null;
let dailyCount = 0;
let dailyReset = new Date().setHours(24, 0, 0, 0);

const DAILY_LIMIT = 200;

export async function GET() {
  if (Date.now() > dailyReset) {
    dailyCount = 0;
    dailyReset = new Date().setHours(24, 0, 0, 0);
  }

  if (dailyCount >= DAILY_LIMIT) {
    return NextResponse.json({ error: "Limite diário de buscas atingido." }, { status: 429 });
  }

  const appId = process.env.ML_APP_ID;
  const secret = process.env.ML_SECRET_KEY;

  if (!appId || !secret) {
    return NextResponse.json({ error: "Credenciais ML não configuradas." }, { status: 500 });
  }

  if (mlToken && Date.now() < mlToken.expires_at - 5 * 60 * 1000) {
    dailyCount++;
    return NextResponse.json({
      access_token: mlToken.access_token,
      dailyUsed: dailyCount,
      dailyLimit: DAILY_LIMIT,
    });
  }

  try {
    const res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: appId,
        client_secret: secret,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Falha ao autenticar com ML." }, { status: 502 });
    }

    const data = await res.json();
    mlToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in ?? 21600) * 1000,
    };

    dailyCount++;
    return NextResponse.json({
      access_token: mlToken.access_token,
      dailyUsed: dailyCount,
      dailyLimit: DAILY_LIMIT,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao autenticar." }, { status: 500 });
  }
}
