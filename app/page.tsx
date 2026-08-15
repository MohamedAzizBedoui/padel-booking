
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /*
       * ============================
       * SIGN UP
       * ============================
       */
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to create your account."
          );
        }

        // Switch to login after successful registration
        setMode("login");
        setPassword("");
        setName("");

        setSuccess(
          "Account created successfully. You can now log in."
        );

        return;
      }

      /*
       * ============================
       * LOGIN
       * ============================
       *
       * IMPORTANT:
       * We use NextAuth here.
       *
       * We DO NOT call:
       * /api/auth/login
       */
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      console.log("NextAuth login result:", result);

      if (!result) {
        setError(
          "No response from the authentication server."
        );
        return;
      }

      if (result.error) {
        console.error("NextAuth login error:", result.error);

        setError("Invalid email or password.");
        return;
      }

      /*
       * Login succeeded.
       *
       * Go to the authenticated home page.
       */
      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError("");
    setSuccess("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070707] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b8f500]/10 blur-[140px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#b8f500]/5 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group text-left"
          >
            <div className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
              PADEL
              <span className="text-[#b8f500] transition group-hover:text-[#d0ff4a]">
                BOOK
              </span>
            </div>

            <div className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-white/25">
              Play. Book. Repeat.
            </div>
          </button>

          <div className="hidden items-center gap-2 text-xs text-white/30 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b8f500]" />
            Tunisia&apos;s padel booking platform
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-7xl items-center px-6 pb-12 pt-4 lg:px-10 lg:pb-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

          {/* Left side */}
          <div className="hidden lg:block">
            <div className="max-w-2xl">

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b8f500]/20 bg-[#b8f500]/5 px-4 py-2 text-xs font-medium text-[#b8f500]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b8f500]" />
                YOUR NEXT MATCH STARTS HERE
              </div>

              <h1 className="text-6xl font-black leading-[0.95] tracking-[-0.06em] xl:text-8xl">
                FIND.
                <br />
                BOOK.
                <br />
                <span className="text-[#b8f500]">PLAY.</span>
              </h1>

              <p className="mt-8 max-w-lg text-base leading-7 text-white/40 xl:text-lg">
                Discover padel courts around you, check live availability,
                and reserve your next match in just a few clicks.
              </p>

              {/* Feature row */}
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
                <Feature
                  number="01"
                  title="Discover"
                  description="Find clubs"
                />

                <Feature
                  number="02"
                  title="Choose"
                  description="Pick a time"
                />

                <Feature
                  number="03"
                  title="Play"
                  description="Enjoy the match"
                />
              </div>

              {/* Decorative court */}
              <div className="relative mt-12 h-32 max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                <div className="absolute inset-5 rounded-2xl border border-[#b8f500]/20">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#b8f500]/15" />

                  <div className="absolute left-1/2 top-1/2 h-10 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b8f500]/15" />
                </div>

                <div className="absolute bottom-4 left-6 text-[9px] uppercase tracking-[0.25em] text-white/20">
                  COURT READY
                </div>

                <div className="absolute right-6 top-4 text-[9px] uppercase tracking-[0.25em] text-[#b8f500]/40">
                  PADELBOOK
                </div>
              </div>
            </div>
          </div>

          {/* Authentication card */}
          <div className="mx-auto w-full max-w-md">

            {/* Mobile branding */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b8f500]/20 bg-[#b8f500]/5 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-[#b8f500]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b8f500]" />
                Ready to play?
              </div>

              <h1 className="text-5xl font-black tracking-[-0.05em]">
                FIND.
                <span className="text-[#b8f500]"> BOOK.</span>
                <br />
                PLAY.
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
                Find a court, choose your time, and get your next match
                booked.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-[2rem] border border-white/10 bg-[#101010]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">

              {/* Card header */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b8f500]">
                  {mode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  {mode === "login"
                    ? "Let's get you playing."
                    : "Start playing."}
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/35">
                  {mode === "login"
                    ? "Sign in to manage your bookings and find your next court."
                    : "Create your free account and start booking courts."}
                </p>
              </div>

              {/* Mode switcher */}
              <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`rounded-lg py-2.5 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white/[0.09] text-white shadow-sm"
                      : "text-white/35 hover:text-white/70"
                  }`}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`rounded-lg py-2.5 text-sm font-medium transition ${
                    mode === "signup"
                      ? "bg-[#b8f500] text-black"
                      : "text-white/35 hover:text-white/70"
                  }`}
                >
                  Sign up
                </button>

              </div>

              {/* Success */}
              {success && mode === "login" && (
                <div className="mt-5 rounded-xl border border-[#b8f500]/20 bg-[#b8f500]/5 px-4 py-3 text-sm text-[#b8f500]">
                  {success}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm leading-5 text-red-400">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >

                {/* Name */}
                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/45">
                      Full name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Your name"
                      required
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/20 focus:border-[#b8f500]/60 focus:bg-white/[0.05]"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/45">
                    Email address
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
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/20 focus:border-[#b8f500]/60 focus:bg-white/[0.05]"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-medium text-white/45">
                      Password
                    </label>

                    {mode === "login" && (
                      <button
                        type="button"
                        className="text-[11px] text-white/25 transition hover:text-[#b8f500]"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/20 focus:border-[#b8f500]/60 focus:bg-white/[0.05]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/30 transition hover:text-[#b8f500]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Signup notice */}
                {mode === "signup" && (
                  <p className="pt-1 text-[11px] leading-5 text-white/25">
                    By creating an account, you agree to use PadelBook
                    responsibly and provide accurate information.
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 h-13 w-full overflow-hidden rounded-xl bg-[#b8f500] font-semibold text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loading
                      ? mode === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : mode === "login"
                        ? "Log in"
                        : "Create account"}
                  </span>

                  {!loading && (
                    <span className="absolute right-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[10px] uppercase tracking-widest text-white/20">
                  PadelBook
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Switch mode */}
              <p className="text-center text-xs leading-5 text-white/25">
                {mode === "login"
                  ? "Don&apos;t have an account? "
                  : "Already have an account? "}

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      mode === "login"
                        ? "signup"
                        : "login"
                    )
                  }
                  className="font-medium text-[#b8f500] transition hover:text-[#d0ff4a]"
                >
                  {mode === "login"
                    ? "Create one"
                    : "Log in"}
                </button>
              </p>
            </div>

            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-white/15">
              © {new Date().getFullYear()} PadelBook
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * Feature card
 */
function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="text-[10px] font-bold tracking-widest text-[#b8f500]">
        {number}
      </div>

      <div className="mt-5 text-sm font-semibold">
        {title}
      </div>

      <div className="mt-1 text-xs text-white/25">
        {description}
      </div>
    </div>
  );
}

