import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {

    const { id } = await context.params;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!url || !serviceKey) {
        return NextResponse.json({ error: "Missing server env vars" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);

    const { data: photo, error: readErr } = await supabase
        .from("photos")
        .select("id, storage_path")
        .eq("id", id)
        .single();

    if (readErr || !photo) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.storage_path) {
        const { error: storageErr } = await supabase.storage
            .from("my-pov")
            .remove([photo.storage_path]);

        if (storageErr) {
            return NextResponse.json(
                { error: `Storage delete failed: ${storageErr.message}` },
                { status: 500 }
            );
        }
    }

    const { error: dbErr } = await supabase.from("photos").delete().eq("id", id);

    if (dbErr) {
        return NextResponse.json(
            { error: `DB delete failed: ${dbErr.message}` },
            { status: 500 }
        );
    }
    return NextResponse.json({ ok: true });
}