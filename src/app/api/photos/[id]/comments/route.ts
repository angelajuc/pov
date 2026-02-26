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
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("photo_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get emails for comment authors
  const userIds = [...new Set(data?.map((c) => c.user_id) ?? [])];
  const { data: users } = await supabase
    .from("users_local")
    .select("id, email")
    .in("id", userIds);

  const userMap = Object.fromEntries(users?.map((u) => [u.id, u.email]) ?? []);

  const comments = data?.map((c) => ({
    ...c,
    email: userMap[c.user_id] ?? "Unknown",
  }));

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = await getUser(req);
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { content } = await req.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").insert({
    photo_id: id,
    user_id: userId,
    content: content.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}