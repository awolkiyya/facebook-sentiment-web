"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ApiClientError } from "@/lib/api/api-error";
import { useLogin } from "@/hooks/auth/useLogin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Shared input styling, themed */
const INPUT_CLASS =
  "h-12 rounded-xl border-input bg-background pl-10 text-[15px] shadow-sm placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive/60";

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
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background px-5 text-foreground antialiased">
      {/* Background: faint grid and a soft blue glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_35%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[110px]"
      />

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-6">
        <Link
          href="/"
          aria-label="CivicPulse home"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/icons/icon.png"
            alt="CivicPulse logo"
            width={34}
            height={34}
            priority
            className="h-[34px] w-[34px] object-contain"
          />
          <span className="text-[17px] font-semibold tracking-tight">
            CivicPulse
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Back to home
        </Link>
      </header>

      {/* Sign-in card */}
      <div className="flex flex-1 items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-foreground/[0.06] sm:p-8">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-semibold tracking-[-0.03em]">
                Sign in to CivicPulse
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Welcome back. Enter your details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Form-level error */}
              <AnimatePresence initial={false}>
                {submitError && (
                  <motion.div
                    key="submit-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground/90"
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
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={INPUT_CLASS}
                  />
                </div>

                {emailError && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground/90"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
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
                    aria-describedby={
                      passwordError ? "password-error" : undefined
                    }
                    className={`${INPUT_CLASS} pr-11`}
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="group h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                      aria-hidden="true"
                    />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            Protected by secure server-side authentication.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 py-6 text-xs text-muted-foreground">
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
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </nav>
      </footer>
    </main>
  );
}