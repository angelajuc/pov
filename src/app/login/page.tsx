"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error ?? "Login failed.");
        return;
      }

      router.push("/signup");
    } finally {
      setBusy(false);
    }
  }

  return (
    //<main className="p-6 max-w-sm mx-auto font-sans">
    <main className="min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Log in</h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={busy}
            className="mt-2 h-11 rounded bg-black text-white disabled:opacity-60"
            type="submit"
          >
            {busy ? "Signing in…" : "Log in"}
          </button>

          {msg && <p className="text-sm mt-2">{msg}</p>}
        </form>

        <div className="mt-6 text-center">
          <a href="/signup" className="font-semibold underline">
            Don't have an account? Sign up here!
          </a>
        </div>
      </div>
    </main>
  );
}
