import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("photos")
    .select("id, public_url, created_at, user_id")
    .eq("gallery_id", "default")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get uploader emails
  const userIds = [...new Set(data?.map((p) => p.user_id).filter(Boolean) ?? [])];
  let userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users_local")
      .select("id, email")
      .in("id", userIds);

    userMap = Object.fromEntries(users?.map((u) => [u.id, u.email]) ?? []);
  }

  const photos = data?.map((p) => ({
    ...p,
    email: p.user_id ? userMap[p.user_id] ?? "anon" : "anon",
  }));

  return NextResponse.json(data);
}