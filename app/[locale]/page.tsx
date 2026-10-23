"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  Frown,
  Globe2,
  LogIn,
  Menu,
  MessageSquare,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Tag,
  TriangleAlert,
  TrendingUp,
  Users,
  Waves,
  X,
  Droplet,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Threads from "@/components/Threads";

/* =========================================================
   THEME
========================================================= */

const COLORS = {
  background: "#F5F3EE",
  foreground: "#232B36",
  primary: "#3FA88D",
  primaryHover: "#328A73",
  negative: "#ED6A5E",
  muted: "#6B7280",
};

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

const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAFAF9] text-[#232B36] antialiased">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative flex h-[62px] items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl sm:px-5">
            <Link
              href="/"
              aria-label="CivicPulse home"
              className="flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232B36] text-white shadow-sm">
                <Waves className="h-[18px] w-[18px]" />
              </span>

              <span className="leading-none">
                <span className="block text-[15px] font-bold tracking-tight">
                  CivicPulse
                </span>

                <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Public voice intelligence
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-8 md:flex"
            >
              <a
                href="#product"
                className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#232B36]"
              >
                Product
              </a>

              <a
                href="#how"
                className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#232B36]"
              >
                How it works
              </a>

              <a
                href="#trust"
                className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#232B36]"
              >
                Responsible AI
              </a>
            </nav>

            {/* Desktop CTA */}

            <div className="hidden md:block">
              <Link href="/auth/login">
                <Button className="group h-10 rounded-xl bg-[#232B36] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#303A47]">
                  Sign in
                  <LogIn className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu toggle */}

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#232B36] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FA88D]/50 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Mobile navigation */}

            {mobileMenuOpen && (
              <motion.nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 md:hidden"
              >
                <a
                  href="#product"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#232B36]"
                >
                  Product
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>

                <a
                  href="#how"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#232B36]"
                >
                  How it works
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>

                <a
                  href="#trust"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#232B36]"
                >
                  Responsible AI
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>

                <div className="my-2 border-t border-slate-100" />

                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#232B36] text-sm font-semibold text-white transition hover:bg-[#303A47]"
                >
                  Sign in
                  <LogIn className="h-4 w-4" />
                </Link>
              </motion.nav>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}

      <CivicPulseHero />

      {/* ANALYSIS PIPELINE */}

      <AnalysisPipeline />

      {/* TRUST STRIP */}

      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3FA88D]">
              Built for public service
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Turn citizen feedback into a clearer understanding of
              public concerns and service priorities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <TrustPill icon={<ShieldCheck />} text="Privacy-conscious" />
            <TrustPill icon={<Globe2 />} text="3 languages" />
            <TrustPill icon={<Brain />} text="AI-powered analysis" />
          </div>
        </div>
      </section>

     
{/* HOW IT WORKS */}

<section
  id="how"
  className="relative scroll-mt-28 overflow-hidden border-y border-slate-200/70 bg-white px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
>
  {/* Subtle background decoration */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#3FA88D]/[0.06] blur-3xl"
  />
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#ED6A5E]/[0.04] blur-3xl"
  />

  <div className="relative mx-auto max-w-6xl">


    <div className="mt-12 sm:mt-16">
      <InteractiveWorkflow />
    </div>
  </div>
</section>



      {/* FOOTER */}

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#232B36] text-white">
              <Waves className="h-4 w-4" />
            </span>

            <span>
              <span className="block text-sm font-bold tracking-tight">
                CivicPulse
              </span>

              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Public voice intelligence
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <a href="#product" className="transition hover:text-slate-700">
              Product
            </a>

            <a href="#how" className="transition hover:text-slate-700">
              How it works
            </a>

            <a href="#trust" className="transition hover:text-slate-700">
              Responsible AI
            </a>
          </div>

          <p className="text-xs leading-5 text-slate-400 md:text-right">
            Public-sector intelligence for better understanding.
          </p>
        </div>
      </footer>
    </main>
  );
}



