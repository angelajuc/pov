import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify session and get user
  const { data: session, error: sessErr } = await supabase
    .from("sessions_local")
    .select("user_id")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (sessErr || !session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
  }

  const galleryId = "default";
  const bucket = "my-pov";
  const ext = file.name.split(".").pop() || "jpg";
  const random = Math.random().toString(16).slice(2);
  const path = `${galleryId}/${Date.now()}_${random}.${ext}`;

  // Upload to storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type,
    });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

  // Insert photo with user_id
  const { error: dbErr } = await supabase.from("photos").insert({
    gallery_id: galleryId,
    public_url: publicUrl,
    storage_path: path,
    user_id: session.user_id,
  });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, public_url: publicUrl });
}