import Image from "next/image";

type PhotoRow = {
    id: string;
    public_url: string;
    created_at: string;
};

export default async function GalleryPage() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const galleryId = "default";

    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/photos?gallery_id=eq.${galleryId}&order=created_at.desc&limit=200`,
        {
            headers: {
                apikey: ANON_KEY,
                Authorization: `Bearer ${ANON_KEY}`,
            },
            // avoid caching so new uploads show up
            cache: "no-store",
        }
    );

    if (!res.ok) {
        const text = await res.text();
        return (
            <main className="p-8">
                <h1 className="text-2xl font-semibold">Gallery</h1>
                <p className="mt-4 text-red-600">Failed to load photos: {text}</p>
            </main>
        );
    }

    const photos: PhotoRow[] = await res.json();

    return (
        <main className="p-8">
            <h1 className="text-2xl font-semibold">Gallery</h1>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((p) => (
                    <a key={p.id} href={p.public_url} target="_blank" rel="noreferrer">
                        {/* plain img is simplest for external URLs */}
                        <img
                            src={p.public_url}
                            alt="Uploaded"
                            className="aspect-square w-full rounded-xl object-cover border border-black/[.08] dark:border-white/[.145]"
                            loading="lazy"
                        />
                    </a>
                ))}
            </div>
        </main>
    );
}
