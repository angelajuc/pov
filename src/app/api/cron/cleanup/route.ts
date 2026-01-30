import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET!;

    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const BUCKET = "my-pov";
    const TTL_HOURS = 24;

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const cutoff = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000).toISOString();

    // grab up to 100 expired at a time (loop to avoid timeouts)
    let total = 0;

    while (true) {
        const { data: rows, error } = await supabase
            .from("photos")
            .select("id, storage_path")
            .lt("created_at", cutoff)
            .limit(100);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (!rows || rows.length === 0) break;

        const paths = rows.map(r => r.storage_path).filter(Boolean) as string[];
        if (paths.length) {
            const { error: storErr } = await supabase.storage.from(BUCKET).remove(paths);
            if (storErr) {
                return NextResponse.json({ error: storErr.message }, { status: 500 });
            }
        }

        const ids = rows.map(r => r.id);
        const { error: delErr } = await supabase.from("photos").delete().in("id", ids);
        if (delErr) {
            return NextResponse.json({ error: delErr.message }, { status: 500 });
        }

        total += rows.length;
    }

    return NextResponse.json({ ok: true, deleted: total });
}