const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Connect & collect",
    description:
      "Bring authorized Facebook Page posts and available comments into CivicPulse.",
    icon: MessageSquare,
    color: "#3FA88D",
    tags: ["Page posts", "Comments"],
  },
  {
    number: "02",
    title: "AI analyzes feedback",
    description:
      "Identify language, sentiment, and recurring public-service topics.",
    icon: Brain,
    color: "#ED6A5E",
    tags: ["Language", "Sentiment", "Topics"],
  },
  {
    number: "03",
    title: "Discover insights",
    description:
      "Explore feedback patterns to help teams understand community concerns.",
    icon: BarChart3,
    color: "#3FA88D",
    tags: ["Trends", "Service priorities"],
  },
];

function InteractiveWorkflow() {
  return (
    <div className="mx-auto mt-12 max-w-6xl sm:mt-16">

      
      {/* Animated data-flow overview */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-none sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#3FA88D]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-[#ED6A5E]/10 blur-3xl"
        />

        <div className="relative">
          <div className="mb-8 flex flex-col gap-3 text-center sm:mb-10">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#3FA88D]/20 bg-[#3FA88D]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#328A73]">
              <Sparkles className="h-3.5 w-3.5" />
              The CivicPulse AI pipeline
            </span>

            <h3 className="text-2xl font-semibold tracking-tight text-[#232B36] sm:text-3xl">
              From public comments to meaningful insights
            </h3>

            <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500">
              Every stage transforms public feedback into information that
              teams can explore and review.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_52px_1fr_52px_1fr] md:items-center">
            {WORKFLOW_STEPS.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <div key={step.number} className="contents">
                  <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                    }}
                    className="relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/[0.05] sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <motion.span
                        animate={{
                          boxShadow: [
                            `0 0 0 0px ${step.color}00`,
                            `0 0 0 7px ${step.color}18`,
                            `0 0 0 0px ${step.color}00`,
                          ],
                        }}
                        transition={{
                          duration: 2.8,
                          delay: index * 0.6,
                          repeat: Infinity,
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: `${step.color}17`,
                          color: step.color,
                        }}
                      >
                        <StepIcon className="h-5 w-5" />
                      </motion.span>

                      <span className="text-xs font-bold tracking-widest text-slate-400">
                        {step.number}
                      </span>
                    </div>

                    <h4 className="mt-5 text-lg font-semibold tracking-tight text-[#232B36]">
                      {step.title}
                    </h4>

                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>

                    {/* Animated processing visual */}
                    {index === 0 && (
                      <div className="mt-5 space-y-2">
                        {["Page posts", "Available comments"].map(
                          (item, itemIndex) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                delay: 0.35 + itemIndex * 0.15,
                              }}
                              className="flex items-center gap-2.5 rounded-xl bg-[#3FA88D]/[0.07] px-3 py-2.5"
                            >
                              <MessageSquareText className="h-4 w-4 shrink-0 text-[#328A73]" />
                              <span className="text-xs font-medium text-slate-600">
                                {item}
                              </span>
                              <Check className="ml-auto h-3.5 w-3.5 text-[#328A73]" />
                            </motion.div>
                          ),
                        )}
                      </div>
                    )}

                    {index === 1 && (
                      <div className="mt-5 rounded-xl bg-[#232B36] p-4 text-white">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 12,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08]"
                          >
                            <Brain className="h-5 w-5 text-[#80D9BD]" />
                          </motion.div>
                          <div>
                            <p className="text-xs font-semibold">
                              AI processing
                            </p>
                            <p className="mt-1 text-[10px] text-slate-300">
                              Multilingual feedback
                            </p>
                          </div>
                          <motion.span
                            animate={{ opacity: [0.35, 1, 0.35] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="ml-auto h-2 w-2 rounded-full bg-[#80D9BD]"
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {step.tags.map((tag, tagIndex) => (
                            <motion.span
                              key={tag}
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                delay: 0.4 + tagIndex * 0.12,
                              }}
                              className="rounded-lg border border-white/10 bg-white/[0.07] px-2 py-1.5 text-[10px] text-slate-200"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="mt-5 rounded-xl bg-[#3FA88D]/[0.06] p-4">
                        <p className="text-xs font-semibold text-[#232B36]">
                          Insight categories
                        </p>

                        {[
                          { label: "Sentiment patterns", width: "82%" },
                          { label: "Recurring topics", width: "64%" },
                        ].map((item, itemIndex) => (
                          <div key={item.label} className="mt-3">
                            <p className="mb-1.5 text-[10px] text-slate-500">
                              {item.label}
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: item.width }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 0.9,
                                  delay: 0.5 + itemIndex * 0.15,
                                  ease: "easeOut",
                                }}
                                className="h-full rounded-full bg-[#3FA88D]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.article>

                  {/* Flow connector between stages */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="relative mx-auto flex h-9 w-full items-center justify-center md:h-12"
                    >
                      <div className="absolute inset-x-0 top-1/2 hidden h-px bg-slate-200 md:block" />

                      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200 md:hidden" />

                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <ArrowRight className="h-4 w-4 text-slate-500 md:block" />
                        <span className="absolute inset-0 hidden overflow-hidden rounded-full md:block">
                          <motion.span
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              delay: index * 0.5,
                              ease: "linear",
                            }}
                            className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#3FA88D]/30 to-transparent"
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#3FA88D]/20 bg-[#3FA88D]/[0.06] px-4 py-2.5 text-xs font-medium text-[#328A73]">
              <Globe2 className="h-4 w-4" />
              <span>Amharic</span>
              <span className="text-slate-300">·</span>
              <span>Afaan Oromo</span>
              <span className="text-slate-300">·</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        AI-assisted analysis supports human judgment; it does not replace it.
      </p>
    </div>
  );
}


/* =========================================================
   HERO
========================================================= */

function CivicPulseHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F5F3EE] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-40 lg:px-10 lg:pb-28 lg:pt-44">
      {/* Animated background */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <Threads
          color="#3FA88D"
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

      {/* Readability overlay */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#F5F3EE]/10 via-[#F5F3EE]/15 to-[#F5F3EE]/75"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Hero copy */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#232B36]/10 bg-white/75 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#232B36]/70 shadow-sm shadow-slate-900/[0.02] backdrop-blur-sm sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FA88D]/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3FA88D]" />
              </span>
              PUBLIC FEEDBACK INTELLIGENCE
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-7 max-w-3xl text-[43px] font-semibold leading-[1.06] tracking-[-0.055em] text-[#232B36] sm:text-6xl lg:text-[68px] xl:text-[74px]"
          >
            We listen to{" "}
            <span className="font-serif font-normal italic text-[#3FA88D]">
              what
            </span>
            <br className="hidden sm:block" /> citizens are saying.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-sm leading-7 text-[#232B36]/65 sm:mt-7 sm:text-base sm:leading-8 lg:text-[17px]"
          >
            Understand public feedback at scale. CivicPulse turns
            available Facebook comments into sentiment, topic, and
            trend insights across Amharic, Afaan Oromo, and English.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center"
          >
            <Link href="/auth/login">
              <Button className="group h-12 w-full rounded-xl bg-[#232B36] px-5 text-sm font-semibold text-white shadow-lg shadow-[#232B36]/10 transition-all hover:-translate-y-0.5 hover:bg-[#303A47] sm:w-auto sm:px-6">
                Connect your page
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <a
              href="#product"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#232B36]/15 bg-white/55 px-5 text-sm font-semibold text-[#232B36]/80 transition-colors hover:border-[#232B36]/25 hover:bg-white/90 sm:px-6"
            >
              Explore the platform
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Supported languages */}

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#232B36]/10 pt-5 text-xs text-[#232B36]/55 sm:mt-10"
          >
            <span className="font-medium text-[#232B36]/40">
              MULTILINGUAL ANALYSIS
            </span>

            <LanguageCheck text="Amharic" />
            <LanguageCheck text="Afaan Oromo" />
            <LanguageCheck text="English" />
          </motion.div>
        </motion.div>

        {/* =====================================================
            REALISTIC MOBILE PHONE PREVIEW
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2,
          }}
          className="relative mx-auto w-full max-w-[390px] lg:ml-auto lg:mr-0"
        >
          {/* Ambient glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[#3FA88D]/15 blur-[65px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 left-1/2 -z-10 h-20 w-[72%] -translate-x-1/2 rounded-full bg-[#232B36]/20 blur-2xl"
          />

          {/* Phone side buttons */}

          <div
            aria-hidden="true"
            className="absolute -left-[3px] top-[122px] z-20 h-12 w-[4px] rounded-l-full bg-[#68717C] shadow-inner"
          />

          <div
            aria-hidden="true"
            className="absolute -left-[3px] top-[184px] z-20 h-9 w-[4px] rounded-l-full bg-[#68717C] shadow-inner"
          />

          <div
            aria-hidden="true"
            className="absolute -right-[3px] top-[150px] z-20 h-[58px] w-[4px] rounded-r-full bg-[#68717C] shadow-inner"
          />

          {/* Phone chassis */}

          <div className="relative rounded-[3.35rem] border-[3px] border-[#747C86] bg-gradient-to-br from-[#424A55] via-[#171C24] to-[#353D48] p-[7px] shadow-[0_35px_90px_-28px_rgba(35,43,54,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)]">
            {/* Inner metallic edge */}

            <div className="rounded-[2.85rem] border border-black/70 bg-[#080B10] p-[5px]">
              {/* Phone screen */}

              <div className="relative overflow-hidden rounded-[2.55rem] bg-[#F8F8F5]">
                {/* Status bar */}

                <div className="relative z-20 flex h-[45px] items-center justify-between bg-[#F8F8F5] px-6 pt-1">
                  <span className="text-[11px] font-bold tracking-tight text-[#232B36]">
                    9:41
                  </span>

                  {/* Dynamic Island */}

                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[8px] h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-black shadow-inner"
                  >
                    <span className="absolute right-[13px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-[#17202A] ring-1 ring-[#202A35]" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[#232B36]">
                    {/* Signal */}

                    <svg
                      aria-hidden="true"
                      viewBox="0 0 18 14"
                      className="h-[12px] w-[15px]"
                      fill="currentColor"
                    >
                      <rect x="1" y="9" width="2.5" height="4" rx="0.7" />
                      <rect x="5" y="6.5" width="2.5" height="6.5" rx="0.7" />
                      <rect x="9" y="3.5" width="2.5" height="9.5" rx="0.7" />
                      <rect x="13" y="1" width="2.5" height="12" rx="0.7" />
                    </svg>

                    {/* Wi-Fi */}

                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 14"
                      className="h-[12px] w-[14px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M1.5 4.5a10 10 0 0 1 13 0" />
                      <path d="M4 7.2a6.1 6.1 0 0 1 8 0" />
                      <path d="M6.5 10a2.4 2.4 0 0 1 3 0" />
                      <circle cx="8" cy="12" r="0.8" fill="currentColor" stroke="none" />
                    </svg>

                    {/* Battery */}

                    <svg
                      aria-hidden="true"
                      viewBox="0 0 25 13"
                      className="h-[12px] w-[23px]"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="20"
                        height="11"
                        rx="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect x="3" y="3" width="15" height="7" rx="1.5" fill="currentColor" />
                      <path d="M23 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Scrollable app viewport */}

                <div className="h-[610px] overflow-y-auto overscroll-contain bg-[#F8F8F5] px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:h-[650px]">
                  <HeroInsightCard />
                </div>

                {/* Bottom home indicator */}

                <div className="absolute inset-x-0 bottom-0 z-20 flex h-[22px] items-center justify-center bg-gradient-to-t from-[#F8F8F5] via-[#F8F8F5]/95 to-transparent">
                  <span
                    aria-hidden="true"
                    className="h-[4px] w-[108px] rounded-full bg-[#232B36]/85"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}

          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-[#232B36]/45">
            MOBILE DASHBOARD PREVIEW · ILLUSTRATIVE DATA
          </p>
        </motion.div>
      </div>

      {/* Bottom transition */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-b from-transparent to-[#F5F3EE]/90"
      />
    </section>
  );
}

const PIPELINE_COMMENT = {
  original: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
  translation: "Our area has had no running water for two weeks.",
};

const PIPELINE_STAGES = [
  {
    key: "language",
    label: "Language",
    value: "Afaan Oromo",
    icon: Globe2,
    color: "mint",
  },
  {
    key: "sentiment",
    label: "Sentiment",
    value: "Negative",
    icon: Frown,
    color: "coral",
  },
  {
    key: "topic",
    label: "Detected topic",
    value: "Water supply",
    icon: Tag,
    color: "slate",
  },
];

function AnalysisPipeline() {
  return (
    <section className="bg-[#F5F3EE] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          className="max-w-2xl"
        >
          <SectionEyebrow>
            <Sparkles className="h-3.5 w-3.5" />
            AI comment analysis
          </SectionEyebrow>

          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#232B36] sm:text-4xl lg:text-[44px]">
            Understand the meaning behind every comment.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            CivicPulse organizes public feedback into language, sentiment,
            and topic insights your team can review.
          </p>
        </motion.div>

        {/* Analysis workspace */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-12"
        >
          {/* Workspace header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3FA88D]/10 text-[#328A73]">
                <Brain className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#232B36]">
                  Comment analysis
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Example result
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3FA88D]" />
              Analysis overview
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr]">
            {/* Original comment */}
            <div className="border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Original comment
              </p>

              <blockquote className="mt-4 text-base font-medium leading-7 text-[#232B36]">
                “{PIPELINE_COMMENT.original}”
              </blockquote>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Globe2 className="h-3.5 w-3.5" />
                  English translation
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {PIPELINE_COMMENT.translation}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Sample text for demonstration. Translation may require
                contextual review.
              </p>
            </div>

            {/* Structured AI results */}
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Analysis results
                </p>
                <Sparkles className="h-4 w-4 text-[#3FA88D]" />
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {PIPELINE_STAGES.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isCoral = stage.color === "coral";
                  const isMint = stage.color === "mint";

                  const iconStyle = isCoral
                    ? "bg-[#ED6A5E]/10 text-[#D9574C]"
                    : isMint
                      ? "bg-[#3FA88D]/10 text-[#328A73]"
                      : "bg-slate-100 text-slate-600";

                  const valueStyle = isCoral
                    ? "bg-[#ED6A5E]/10 text-[#D9574C]"
                    : isMint
                      ? "bg-[#3FA88D]/10 text-[#328A73]"
                      : "bg-slate-100 text-slate-700";

                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                      }}
                      className="flex items-center gap-3 py-4 first:pt-2 last:pb-2"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                      >
                        <StageIcon className="h-4 w-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400">
                          {stage.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#232B36]">
                          {stage.value}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${valueStyle}`}
                      >
                        {stage.key === "sentiment"
                          ? "Detected"
                          : "Identified"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Human-readable conclusion */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ED6A5E]/10 text-[#D9574C]">
                <Droplet className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[#232B36]">
                  Key takeaway
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  The comment expresses dissatisfaction about water
                  availability. This may help the relevant service team
                  identify an issue for further review.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Illustrative example · AI results support human review and decision-making.
        </p>
      </div>
    </section>
  );
}


/* =========================================================
   HERO INSIGHT DASHBOARD
========================================================= */

const SENTIMENT_SPLIT = [
  { label: "Positive", share: 58, color: "#3FA88D" },
  { label: "Neutral", share: 27, color: "#7B8490" },
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
  neutral: "bg-slate-400",
} as const;

function HeroInsightCard() {
  return (
    <div
      id="sample"
      className="w-full space-y-3 bg-[#F8F8F5] px-1 pb-4 pt-1"
    >
      {/* App header */}

      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#232B36] text-white shadow-sm">
            <Waves className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-tight text-[#232B36]">
              CivicPulse
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-slate-400">
              PUBLIC VOICE INTELLIGENCE
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#3FA88D]/20 bg-[#3FA88D]/[0.08] px-2 py-1 text-[9px] font-semibold text-[#328A73]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3FA88D]" />
          DEMO
        </span>
      </div>

      {/* Page heading */}

      <div className="px-1 pt-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#328A73]">
          Overview
        </p>

        <h3 className="mt-1 text-[21px] font-semibold leading-tight tracking-[-0.04em] text-[#232B36]">
          Public sentiment
        </h3>

        <p className="mt-1 text-[10px] text-slate-500">
          Sample page · Last 7 days
        </p>
      </div>

      {/* Main sentiment metric */}

      <div className="rounded-[18px] border border-[#232B36]/[0.06] bg-white p-4 shadow-sm shadow-slate-900/[0.025]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium text-slate-500">
              Overall positive sentiment
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#232B36]">
                58%
              </span>

              <span className="text-[9px] font-semibold text-[#328A73]">
                positive
              </span>
            </div>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3FA88D]/10 text-[#328A73]">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>

        <div
          role="img"
          aria-label="Illustrative sentiment distribution: 58 percent positive, 27 percent neutral, and 15 percent negative"
          className="mt-4 flex h-[7px] overflow-hidden rounded-full bg-slate-100"
        >
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

        <div className="mt-3 grid grid-cols-3 gap-2">
          {SENTIMENT_SPLIT.map((segment) => (
            <div key={segment.label} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />

                <span className="truncate text-[9px] text-slate-500">
                  {segment.label}
                </span>
              </div>

              <p className="mt-1 pl-3 text-[12px] font-bold tabular-nums text-[#232B36]">
                {segment.share}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Topic analysis */}

      <div className="rounded-[18px] border border-[#232B36]/[0.06] bg-white p-4 shadow-sm shadow-slate-900/[0.025]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-[#232B36]">
              Top concerns
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Frequently discussed topics
            </p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3FA88D]/10 text-[#328A73]">
            <BarChart3 className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {INSIGHT_TOPICS.map((topic, index) => (
            <div key={topic.label}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F5F3EE] text-[9px] font-bold text-[#6B7280]">
                    0{index + 1}
                  </span>

                  <span className="truncate text-[10px] font-medium text-[#232B36]/80">
                    {topic.label}
                  </span>
                </div>

                <span className="text-[10px] font-bold tabular-nums text-[#232B36]/70">
                  {topic.share}%
                </span>
              </div>

              <div className="ml-7 h-[5px] overflow-hidden rounded-full bg-[#232B36]/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${topic.share}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.12 * index,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-[#3FA88D]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen voices */}

      <div className="rounded-[18px] border border-[#232B36]/[0.06] bg-white p-4 shadow-sm shadow-slate-900/[0.025]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-[#232B36]">
              Citizen voices
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Example comments from different languages
            </p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <MessageSquareText className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {SAMPLE_COMMENTS.map((comment) => (
            <div
              key={comment.text}
              className="flex min-w-0 items-start gap-2 rounded-xl border border-slate-100 bg-[#FCFCFB] p-2.5"
            >
              <span
                aria-hidden="true"
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${SENTIMENT_DOT[comment.sentiment]}`}
              />

              <div className="min-w-0 flex-1">
                <p className="break-words text-[10px] leading-[1.65] text-slate-600">
                  {comment.text}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                    {comment.language}
                  </span>

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                      comment.sentiment === "positive"
                        ? "bg-[#3FA88D]/10 text-[#328A73]"
                        : "bg-[#ED6A5E]/10 text-[#D9574C]"
                    }`}
                  >
                    {comment.sentiment.toUpperCase()}
                  </span>

                  {comment.priority && (
                    <span className="rounded-md bg-[#ED6A5E]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#D9574C]">
                      {comment.priority} REVIEW
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language support */}

      <div className="rounded-[18px] border border-[#232B36]/[0.06] bg-white p-3.5 shadow-sm shadow-slate-900/[0.025]">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3FA88D]/10 text-[#328A73]">
            <Globe2 className="h-4 w-4" />
          </span>

          <div>
            <p className="text-[11px] font-semibold text-[#232B36]">
              Multilingual analysis
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Designed for local public feedback
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-slate-200 px-2 py-1 text-[9px] font-medium text-slate-600">
            English
          </span>

          <span className="rounded-full border border-slate-200 px-2 py-1 text-[9px] font-medium text-slate-600">
            አማርኛ
          </span>

          <span className="rounded-full border border-slate-200 px-2 py-1 text-[9px] font-medium text-slate-600">
            Afaan Oromo
          </span>
        </div>
      </div>

      {/* Responsible AI note */}

      <div className="flex items-start gap-2.5 rounded-xl border border-[#3FA88D]/15 bg-[#3FA88D]/[0.06] p-3">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#328A73]" />

        <p className="text-[9px] leading-[1.65] text-slate-500">
          AI-generated insights support human review. Results should
          be interpreted in context and are not a substitute for
          professional judgment.
        </p>
      </div>

      {/* Demo disclaimer */}

      <p className="px-2 pb-2 text-center text-[9px] leading-4 text-slate-400">
        Illustrative dashboard. Values and comments shown here are
        examples, not live municipal data.
      </p>
    </div>
  );
}

/* =========================================================
   SHARED SECTION EYEBROW
========================================================= */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#232B36]/10 bg-white px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#232B36]/65 shadow-sm shadow-slate-900/[0.02]">
      <span className="text-[#3FA88D]">{children}</span>
    </span>
  );
}

/* =========================================================
   LANGUAGE CHECK
========================================================= */

function LanguageCheck({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Check
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-[#3FA88D]"
      />
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
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-600">
      <span className="text-[#3FA88D] [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      {text}
    </span>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  number,
  title,
  description,
  accent,
}: {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
  accent: "mint" | "slate" | "coral";
}) {
  const accentStyles = {
    mint: {
      icon: "bg-[#3FA88D]/10 text-[#328A73]",
      hover: "group-hover:bg-[#3FA88D] group-hover:text-white",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700",
      hover: "group-hover:bg-[#232B36] group-hover:text-white",
    },
    coral: {
      icon: "bg-[#ED6A5E]/10 text-[#D9574C]",
      hover: "group-hover:bg-[#ED6A5E] group-hover:text-white",
    },
  }[accent];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/[0.05] sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
            {number}
          </span>

          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${accentStyles.icon} ${accentStyles.hover}`}
          >
            <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
          </span>
        </div>

        <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#232B36]">
          {title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors group-hover:text-[#328A73]">
          Built for better understanding
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className="h-full"
    >
      <Card className="group relative h-full rounded-2xl border-slate-200/80 bg-[#FAFAF9] p-6 transition-all duration-300 hover:border-[#3FA88D]/30 hover:bg-white hover:shadow-lg hover:shadow-slate-900/[0.03] sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400">
            {number}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232B36] text-white transition-colors group-hover:bg-[#3FA88D]">
            <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold text-[#232B36]">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          {text}
        </p>
      </Card>
    </motion.div>
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
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeIn}
    >
      <Card className="group rounded-2xl border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition-colors hover:border-[#3FA88D]/25 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3FA88D]/10 text-[#328A73] transition-colors group-hover:bg-[#3FA88D]/15">
            <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">
              {icon}
            </span>
          </span>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#232B36] sm:text-base">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {text}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

