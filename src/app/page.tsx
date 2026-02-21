"use client";

import { useEffect, useRef, useState } from "react";
import PhotoTile from "./gallery/PhotoTile";

type PhotoRow = {
  id: string;
  public_url: string;
  created_at: string;
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const galleryId = "default";
  const bucket = "my-pov";

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  async function fetchPhotos() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/photos?gallery_id=eq.${galleryId}&created_at=gte.${cutoff}&order=created_at.desc&limit=200`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
      }
    );
    if (res.ok) {
      const data: PhotoRow[] = await res.json();
      setPhotos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function handleFileSelected(file: File) {
    setMsg(null);

    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setMsg("Image too large (max 15MB).");
      return;
    }
    if (!SUPABASE_URL || !ANON_KEY) {
      setMsg("Missing Supabase env vars.");
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const random = Math.random().toString(16).slice(2);
      const path = `${galleryId}/${Date.now()}_${random}.${ext}`;

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
        {
          method: "PUT",
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        }
      );

      const uploadText = await uploadRes.text();
      if (!uploadRes.ok) {
        throw new Error(`Storage upload failed: ${uploadRes.status} ${uploadText}`);
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/photos`, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          gallery_id: galleryId,
          public_url: publicUrl,
          storage_path: path,
        }),
      });

      if (!insertRes.ok) {
        const text = await insertRes.text();
        throw new Error(`DB insert failed: ${insertRes.status} ${text}`);
      }

      setMsg("Uploaded!");
      // Refresh the gallery immediately
      await fetchPhotos();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="relative flex min-h-screen w-full max-w-3xl flex-col py-12 px-6 sm:px-16 bg-white dark:bg-black">
        <div className="absolute top-6 right-6 flex gap-4 text-sm">
          <a href="/login" className="font-semibold underline">Login</a>
          <a href="/signup" className="font-semibold underline">Sign up</a>
        </div>

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            POINT OF VIEW
          </h1>
          <p className="max-w-xs sm:max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Hey there, see the way I see through POV.
            Looking for more? Head over to my{" "}
            <a href="https://mootooo.vercel.app/" className="font-medium text-zinc-950 dark:text-zinc-50">
              Portfolio
            </a>{" "}
            or my{" "}
            <a href="https://www.linkedin.com/in/angelachang4303/" className="font-medium text-zinc-950 dark:text-zinc-50">
              Linkedin
            </a>.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-base font-medium sm:flex-row">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px] whitespace-nowrap disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>

        {msg && <p className="mt-3 text-sm">{msg}</p>}

        {/* Photo Gallery */}
        <div className="mt-8">
          {loading ? (
            <p className="text-zinc-500">Loading gallery...</p>
          ) : photos.length === 0 ? (
            <p className="text-zinc-500">No photos yet — be the first to upload!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((p) => (
                <PhotoTile
                  key={p.id}
                  id={p.id}
                  public_url={p.public_url}
                  created_at={p.created_at}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <p className="max-w-xs sm:max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for more?
            Head over to my{" "}
              <a href="https://mootooo.vercel.app/" className="font-medium text-zinc-950 dark:text-zinc-50">
                Portfolio
              </a>{" "}
                or my{" "}
              <a href="https://www.linkedin.com/in/angelachang4303/" className="font-medium text-zinc-950 dark:text-zinc-50">
                Linkedin
              </a>.
          </p>
        </div>
      </main>
    </div>
  );
}