"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // for now 1 gallery - eventually use galleryid
  const galleryId = "default";
  const bucket = "my-pov"; // <-- must match your Supabase Storage bucket name


  async function handleFileSelected(file: File) {
    setMsg(null);

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image.");
      return;
    }
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMsg("Image too large (max 15MB).");
      return;
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!SUPABASE_URL || !ANON_KEY) {
      setMsg("Missing Supabase env vars.");
      return;
    }

    setBusy(true);
    try {
      // Build a unique path like: default/1700000000000_abcd.jpg
      const ext = file.name.split(".").pop() || "jpg";
      const random = Math.random().toString(16).slice(2);
      const path = `${galleryId}/${Date.now()}_${random}.${ext}`;

      // 1) Upload image to Storage via REST
      // POST or PUT both can work; Supabase docs commonly use POST/PUT depending on endpoint.
      // This endpoint accepts the raw file bytes as the request body.
      const uploadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
          {
            method: "POST",
            headers: {
              apikey: ANON_KEY,
              Authorization: `Bearer ${ANON_KEY}`,
              "Content-Type": file.type,
              "x-upsert": "false",
            },
            body: file,
          }
      );

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Storage upload failed: ${uploadRes.status} ${text}`);
      }

      // Public URL for a public bucket:
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

      // 2) Insert row into photos table via PostgREST
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
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/QRcode.svg"
          alt="QR Code"
          width={170}
          height={200}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Upload your POV to the gallery
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Hi, my name is Angela!
            Looking for more?
            <br />
            Head over to my{" "}
            <a
              href="https://pov-angela-chang.vercel.app/"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Portfolio
            </a>{" "}
            or my{" "}
            <a
              href="https://www.linkedin.com/in/angelachang4303/"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Linkedin
            </a>{" "}
            .
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {/* hidden file input */}
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

          {/* Upload Image button (same styling) */}
          <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px] whitespace-nowrap disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>

          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Gallery
          </a>
        </div>
      </main>
    </div>
  );
}
