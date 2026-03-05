"use client";

import { useEffect, useState } from "react";
import FeedCard from "./FeedCard";

type PhotoRow = {
  id: string;
  public_url: string;
  created_at: string;
  email: string;
};

export default function FeedPage() {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-8 font-sans"><p className="text-white">Loading feed...</p></main>;

  return (
    <main className="min-h-screen bg-pink-200/100 font-sans dark:bg-pink-200/100">
      <div className="mx-auto max-w-md py-8 px-4">
        <h1 className="font-[family-name:var(--font-nabla)] text-5xl font-medium mb-4 text-center hover:scale-[1.04] active:scale-[0.98]">Feed</h1>

        <div className="absolute top-6 right-6 text-sm text-black hover:scale-[1.04] active:scale-[0.98]">
          <a href="/" className="font-[family-name:var(--font-jacquard-24)] text-3xl">Return Home</a>
        </div>

        {photos.length === 0 ? (
          <p className="text-zinc-500 text-center">No photos yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {photos.map((p) => (
              <FeedCard key={p.id} photo={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}