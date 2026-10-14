"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Frown,
  Globe2,
  LogIn,
  MessageSquare,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Tag,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf9] text-slate-950">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-3 shadow-sm backdrop-blur-xl sm:px-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Waves className="h-4 w-4" />
              </div>

              <div className="leading-none">
                <div className="font-semibold tracking-tight">
                  CivicPulse
                </div>

                <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Public Voice Intelligence
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-7 md:flex">
              <a
                href="#product"
                className="text-sm text-slate-500 transition hover:text-slate-950"
              >
                Product
              </a>

              <a
                href="#how"
                className="text-sm text-slate-500 transition hover:text-slate-950"
              >
                How it works
              </a>

              <a
                href="#trust"
                className="text-sm text-slate-500 transition hover:text-slate-950"
              >
                Privacy
              </a>
            </nav>

            {/* CTA */}
            <Link href="/auth/login">
              <Button
                size="sm"
                className="group rounded-xl bg-slate-950 px-4 hover:bg-slate-800"
              >
                Sign in

                <LogIn className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <CivicPulseHero />

      {/* =====================================================
          HOW IT READS A COMMENT
      ===================================================== */}

      <AnalysisPipeline />

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Built for public service
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Designed to help government teams understand citizen feedback
              and public concerns.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <TrustPill
              icon={<ShieldCheck />}
              text="Privacy-first"
            />

            <TrustPill
              icon={<Globe2 />}
              text="3 languages"
            />

            <TrustPill
              icon={<Brain />}
              text="AI analysis"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section
        id="product"
        className="px-5 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 px-3 py-1"
            >
              Public feedback intelligence
            </Badge>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Understand thousands of conversations at a glance.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-500">
              CivicPulse transforms large volumes of public comments into
              clear, structured insights your team can understand and act on.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<BarChart3 />}
              title="Sentiment Analysis"
              description="Measure how public reactions are trending across positive, neutral, and negative feedback."
            />

            <FeatureCard
              icon={<MessageSquareText />}
              title="Citizen Concerns"
              description="Identify the issues people discuss most and understand which topics are receiving the most attention."
            />

            <FeatureCard
              icon={<TrendingUp />}
              title="Emerging Trends"
              description="Monitor changes in public sentiment and recurring concerns over time."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how"
        className="border-y border-slate-200/70 bg-slate-50 px-5 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl">
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white"
            >
              Simple workflow
            </Badge>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              From public conversations to useful insight.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-500">
              Connect your official page, let AI analyze public conversations,
              and explore the results through a clear dashboard.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <ProcessCard
              number="01"
              icon={<MessageSquare />}
              title="Connect"
              text="Securely connect your official Facebook Page."
            />

            <ProcessCard
              number="02"
              icon={<Brain />}
              title="Analyze"
              text="AI analyzes public comments to identify sentiment, topics, and recurring concerns."
            />

            <ProcessCard
              number="03"
              icon={<BarChart3 />}
              title="Understand"
              text="Explore sentiment, concerns, trends, and public response in one place."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST / PRIVACY
      ===================================================== */}

      <section
        id="trust"
        className="px-5 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-14 lg:grid-cols-2">
            {/* Text */}

            <div>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200"
              >
                Responsible by design
              </Badge>

              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Built for responsible public feedback analysis.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
                CivicPulse is designed to help public-service teams understand
                aggregate citizen feedback, identify common concerns, and make
                better-informed decisions.
              </p>
            </div>

            {/* Privacy cards */}

            <div className="space-y-3">
              <PrivacyCard
                icon={<ShieldCheck />}
                title="Public conversations"
                text="Designed around publicly available posts and comments from connected official pages."
              />

              <PrivacyCard
                icon={<Users />}
                title="Aggregate insights"
                text="Focus on trends, topics, and overall sentiment rather than individual political profiles."
              />

              <PrivacyCard
                icon={<MessageSquareText />}
                title="Read, don't speak"
                text="CivicPulse analyzes public feedback. It does not publish posts or respond to citizens on your behalf."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="px-5 pb-20 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="group relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-slate-950 text-white"
        >
          {/* =====================================================
              ANIMATED GRID BACKGROUND
          ====================================================== */}

          <motion.div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "48px 48px"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* =====================================================
              MOVING LIGHT
          ====================================================== */}

          <motion.div
            className="pointer-events-none absolute -left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl"
            animate={{
              x: ["0%", "180%", "0%"],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="relative grid items-center lg:grid-cols-[1fr_auto]">
            {/* Text */}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              className="px-8 py-14 sm:px-12 lg:px-16 lg:py-20"
            >
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Waves className="h-4 w-4" />

                <span>Public voice intelligence</span>
              </div>

              <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
                Listen to the public.
                <br />

                <span className="text-slate-400">
                  Understand the issues.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                Turn public conversations into clear intelligence
                for better-informed public service.
              </p>
            </motion.div>

            {/* =====================================================
                BUTTON
            ====================================================== */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.15,
              }}
              className="px-8 pb-10 sm:px-12 sm:pb-14 lg:px-16 lg:pb-0"
            >
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden rounded-2xl bg-white px-7 text-slate-950 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-2xl"
              >
                {/* Button shine */}

                <motion.span
                  className="absolute inset-y-0 -left-12 w-8 rotate-12 bg-slate-300/60 blur-sm"
                  animate={{
                    x: ["0%", "650%"],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />

                <span className="relative flex items-center gap-2">
                  Connect your Facebook Page

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>
          </div>

          {/* =====================================================
              GRID HIGHLIGHT
          ====================================================== */}

          <motion.div
            className="pointer-events-none absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 bg-white/20 blur-sm"
            animate={{
              width: ["20%", "45%", "20%"],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Waves className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                CivicPulse
              </p>

              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Public Voice Intelligence
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Public-sector intelligence for better understanding.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   HERO (SnapWre-style: cream bg, italic accent, dotted wave,
   terminal-style live card, cookie consent)

   This replaces the earlier cursor-reactive hero entirely — the
   two visual languages (blurred blobs + cursor dot vs. cream +
   terminal) don't mix, so this hero owns its own background and
   its own accent color (#3FA88D) rather than reusing the slate/
   blue palette used in the rest of the page below it.
========================================================= */

function CivicPulseHero() {
  return (
    <section className="relative overflow-hidden bg-[#F5F3EE] px-6 pb-24 pt-40 lg:px-16 lg:pt-48">
      <DottedWave />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------------------------------------------------------- */}
        {/* Copy                                                        */}
        {/* ---------------------------------------------------------- */}

        <div>
          <h1 className="text-[52px] font-semibold leading-[1.05] tracking-tight text-[#232B36] sm:text-[64px] lg:text-[72px]">
            We Listen to{" "}
            <span className="font-serif italic text-[#3FA88D]">
              What
            </span>
            <br />
            Citizens Are Saying.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-7 text-[#232B36]/60">
            CivicPulse is a specialized intelligence layer for
            public-sector teams — turning Facebook comments into
            sentiment, topics, and trends across Amharic, Afaan
            Oromo, and English.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#connect"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#232B36] px-6 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-[#1A2028]"
            >
              CONNECT YOUR PAGE
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            <a
              href="#sample"
              className="inline-flex items-center gap-2 rounded-lg border border-[#232B36]/20 px-6 py-3.5 text-sm font-medium tracking-wide text-[#232B36] transition hover:bg-[#232B36]/5"
            >
              VIEW SAMPLE INSIGHTS
            </a>
          </div>

          {/* Languages */}

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[#232B36]/45">
            <LanguageCheck text="Amharic" />
            <LanguageCheck text="Afaan Oromo" />
            <LanguageCheck text="English" />
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Live preview                                                */}
        {/* ---------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <HeroInsightCard />
        </motion.div>
      </div>

      <CookieConsent />
    </section>
  );
}

/* =========================================================
   ANALYSIS PIPELINE

   One real comment, shown moving through the four things
   CivicPulse actually does to it — language, sentiment, topic,
   priority — revealed in sequence as the section scrolls into
   view. This exists because a rotating feed shows *that* the
   product works; this section explains *how*, which is what
   builds trust with someone deciding whether to connect their
   page.
========================================================= */

const PIPELINE_COMMENT = {
  original: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
  translation: "Our area has had no running water for two weeks.",
};

const PIPELINE_STAGES = [
  {
    key: "language",
    icon: Globe2,
    label: "Language detected",
    value: "Afaan Oromo",
    detail: "Confidence 98%",
  },
  {
    key: "sentiment",
    icon: Frown,
    label: "Sentiment scored",
    value: "Negative",
    detail: "Score −0.74",
    tone: "negative" as const,
  },
  {
    key: "topic",
    icon: Tag,
    label: "Topic matched",
    value: "Water supply",
    detail: "1 of 6 tracked topics",
  },
  {
    key: "priority",
    icon: TriangleAlert,
    label: "Priority assigned",
    value: "High",
    detail: "Routed to Water & Sanitation",
    tone: "negative" as const,
  },
];

function AnalysisPipeline() {
  return (
    <section className="bg-[#F5F3EE] px-5 py-24 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#232B36]/12 bg-white px-3 py-1.5 text-xs font-medium tracking-wide text-[#232B36]/60">
            <Sparkles className="h-3.5 w-3.5 text-[#3FA88D]" />
            How CivicPulse reads a comment
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#232B36] sm:text-4xl">
            From one comment to a routed decision.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#232B36]/55">
            Every comment goes through the same four checks, in
            seconds, before it ever reaches a person on your team.
          </p>
        </motion.div>

        {/* Source comment */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mt-12 max-w-xl rounded-2xl bg-[#1B2129] p-5 font-mono shadow-xl shadow-black/10"
        >
          <p className="text-[10px] tracking-wide text-white/35">
            INCOMING COMMENT · FACEBOOK
          </p>

          <p className="mt-2 text-sm leading-6 text-white/85">
            {PIPELINE_COMMENT.original}
          </p>

          <p className="mt-1.5 text-xs leading-5 text-white/40">
            “{PIPELINE_COMMENT.translation}”
          </p>
        </motion.div>

        {/* Connecting line down to the stages, purely visual */}

        <div className="mx-auto mt-6 h-8 w-px bg-gradient-to-b from-[#232B36]/20 to-transparent lg:hidden" />

        {/* Pipeline stages */}

        <div className="relative mt-6 grid gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-0">
          {/* Connecting line across desktop */}

          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-9 hidden h-px bg-[#232B36]/12 lg:block"
          />

          {PIPELINE_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const negative = stage.tone === "negative";

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.18,
                  ease: "easeOut",
                }}
                className="relative flex flex-col items-center px-3 text-center"
              >
                {/* Stage marker on the connecting line */}

                <span
                  className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border-2 bg-[#F5F3EE] ${
                    negative
                      ? "border-[#ED6A5E]/40 text-[#ED6A5E]"
                      : "border-[#3FA88D]/40 text-[#3FA88D]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-[#232B36]/40">
                  {stage.label}
                </p>

                <p className="mt-1.5 text-lg font-semibold text-[#232B36]">
                  {stage.value}
                </p>

                <p className="mt-1 text-xs text-[#232B36]/45">
                  {stage.detail}
                </p>

                {/* Arrow to next stage, desktop only */}

                {index < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="absolute -right-2 top-2.5 hidden h-4 w-4 text-[#232B36]/20 lg:block"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Result banner */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-[#ED6A5E]/25 bg-[#ED6A5E]/[0.06] px-6 py-5 text-center sm:flex-row sm:text-left"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ED6A5E]/15 text-[#ED6A5E]">
            <TriangleAlert className="h-4 w-4" />
          </span>

          <p className="text-sm leading-6 text-[#232B36]/75">
            <span className="font-semibold text-[#232B36]">
              High priority.
            </span>{" "}
            Sent to the Water &amp; Sanitation team with a 2-hour
            response target — no one has to find this comment
            manually.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Font note                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The italic accent word above uses `font-serif italic`, which falls back to
 * the browser's default serif. For the closer match seen in the reference,
 * add this once to your root layout's <head> (Next.js: app/layout.tsx):
 *
 *   <link
 *     rel="stylesheet"
 *     href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap"
 *   />
 *
 * and register it in tailwind.config as:
 *   fontFamily: { serif: ['"Instrument Serif"', 'serif'] }
 */

/* -------------------------------------------------------------------------- */
/* Dotted wave graphic                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A field of dots arranged into radiating arcs, thinning toward the edges.
 * This is what visually connects the headline (left) to the live terminal
 * card (right) — it reads as signal radiating outward, fitting a monitoring
 * product better than a generic blurred blob would.
 */
function DottedWave() {
  const arcs = [
    { r: 90, count: 14, opacity: 0.55 },
    { r: 140, count: 20, opacity: 0.4 },
    { r: 190, count: 26, opacity: 0.28 },
    { r: 240, count: 32, opacity: 0.16 },
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="-260 -180 520 360"
      className="absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2"
    >
      {arcs.map((arc, arcIndex) =>
        Array.from({ length: arc.count }).map((_, i) => {
          /* Two arcs meeting at a point on the left, like sound
             radiating from a single source — not a full circle. */
          const angle =
            (-70 + (140 / (arc.count - 1)) * i) * (Math.PI / 180);

          const x = Math.cos(angle) * arc.r;
          const y = Math.sin(angle) * arc.r;

          return (
            <circle
              key={`${arcIndex}-${i}`}
              cx={x}
              cy={y}
              r={1.6}
              className="fill-[#3FA88D]"
              opacity={arc.opacity}
            />
          );
        }),
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero insight card                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A calm, static summary card — one entrance animation on scroll-in and
 * nothing moving after that. This sits next to the hero headline, so its job
 * is to be quickly readable, not to demonstrate liveliness; a card that's
 * constantly shifting competes with the copy for attention instead of
 * supporting it.
 */

const SENTIMENT_SPLIT = [
  { label: "Positive", share: 58, color: "#3FA88D" },
  { label: "Neutral", share: 27, color: "#232B36" },
  { label: "Negative", share: 15, color: "#ED6A5E" },
];

const INSIGHT_TOPICS = [
  { label: "Roads & construction", share: 31 },
  { label: "Water supply", share: 24 },
  { label: "Waste collection", share: 18 },
];

const SAMPLE_COMMENTS = [
  {
    text: "የመንገዱ ስራ በጣም ጥሩ ነው፣ አመሰግናለሁ።",
    language: "AM",
    sentiment: "positive" as const,
  },
  {
    text: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
    language: "OR",
    sentiment: "negative" as const,
    priority: "HIGH" as const,
  },
];

const SENTIMENT_DOT = {
  positive: "bg-[#3FA88D]",
  negative: "bg-[#ED6A5E]",
  neutral: "bg-[#232B36]/30",
} as const;

function HeroInsightCard() {
  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-[#232B36]/8 bg-white p-6 shadow-xl shadow-[#232B36]/[0.06]">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#232B36] text-white">
            <Waves className="h-3.5 w-3.5" />
          </span>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-[#232B36]">
              Adama City — Official Page
            </p>
            <p className="text-xs text-[#232B36]/45">
              Last synced 4 minutes ago
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#3FA88D]/10 px-2.5 py-1 text-[11px] font-medium text-[#3FA88D]">
          Connected
        </span>
      </div>

      {/* Sentiment split */}

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#232B36]/40">
          Sentiment, last 7 days
        </p>

        <div className="mt-3 flex h-2 overflow-hidden rounded-full">
          {SENTIMENT_SPLIT.map((segment) => (
            <span
              key={segment.label}
              style={{
                width: `${segment.share}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {SENTIMENT_SPLIT.map((segment) => (
            <span
              key={segment.label}
              className="flex items-center gap-1.5 text-xs text-[#232B36]/55"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label} {segment.share}%
            </span>
          ))}
        </div>
      </div>

      {/* Top topics */}

      <div className="mt-6 space-y-3 border-t border-[#232B36]/8 pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[#232B36]/40">
          Top topics
        </p>

        {INSIGHT_TOPICS.map((topic) => (
          <div
            key={topic.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm text-[#232B36]/75">
              {topic.label}
            </span>

            <div className="flex flex-1 items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#232B36]/8">
                <div
                  className="h-full rounded-full bg-[#3FA88D]"
                  style={{ width: `${topic.share}%` }}
                />
              </div>

              <span className="w-8 shrink-0 text-right text-xs text-[#232B36]/45">
                {topic.share}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sample comments */}

      <div className="mt-6 space-y-2.5 border-t border-[#232B36]/8 pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[#232B36]/40">
          Recent comments
        </p>

        {SAMPLE_COMMENTS.map((comment) => (
          <div
            key={comment.text}
            className="flex items-start gap-2.5 rounded-lg bg-[#F5F3EE] px-3 py-2.5"
          >
            <span
              aria-hidden="true"
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SENTIMENT_DOT[comment.sentiment]}`}
            />

            <p className="min-w-0 flex-1 truncate text-sm text-[#232B36]/75">
              {comment.text}
            </p>

            <span className="shrink-0 rounded bg-[#232B36]/8 px-1.5 py-0.5 text-[10px] font-medium text-[#232B36]/50">
              {comment.language}
            </span>

            {comment.priority && (
              <span className="shrink-0 rounded bg-[#ED6A5E]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#ED6A5E]">
                {comment.priority}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Cookie consent                                                             */
/* -------------------------------------------------------------------------- */

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  /* Delayed mount so it doesn't fight the hero's own entrance
     animation for attention on first paint. */
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-5 left-5 z-50 w-[min(680px,calc(100vw-2.5rem))] rounded-2xl bg-white p-6 shadow-2xl shadow-black/10"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-4 top-4 rounded p-1 text-[#232B36]/40 hover:text-[#232B36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FA88D]/40"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1 pr-6">
          <p className="text-base font-semibold text-[#232B36]">
            We value your privacy
          </p>

          <p className="mt-1.5 text-sm leading-6 text-[#232B36]/60">
            CivicPulse uses cookies to understand how public-service
            teams use this dashboard and to improve it over time.
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-lg border border-[#232B36]/15 px-4 py-2.5 text-sm font-medium text-[#232B36] transition hover:bg-[#232B36]/5"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-lg bg-[#3FA88D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#358F79]"
          >
            Accept all
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   LANGUAGE CHECK
========================================================= */

function LanguageCheck({
  text,
}: {
  text: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-emerald-600" />

      {text}
    </span>
  );
}

/* =========================================================
   TRUST PILL
========================================================= */

function TrustPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      {text}
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>

        <span
          className={`flex items-center text-[10px] font-semibold ${
            positive
              ? "text-emerald-600"
              : "text-rose-500"
          }`}
        >
          {positive ? (
            <TrendingUp className="mr-0.5 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-0.5 h-3 w-3" />
          )}

          {change}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <Card className="group h-full rounded-2xl border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
          <span className="[&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-5 flex items-center text-xs font-medium text-slate-400 transition group-hover:text-slate-950">
          Learn more

          <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </div>
      </Card>
    </motion.div>
  );
}

/* =========================================================
   PROCESS CARD
========================================================= */

function ProcessCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <Card className="relative h-full rounded-2xl border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest text-slate-400">
            {number}
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <span className="[&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          </div>
        </div>

        <h3 className="mt-7 text-lg font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </Card>
    </motion.div>
  );
}

/* =========================================================
   LANGUAGE ROW
========================================================= */

function LanguageRow({
  language,
  english,
  example,
}: {
  language: string;
  english: string;
  example: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">
            {language}
          </p>

          <p className="text-xs text-slate-400">
            {english}
          </p>
        </div>

        <Check className="h-4 w-4 text-emerald-600" />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {example}
      </p>
    </div>
  );
}

/* =========================================================
   LANGUAGE CHART
========================================================= */

function LanguageChart({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {label}
        </span>

        <span className="text-slate-400">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width,
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-slate-900"
        />
      </div>
    </div>
  );
}

/* =========================================================
   PRIVACY CARD
========================================================= */

function PrivacyCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 p-5">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <span className="[&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </Card>
  );
}