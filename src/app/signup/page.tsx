"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error ?? "Signup failed.");
        return;
      }

      setMsg("Signup successful. Logging in…");

      // optional: auto-login after signup
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) router.push("/page");
      else router.push("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex justify-center pt-24 md:pt-32 p-6 font-sans">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-nabla)] text-5xl text-center font-semibold hover:scale-[1.02] active:scale-[0.98]">Sign up</h1>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2 text-white hover:scale-[1.02] active:scale-[0.98]"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-white hover:scale-[1.02] active:scale-[0.98]"
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={busy}
            className="font-[family-name:var(--font-jacquard-24)] text-2xl mt-2 h-11 rounded bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
            type="submit"
          >
            {busy ? "Creating…" : "Create account"}
          </button>

          {msg && <p className="text-sm mt-2">{msg}</p>}
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="font-semibold underline text-white">
              Already have an account? Log in here!
          </a>
        </div>
      </div>
    </main>
  );
}
