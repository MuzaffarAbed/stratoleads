"use client";

import { useState } from "react";

import { controlClass } from "@/components/ui/styles";

export function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        setError(result.message || "Sign-in failed.");
        return;
      }
      setPassword("");
      onSuccess();
    } catch {
      setError("Sign-in failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass mx-auto w-full max-w-md rounded-3xl p-6">
      <h1 className="text-3xl font-light tracking-[-0.03em] text-ink">Business card administration</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Sign in to manage STRATO digital business cards.</p>
      <label htmlFor="password" className="mt-6 mb-1.5 block text-sm font-medium">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        className={controlClass}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-teal text-sm font-medium text-ink hover:bg-teal-dark disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
