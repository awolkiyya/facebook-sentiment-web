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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* Brand palette                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Matches the marketing hero: cream background, near-navy text, one teal
 * accent used sparingly (focus states, the CTA, the live indicator). Kept as
 * literal hex here rather than Tailwind slate/blue tokens, same reasoning as
 * the hero — this is a distinct palette from the rest of the app shell.
 */
const NAVY = "#232B36";
const TEAL = "#3FA88D";
const CREAM = "#F5F3EE";

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
              "Your account is temporarily locked. Please try again later."
          );
          break;

        case "FORBIDDEN":
        case "INSUFFICIENT_PERMISSION":
          setSubmitError(
            "Your account does not have permission to access this application."
          );
          break;

        case "RATE_LIMIT_EXCEEDED":
          setSubmitError("Too many sign-in attempts. Please wait a moment and try again.");
          break;

        case "NETWORK_ERROR":
          setSubmitError(
            "Unable to connect to the server. Please check your connection and try again."
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
    <main
      className="min-h-screen text-[#232B36]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================================================
            LEFT SIDE — BRAND
        ========================================================= */}
        <section
          className="relative hidden overflow-hidden lg:flex"
          style={{ backgroundColor: NAVY }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: `${TEAL}14` }}
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col px-12 py-10 xl:px-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Waves className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                  CivicPulse
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-white/40">
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
                  <div
                    className="mb-6 inline-flex items-center gap-2 text-xs tracking-[0.02em]"
                    style={{ color: TEAL }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sentiment &amp; Facebook automation</span>
                  </div>

                  <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white xl:text-6xl">
                    Know what your
                    <br />
                    <span className="text-white/40">city is telling you.</span>
                  </h1>

                  <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
                    CivicPulse reads every comment on your official Facebook
                    page, scores it, and routes what needs your attention —
                    so nothing urgent gets lost in the feed.
                  </p>
                </motion.div>

                {/* Feature highlights — concrete, not decorative */}

                <motion.ul
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                  className="mt-10 space-y-4"
                >
                  {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-3.5 text-sm text-white/70"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]"
                        style={{ color: TEAL }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {text}
                    </li>
                  ))}
                </motion.ul>

                <div className="mt-10 flex items-center gap-2 text-xs text-white/35">
                  <span
                    className="relative flex h-2 w-2"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ backgroundColor: TEAL }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: TEAL }}
                    />
                  </span>
                  Live analysis running now
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.08] pt-5 text-xs text-white/40">
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
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-14"
          style={{ backgroundColor: CREAM }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 lg:hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(35,43,54,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(35,43,54,0.05) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-[400px]">
            {/* Mobile brand mark (hidden on desktop, where the left
                panel already carries the identity) */}

            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: NAVY }}
              >
                <Waves className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                CivicPulse
              </span>
            </div>

            {/* Login header */}
            <div className="mb-9 flex flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#232B36]/10 bg-white shadow-sm">
                <LockKeyhole
                  className="h-4.5 w-4.5"
                  style={{ color: NAVY }}
                />
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#232B36]">
                Welcome back.
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#232B36]/55">
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
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#232B36]/85"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#232B36]/35"
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
                    className="h-12 rounded-xl border-[#232B36]/15 bg-white pl-10 shadow-sm placeholder:text-[#232B36]/35 focus:border-[#3FA88D] focus:ring-[#3FA88D]/25 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-300"
                  />
                </div>

                {emailError && (
                  <p role="alert" className="text-xs text-red-600">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#232B36]/85"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#232B36]/50 transition-colors hover:text-[#3FA88D]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#232B36]/35"
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
                    className="h-12 rounded-xl border-[#232B36]/15 bg-white pl-10 pr-11 shadow-sm placeholder:text-[#232B36]/35 focus:border-[#3FA88D] focus:ring-[#3FA88D]/25 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-300"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#232B36]/35 transition-colors hover:text-[#232B36] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passwordError && (
                  <p role="alert" className="text-xs text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative h-12 w-full overflow-hidden rounded-xl text-sm font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ backgroundColor: NAVY }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
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
            <div className="mt-8 flex items-start gap-3 border-t border-[#232B36]/10 pt-6">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: TEAL }}
              />
              <div>
                <p className="text-xs font-medium text-[#232B36]/80">
                  Secure access
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#232B36]/50">
                  Your session is protected by secure server-side authentication.
                  No access token is stored in your browser application state.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex items-center justify-between text-xs text-[#232B36]/40">
              <span>© {new Date().getFullYear()} CivicPulse</span>
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-[#232B36]"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[#232B36]"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}