import PhotoTile from "./PhotoTile";

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
                <h1 className="font-[family-name:var(--font-nabla)] text-4xl text-white font-semibold hover:scale-[1.02] active:scale-[0.98]">Gallery</h1>
                <p className="mt-4 text-red-400">Failed to load photos: {text}</p>
            </main>


        );
    }

    const photos: PhotoRow[] = await res.json();

    return (
        <main className="p-8 font-sans">
            <h1 className="font-[family-name:var(--font-nabla)] text-4xl text-white font-semibold hover:scale-[1.00] active:scale-[0.99]">Gallery</h1>


            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((p) => {
                    const isExpired = new Date(p.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
                    if (isExpired) return null;

                    return (
                        <PhotoTile
                            key={p.id}
                            id={p.id}
                            public_url={p.public_url}
                            created_at={p.created_at}
                        />
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col gap-6 text-base font-medium sm:flex-row">
                <a href="https://pov-angela-chang.vercel.app/"
                    className="group relative flex h-12 items-center gap-2 rounded-2xl border border-pink-200/60 bg-pink-100/50 px-6 text-sm font-medium text-pink-900 shadow-lg shadow-pink-300/40 backdrop-blur-xl transition-all hover:bg-blue-100/50 hover:shadow-blue-400/60 hover:border-blue-500/50 hover:text-blue-900  hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 dark:border-pink-400/20 dark:bg-blue-500/20 dark:text-yellow-100 dark:shadow-blue-500/20 dark:hover:bg-blue-500/20 dark:hover:shadow-blue-400/30 dark:hover:text-blue-100">
                    Upload More
                </a>

                <a href="/feed"
                  className="group relative flex h-12 items-center gap-2 rounded-2xl border border-purple-200/60 bg-purple-100/50 px-6 text-sm font-medium text-purple-900 shadow-lg shadow-purple-300/40 backdrop-blur-xl transition-all hover:bg-green-100/50 hover:shadow-green-400/50 hover:border-green-200/60 hover:text-green-900 hover:scale-[1.02] active:scale-[0.98] dark:border-purple-400/20 dark:bg-purple-500/20 dark:text-purple-100 dark:shadow-purple-500/30 dark:hover:bg-green-500/20 dark:hover:shadow-green-400/30 dark:hover:text-green-100">
                  View Feed
                </a>
            </div>
        </main>
    );
}
