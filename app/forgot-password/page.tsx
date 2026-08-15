"use client";

import { useEffect, useState, Suspense } from "react";
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
    setEmail(emailFromLogin.trim().toLowerCase());
  }, [emailFromLogin]);

  async function sendResetRequest() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(
        "No valid email address was provided. Please return to login and enter your email address first."
      );
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
        "If an account exists for this email address, a password reset link has been sent. Please check your inbox and spam folder."
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
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101010] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">

        {/* Header */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b8f500]">
            Account recovery
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/50">
            We&apos;ll send a password reset link to the email
            address associated with your account.
          </p>
        </div>

        {/* Email */}
        <div className="mt-6">
          <p className="mb-2 block text-xs font-medium text-white/45">
            Reset link will be sent to
          </p>

          <div className="flex min-h-12 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4">
            <span className="break-all text-sm text-white/80">
              {email || "No email address provided"}
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-white/25">
            To use a different email address, return to the login
            screen and change it there.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm leading-5 text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-5 rounded-xl border border-[#b8f500]/20 bg-[#b8f500]/5 px-4 py-3 text-sm leading-5 text-[#b8f500]">
            {success}
          </div>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={sendResetRequest}
          disabled={loading || !email}
          className="mt-6 h-12 w-full rounded-xl bg-[#b8f500] text-sm font-bold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        {/* Back to login */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 w-full text-center text-sm text-white/50 transition hover:text-[#b8f500]"
        >
          Back to login
        </button>

      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
          <div className="text-sm text-white/50">
            Loading...
          </div>
        </main>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}