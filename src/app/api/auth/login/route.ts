import { NextResponse } from "next/server";
import argon2 from "argon2";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: user, error } = await supabase
    .from("users_local")
    .select("id, password_hash")
    .eq("email", email)
    .single();

  if (error || !user) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  const ok = await argon2.verify(user.password_hash, password);
  if (!ok) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await supabase.from("sessions_local").insert([{
    id: sessionId,
    user_id: user.id,
    expires_at: expires.toISOString(),
  }]);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
  return res;
}
