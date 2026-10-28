"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Languages,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ApiClientError } from "@/lib/api/api-error";
import { useLogin } from "@/hooks/auth/useLogin";
import Threads from "@/components/Threads";
import { useThemeColor } from "@/hooks/useThemeColor";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* What this product actually does, for the mayor persona                     */
/* -------------------------------------------------------------------------- */

const HIGHLIGHTS = [
  {
    icon: BarChart3,
    text: "Live sentiment across every comment on your official page",
  },
  {
    icon: MessageSquareText,
    text: "Automatic triage — urgent complaints surfaced first",
  },
  {
    icon: Languages,
    text: "Reads Amharic, Afaan Oromo, and English natively",
  },
];

/* Shared input styling, themed */
const INPUT_CLASS =
  "h-12 rounded-xl border-input bg-card pl-10 shadow-sm placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive/60";

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const threadsColor = useThemeColor("--primary", "#3FA88D");

  const login = useLogin();
  const isLoading = login.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const normalizedEmail = email.trim();
    const hasEmailError = !normalizedEmail
      ? "Enter your email address."
      : !EMAIL_PATTERN.test(normalizedEmail)
        ? "Enter a valid email address."
        : null;
    const hasPasswordError = !password ? "Enter your password." : null;

    setEmailError(hasEmailError);
    setPasswordError(hasPasswordError);

    if (hasEmailError || hasPasswordError) return;

    try {
      await login.mutateAsync({
        email: normalizedEmail,
        password,
      });
    } catch (error) {
      const apiError = error as ApiClientError;

      /*
       * useLogin already handles the global toast notification.
       *
       * This local message provides an accessible inline fallback
       * without exposing backend implementation details.
       */
      switch (apiError.code) {
        case "INVALID_CREDENTIALS":
          setSubmitError("The email address or password is incorrect.");
          break;

        case "ACCOUNT_LOCKED":
          setSubmitError(
            apiError.message ||
              "Your account is temporarily locked. Please try again later.",
          );
          break;

        case "FORBIDDEN":
        case "INSUFFICIENT_PERMISSION":
          setSubmitError(
            "Your account does not have permission to access this application.",
          );
          break;

        case "RATE_LIMIT_EXCEEDED":
          setSubmitError(
            "Too many sign-in attempts. Please wait a moment and try again.",
          );
          break;

        case "NETWORK_ERROR":
          setSubmitError(
            "Unable to connect to the server. Please check your connection and try again.",
          );
          break;

        case "REQUEST_TIMEOUT":
          setSubmitError("The request took too long. Please try again.");
          break;

        default:
          setSubmitError("Unable to sign in right now. Please try again.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================================================
            LEFT SIDE — BRAND
        ========================================================= */}
        <section className="relative hidden overflow-hidden bg-foreground text-background lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <Threads
              color={threadsColor}
              lineCount={90}
              thickness={0.6}
              softness={1.3}
              amplitude={1.7}
              distance={0.4}
              waves={1.05}
              speed={0.6}
              split={0.04}
              fray={0.5}
              angle={25}
              taper={0.85}
              brightness={1.1}
              parting={0}
              enableMouseInteraction
              fade={0}
              opacity={0.45}
              seed={0}
            />
          </div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-3xl"
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col px-12 py-10 xl:px-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-background/10 bg-background/[0.06]">
                <Waves className="h-5 w-5 text-background" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-background">
                  CivicPulse
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-background/40">
                  Mayors Office Console
                </p>
              </div>
            </div>

            {/* Center message */}
            <div className="flex flex-1 items-center">
              <div className="w-full max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                >
                  <div className="mb-6 inline-flex items-center gap-2 text-xs tracking-[0.02em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sentiment &amp; Facebook automation</span>
                  </div>

                  <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-background xl:text-6xl">
                    Know what your
                    <br />
                    <span className="text-background/40">
                      city is telling you.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-lg text-base leading-7 text-background/50">
                    CivicPulse reads every comment on your official Facebook
                    page, scores it, and routes what needs your attention — so
                    nothing urgent gets lost in the feed.
                  </p>
                </motion.div>

                {/* Feature highlights */}

                <motion.ul
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                  className="mt-10 space-y-4"
                >
                  {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-3.5 text-sm text-background/70"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-background/10 bg-background/[0.05] text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      {text}
                    </li>
                  ))}
                </motion.ul>

                <div className="mt-10 flex items-center gap-2 text-xs text-background/35">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Live analysis running now
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-background/[0.08] pt-5 text-xs text-background/40">
              <span>Built for better-informed public service.</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Secure platform</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT SIDE — LOGIN
        ========================================================= */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 lg:hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-[400px]">
            {/* Mobile brand mark */}

            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
                <Waves className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                CivicPulse
              </span>
            </div>

            {/* Login header */}
            <div className="mb-9 flex flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-foreground/10 bg-card shadow-sm">
                <LockKeyhole className="h-[18px] w-[18px] text-foreground" />
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.045em] text-foreground">
                Welcome back.
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to your CivicPulse console.
              </p>
            </div>

            {/* =====================================================
                LOGIN FORM
            ===================================================== */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Form-level error */}
              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-5 text-destructive"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground/85"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError(null);
                      setSubmitError(null);
                    }}
                    placeholder="you@example.gov"
                    disabled={isLoading}
                    required
                    aria-invalid={Boolean(emailError)}
                    className={INPUT_CLASS}
                  />
                </div>

                {emailError && (
                  <p role="alert" className="text-xs text-destructive">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground/85"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError(null);
                      setSubmitError(null);
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                    aria-invalid={Boolean(passwordError)}
                    className={`${INPUT_CLASS} pr-11`}
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <p role="alert" className="text-xs text-destructive">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-foreground text-sm font-medium text-background shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background"
                        aria-hidden="true"
                      />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* =====================================================
                SECURITY
            ===================================================== */}
            <div className="mt-8 flex items-start gap-3 border-t border-foreground/10 pt-6">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Secure access
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Your session is protected by secure server-side
                  authentication. No access token is stored in your browser
                  application state.
                </p>
              </div>
            </div>

            
            {/* Footer */}
            <footer className="mt-10 border-t border-foreground/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>© {new Date().getFullYear()} CivicPulse</span>

                <nav
                  aria-label="Legal and privacy links"
                  className="flex flex-wrap items-center gap-x-4 gap-y-2"
                >
                  <Link
                    href="/privacy-policy"
                    className="transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>

                  <Link
                    href="/data-deletion"
                    className="transition-colors hover:text-foreground"
                  >
                    Data Deletion
                  </Link>

                  <Link
                    href="/terms"
                    className="transition-colors hover:text-foreground"
                  >
                    Terms
                  </Link>
                </nav>
              </div>
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}