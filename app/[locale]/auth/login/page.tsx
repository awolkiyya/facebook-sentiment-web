"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Brain,
  Eye,
  EyeOff,
  Globe2,
  Languages,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ApiClientError } from "@/lib/api/api-error";
import { useLogin } from "@/hooks/auth/useLogin";
import Threads from "@/components/Threads";
import { useThemeColor } from "@/hooks/useThemeColor";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================================================
   CONTENT
========================================================= */

const HIGHLIGHTS: { icon: LucideIcon; text: string }[] = [
  { icon: Languages, text: "Amharic, Afaan Oromo and English" },
  { icon: MessageSquareText, text: "Urgent complaints surfaced first" },
  { icon: ShieldCheck, text: "Secure, server-side sessions" },
];

type Sentiment = "positive" | "neutral" | "negative";

const SENTIMENT_CHIP: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: "Positive", cls: "bg-primary/15 text-primary" },
  neutral: { label: "Neutral", cls: "bg-muted text-muted-foreground" },
  negative: { label: "Negative", cls: "bg-destructive/15 text-destructive" },
};

const SAMPLES: {
  text: string;
  translation: string | null;
  lang: string;
  sentiment: Sentiment;
  topic: string;
  priority: "High" | "Medium" | "Low";
}[] = [
  {
    text: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
    translation: "Our area has had no running water for two weeks.",
    lang: "Afaan Oromo",
    sentiment: "negative",
    topic: "Water supply",
    priority: "High",
  },
  {
    text: "የመንገዱ ስራ በጣም ጥሩ ነው፣ አመሰግናለሁ።",
    translation: "The road work is very good, thank you.",
    lang: "Amharic",
    sentiment: "positive",
    topic: "Roads and construction",
    priority: "Low",
  },
  {
    text: "When will the new health center open to the public?",
    translation: null,
    lang: "English",
    sentiment: "neutral",
    topic: "Health services",
    priority: "Medium",
  },
];

const TREND = [38, 42, 41, 47, 45, 52, 58];

/* Shared input styling, themed */
const INPUT_CLASS =
  "h-12 rounded-xl border-input bg-card pl-10 text-[15px] shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive/60 aria-[invalid=true]:ring-destructive/10";

/* =========================================================
   BRAND
========================================================= */

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Link
      href="/"
      aria-label="CivicPulse home"
      className="flex items-center gap-2.5"
    >
      <Image
        src="/icons/icon.png"
        alt="CivicPulse logo"
        width={size}
        height={size}
        priority
        style={{ width: size, height: size }}
        className="object-contain"
      />
      <span className="leading-none">
        <span className="block text-[16px] font-semibold tracking-tight">
          CivicPulse
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">
          Mayor&apos;s office console
        </span>
      </span>
    </Link>
  );
}

/* =========================================================
   LEFT PANEL: PRODUCT SHOWCASE
========================================================= */

function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
}

