import ExpiresIn from "./ExpiresIn";

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
        <main className="p-8 font-sans">
            <h1 className="text-2xl font-semibold">Gallery</h1>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((p) => {
                    const isExpired = new Date(p.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
                    if (isExpired) return null;

                    return (
                        <a key={p.id} href={p.public_url} target="_blank" rel="noreferrer"
                           className={"group relative block"}>
                            {/* plain img is simplest for external URLs */}
                            <img
                                src={p.public_url}
                                alt="Uploaded"
                                className="aspect-square w-full rounded-xl object-cover border border-black/[.08] dark:border-white/[.145]"
                                loading="lazy"
                            />
                            {/* Hover overlay */}
                            <div
                                className="pointer-events-none absolute inset-0 flex items-end rounded-xl bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                                <div className="m-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                                    Expires in <ExpiresIn createdAt={p.created_at} ttlHours={24}/>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col gap-12 text-base font-medium sm:flex-row">
                <a
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
                    href="https://pov-angela-chang.vercel.app/"
                >
                    Upload More
                </a>
            </div>
        </main>
    );
}
