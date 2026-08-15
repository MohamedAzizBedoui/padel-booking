"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromLogin = searchParams.get("email") ?? "";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailFromLogin) {
      setEmail(emailFromLogin.trim().toLowerCase());
    }
  }, [emailFromLogin]);

  async function sendResetRequest(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to send reset email."
        );
      }

      setSuccess(
        `If an account exists for ${normalizedEmail}, a password reset link has been sent. Please check your inbox (and spam folder).`
      );
    } catch (err) {
      console.error("Password reset request failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while sending the reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101010] p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b8f500]">
        Account recovery
      </p>

      <h1 className="mt-3 text-3xl font-bold">
        Forgot your password?
      </h1>

      <p className="mt-2 text-sm text-white/50">
        Enter your email address and we will send you a password reset link.
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

      <form onSubmit={sendResetRequest} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-xs text-white/45">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none focus:border-[#b8f500]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="h-12 w-full rounded-xl bg-[#b8f500] text-sm font-bold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="mt-4 w-full text-center text-sm text-white/50 transition hover:text-[#b8f500]"
      >
        Back to login
      </button>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
      <Suspense fallback={<div className="text-white/50">Loading...</div>}>
        <ForgotPasswordContent />
      </Suspense>
    </main>
  );
}