/** A comment is "read" by the AI: language, sentiment, topic and priority appear in turn. */
function AnalysisCard() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const sample = SAMPLES[index];

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setIndex((v) => (v + 1) % SAMPLES.length),
      5400,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const sentiment = SENTIMENT_CHIP[sample.sentiment];
  const priorityCls =
    sample.priority === "High"
      ? "bg-destructive/15 text-destructive"
      : sample.priority === "Medium"
        ? "bg-chart-2/20 text-chart-2"
        : "bg-muted text-muted-foreground";

  const chips: { icon: LucideIcon; label: string; cls: string }[] = [
    { icon: Globe2, label: sample.lang, cls: "bg-muted text-foreground" },
    { icon: Brain, label: sentiment.label, cls: sentiment.cls },
    { icon: Tag, label: sample.topic, cls: "bg-muted text-foreground" },
    { icon: Bell, label: `${sample.priority} priority`, cls: priorityCls },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Brain className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-medium">AI analysis</span>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {SAMPLES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scan bar */}
      <div className="h-px w-full bg-border">
        <motion.div
          key={`scan-${index}`}
          initial={{ width: reduce ? "100%" : "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-px bg-primary"
        />
      </div>

      <div className="min-h-[214px] p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs text-muted-foreground">Incoming comment</p>
            <p className="mt-2 text-[17px] font-medium leading-7">
              {sample.text}
            </p>

            {sample.translation && (
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <Languages className="mt-1 h-3.5 w-3.5 shrink-0" />
                {sample.translation}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <motion.span
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.55 + i * 0.3,
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${chip.cls}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MiniTrend() {
  const W = 220;
  const H = 64;
  const min = Math.min(...TREND);
  const max = Math.max(...TREND);
  const pts = TREND.map(
    (v, i) =>
      [
        (i / (TREND.length - 1)) * W,
        H - 6 - ((v - min) / (max - min)) * (H - 14),
      ] as [number, number],
  );
  const line = smoothPath(pts);

  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-md">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Positive sentiment, 7 days</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          58%
        </p>
        <p className="mt-1 text-xs text-primary">+6 points this week</p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Illustrative trend: positive sentiment rising over seven days"
        className="h-16 w-44 overflow-visible"
      >
        <defs>
          <linearGradient id="login-trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`${line} L${W} ${H} L0 ${H} Z`}
          fill="url(#login-trend)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.3, ease: "easeInOut" }}
        />
        <motion.circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="4"
          fill="var(--primary)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: "spring", stiffness: 400 }}
        />
      </svg>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const threadsColor = useThemeColor("--primary", "#0066FF");

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
    <main className="min-h-screen bg-background text-foreground antialiased">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================================================
            LEFT SIDE: PRODUCT SHOWCASE
            The "dark" class remaps theme tokens so this panel is
            always dark, in both light and dark mode.
        ========================================================= */}
        <section className="dark relative hidden overflow-hidden bg-background text-foreground lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
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
              opacity={0.4}
              seed={0}
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-70 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_30%_40%,black,transparent)]"
          />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-1/3 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[110px]"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col px-12 py-10 xl:px-16">
            <BrandMark size={38} />

            <div className="flex flex-1 items-center py-10">
              <div className="w-full max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.05em] xl:text-[56px]">
                    Know what your city is telling you.
                  </h1>
                  <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                    CivicPulse reads every comment on your official Facebook
                    page, scores it, and flags what needs your attention.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                  className="mt-10 space-y-3"
                >
                  <AnalysisCard />
                  <MiniTrend />
                  <p className="px-1 text-xs text-muted-foreground">
                    Example comments and illustrative data.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5 text-xs text-muted-foreground">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT SIDE: LOGIN
        ========================================================= */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-background px-5 py-6 sm:px-8 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_5%,transparent)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_30%,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[90px]"
          />

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="lg:hidden">
              <BrandMark size={34} />
            </div>
            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[400px]"
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-[-0.04em]">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in to your CivicPulse console.
                </p>
              </div>

              {/* =====================================================
                  LOGIN FORM
              ===================================================== */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                      onKeyUp={(event) =>
                        setCapsLock(event.getModifierState("CapsLock"))
                      }
                      onKeyDown={(event) =>
                        setCapsLock(event.getModifierState("CapsLock"))
                      }
                      onBlur={() => setCapsLock(false)}
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

                  <AnimatePresence initial={false}>
                    {capsLock && (
                      <motion.p
                        key="caps"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <TriangleAlert className="h-3.5 w-3.5" />
                        Caps Lock is on.
                      </motion.p>
                    )}
                  </AnimatePresence>

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
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                          className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
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
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-card/70 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">Secure access</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your session is protected by secure server-side
                    authentication. No access token is stored in your browser
                    application state.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 border-t border-border pt-5">
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
        </section>
      </div>
    </main>
  );
}