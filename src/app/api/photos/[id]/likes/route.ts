import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUser(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId) return null;

  const { data } = await supabase
    .from("sessions_local")
    .select("user_id")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .single();

  return data?.user_id ?? null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data, error } = await supabase
    .from("likes")
    .select("id, user_id")
    .eq("photo_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ likes: data, count: data?.length ?? 0 });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = await getUser(req);
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // Toggle: if already liked, unlike
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("photo_id", id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return NextResponse.json({ liked: false });
  }

  const { error } = await supabase.from("likes").insert({
    photo_id: id,
    user_id: userId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ liked: true });
}