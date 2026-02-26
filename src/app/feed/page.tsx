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
    <main className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto max-w-lg py-8 px-4">
        <h1 className="text-2xl font-medium mb-6 text-center">Feed</h1>

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