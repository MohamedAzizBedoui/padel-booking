"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            PADEL
            <span className="text-[#b8f500]">
              BOOK
            </span>
          </Link>

          <Link
            href="/register"
            className="text-sm text-white/50 transition hover:text-white"
          >
            Create account
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b8f500]">
              Welcome back
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Log in
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Log in to manage your bookings.
            </p>
          </div>

          {registered && (
            <div className="mt-6 rounded-xl border border-[#b8f500]/20 bg-[#b8f500]/10 p-3 text-sm text-[#b8f500]">
              Account created successfully.
              You can now log in.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs text-white/50">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#b8f500]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-white/50">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#b8f500]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#b8f500] py-3.5 text-sm font-semibold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Logging in..."
                : "Log in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#b8f500] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}