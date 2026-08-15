"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("This password reset link is invalid or expired.");
    } else {
      setTokenValid(true);
    }
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reset your password.");
      }

      setSuccess("Your password has been reset successfully. Redirecting to login...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while resetting your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (tokenValid === false) {
    return (
      <div className="max-w-md rounded-3xl border border-red-500/20 bg-[#101010] p-8 text-center">
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <p className="mt-4 text-sm text-white/60">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 rounded-xl bg-[#b8f500] px-5 py-3 font-semibold text-black"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101010] p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b8f500]">
        Security
      </p>
      <h1 className="mt-3 text-3xl font-bold">Set a new password</h1>
      <p className="mt-2 text-sm text-white/50">
        Choose a new password for your account.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-[#b8f500]/20 bg-[#b8f500]/5 px-4 py-3 text-sm text-[#b8f500]">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs text-white/45">New password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus:border-[#b8f500]"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-white/45">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your new password"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus:border-[#b8f500]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tokenValid}
          className="h-12 w-full rounded-xl bg-[#b8f500] font-semibold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
      <Suspense fallback={<div className="text-white/50">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
