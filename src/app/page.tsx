"use client";

import { useEffect, useRef, useState } from "react";
import PhotoTile from "./gallery/PhotoTile";

type PhotoRow = {
  id: string;
  public_url: string;
  created_at: string;
  email: string;
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPhotos() {
    const res = await fetch("/api/photos");
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

    setBusy(true);
    try {

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,

      });

      if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Upload failed.");
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
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="relative flex min-h-screen w-full max-w-3xl flex-col py-12 px-6 sm:px-16 bg-background">
        <div className="absolute top-6 right-6 flex gap-4 text-sm text-white">
          <a href="/login" className="font-semibold hover:scale-[1.04] active:scale-[0.98]">Login</a>
          <a href="/signup" className="font-semibold hover:scale-[1.04] active:scale-[0.98]">Sign up</a>
        </div>

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="font-[family-name:var(--font-nabla)] text-5xl font-semibold leading-10 tracking-tight text-white hover:scale-[1.02] active:scale-[0.98]">
            POINT OF VIEW
          </h1>
          <p className="font-[family-name:var(--font-nabla)] max-w-xs sm:max-w-md text-lg leading-8 text-white hover:scale-[1.04] active:scale-[0.98]">
            See the way I see through POV.
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
            className="group relative flex h-12 items-center gap-2 rounded-2xl border border-pink-200/60 bg-pink-100/50 px-6 text-sm font-medium text-pink-900 shadow-lg shadow-pink-300/40 backdrop-blur-xl transition-all hover:bg-blue-100/50 hover:shadow-blue-400/60 hover:border-blue-500/50 hover:text-blue-900  hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 dark:border-pink-400/20 dark:bg-blue-500/20 dark:text-yellow-100 dark:shadow-blue-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60 transition-transform group-hover:-translate-y-0.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>


          <a href="/feed"
            className="group relative flex h-12 items-center gap-2 rounded-2xl border border-purple-200/60 bg-purple-100/50 px-6 text-sm font-medium text-purple-900 shadow-lg shadow-purple-300/40 backdrop-blur-xl transition-all hover:bg-green-100/50 hover:shadow-green-400/50 hover:border-green-200/60 hover:text-green-900 hover:scale-[1.02] active:scale-[0.98] dark:border-purple-400/20 dark:bg-purple-500/20 dark:text-purple-100 dark:shadow-purple-500/30 dark:hover:bg-green-500/20 dark:hover:shadow-green-400/30 dark:hover:text-green-100">
            View Feed
          </a>

        </div>

        {msg && <p className="mt-6 text-sm text-white">{msg}</p>}

        {/* Photo Gallery */}
        <div className="mt-8">
          {loading ? (
            <p className="text-white">Loading gallery...</p>
          ) : photos.length === 0 ? (
            <p className="text-white">No photos yet — be the first to upload!</p>
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

        <div className="mt-auto flex flex-col mt-4 items-center gap-4 text-center sm:items-start sm:text-left">
          <p className="max-w-xs sm:max-w-md text-sm leading-8 text-white">
            Looking for more? Check out {" "}
              <a href="https://mootooo.vercel.app/" className="inline-block font-semibold font-medium text-white hover:scale-[1.04] active:scale-[0.98]">
                mooToo!
              </a>{" "}
                or my{" "}
              <a href="https://www.linkedin.com/in/angelachang4303/" className="inline-block font-semibold font-medium text-white hover:scale-[1.04] active:scale-[0.98]">
                Linkedin
              </a>.
          </p>
        </div>
      </main>
    </div>
  );
}