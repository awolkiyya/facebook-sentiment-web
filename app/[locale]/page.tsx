"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
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
  TrendingUp,
  Waves,
  X,
  Droplet,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Threads from "@/components/Threads";
import Image from "next/image";

/* =========================================================
   THEME HELPERS
   Threads (WebGL) needs a real color string, so we resolve a
   CSS variable from the shadcn theme into a hex value and
   re-resolve when the theme class changes (light/dark).
========================================================= */

function useThemeColor(variable: string, fallback: string) {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const resolve = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      if (!raw) return;

      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = fallback;
      ctx.fillStyle = raw; // supports hex, hsl, oklch, etc.
      ctx.fillRect(0, 0, 1, 1);

      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const hex = `#${[r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`;
      setColor(hex);
    };

    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, [variable, fallback]);

  return color;
}

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
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
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* NAVIGATION */}

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative flex h-[62px] items-center justify-between rounded-2xl border border-border bg-card/90 px-3 shadow-sm shadow-foreground/[0.03] backdrop-blur-xl sm:px-5">
        
            <Link
              href="/"
              aria-label="CivicPulse home"
              className="flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-sm">
                <Image
                  src="/icons/icon.png"
                  alt="CivicPulse logo"
                  width={40}
                  height={40}
                  priority
                  className="h-10 w-10 object-contain"
                />
              </span>

              <span className="leading-none">
                <span className="block text-[15px] font-bold tracking-tight">
                  CivicPulse
                </span>

                <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Public voice intelligence
                </span>
              </span>
            </Link>


            {/* Desktop navigation */}

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-8 md:flex"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}

            <div className="hidden md:block">
              <Link href="/auth/login">
                <Button className="group h-10 rounded-xl bg-foreground px-4 text-xs font-semibold text-background shadow-sm transition-all hover:bg-foreground/90">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Mobile navigation */}

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.nav
                  id="mobile-navigation"
                  aria-label="Mobile navigation"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-border bg-card p-3 shadow-xl shadow-foreground/10 md:hidden"
                >
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/70" />
                    </a>
                  ))}

                  <div className="my-2 border-t border-border" />

                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition hover:bg-foreground/90"
                  >
                    Sign in
                    <LogIn className="h-4 w-4" />
                  </Link>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* HERO */}
      <CivicPulseHero />

      {/* ANALYSIS PIPELINE */}
      <AnalysisPipeline />

      {/* TRUST STRIP */}

      <section
        id="trust"
        className="scroll-mt-28 border-y border-border bg-card"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Built for public service
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Turn citizen feedback into a clearer understanding of public
              concerns and service priorities.
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
        className="relative scroll-mt-28 overflow-hidden bg-card px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-primary/[0.06] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-destructive/[0.04] blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          <InteractiveWorkflow />
        </div>
      </section>

      {/* FOOTER */}

     

{/* FOOTER */}

<footer className="border-t border-border bg-card">
  <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      {/* Brand */}
      <Link
        href="/"
        aria-label="CivicPulse home"
        className="flex shrink-0 items-center gap-2.5"
      >
          <Image
            src="/icons/icon.png"
            alt="CivicPulse logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />

        <span className="leading-none">
          <span className="block text-sm font-bold tracking-tight">
            CivicPulse
          </span>

          <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Public voice intelligence
          </span>
        </span>
      </Link>

      {/* Main navigation */}
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-[#0066FF]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Legal links */}
      <nav
        aria-label="Legal and privacy"
        className="flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-muted-foreground"
      >
        <Link
          href="/privacy-policy"
          className="transition-colors hover:text-[#0066FF]"
        >
          Privacy Policy
        </Link>

        <Link
          href="/terms"
          className="transition-colors hover:text-[#0066FF]"
        >
          Terms of Service
        </Link>

        <Link
          href="/data-deletion"
          className="transition-colors hover:text-[#0066FF]"
        >
          Data Deletion
        </Link>
      </nav>
    </div>

    {/* Footer description and copyright */}
    <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs leading-5 text-muted-foreground">
        Public-sector intelligence for better understanding.
      </p>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} CivicPulse. All rights reserved.
      </p>
    </div>
  </div>
</footer>


    </main>
  );
}

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#trust", label: "Responsible AI" },
];

/* =========================================================
   INTERACTIVE WORKFLOW
========================================================= */

type Tone = "primary" | "destructive";

const TONE_STYLES: Record<Tone, { box: string; pulse: string }> = {
  primary: { box: "bg-primary/10 text-primary", pulse: "bg-primary/20" },
  destructive: {
    box: "bg-destructive/10 text-destructive",
    pulse: "bg-destructive/20",
  },
};

const WORKFLOW_STEPS: {
  number: string;
  title: string;
  description: string;
  icon: typeof MessageSquare;
  tone: Tone;
  tags: string[];
}[] = [
  {
    number: "01",
    title: "Connect & collect",
    description:
      "Bring authorized Facebook Page posts and available comments into CivicPulse.",
    icon: MessageSquare,
    tone: "primary",
    tags: ["Page posts", "Comments"],
  },
  {
    number: "02",
    title: "AI analyzes feedback",
    description:
      "Identify language, sentiment, and recurring public-service topics.",
    icon: Brain,
    tone: "destructive",
    tags: ["Language", "Sentiment", "Topics"],
  },
  {
    number: "03",
    title: "Discover insights",
    description:
      "Explore feedback patterns to help teams understand community concerns.",
    icon: BarChart3,
    tone: "primary",
    tags: ["Trends", "Service priorities"],
  },
];

function InteractiveWorkflow() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-5 sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-destructive/10 blur-3xl"
        />

        <div className="relative">
          <div className="mb-8 flex flex-col gap-3 text-center sm:mb-10">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              The CivicPulse AI pipeline
            </span>

            <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              From public comments to meaningful insights
            </h3>

            <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
              Every stage transforms public feedback into information that
              teams can explore and review.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_52px_1fr_52px_1fr] md:items-center">
            {WORKFLOW_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const tone = TONE_STYLES[step.tone];

              return (
                <div key={step.number} className="contents">
                  <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="relative flex h-full flex-col rounded-2xl border border-border bg-card/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.05] sm:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="relative flex h-12 w-12">
                        <span
                          aria-hidden="true"
                          style={{ animationDelay: `${index * 0.6}s` }}
                          className={`absolute inset-0 animate-ping rounded-2xl [animation-duration:2.8s] ${tone.pulse}`}
                        />
                        <span
                          className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${tone.box}`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </span>
                      </span>

                      <span className="text-xs font-bold tracking-widest text-muted-foreground">
                        {step.number}
                      </span>
                    </div>

                    <h4 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h4>

                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>

                    {index === 0 && (
                      <div className="mt-5 space-y-2">
                        {["Page posts", "Available comments"].map(
                          (item, itemIndex) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.35 + itemIndex * 0.15 }}
                              className="flex items-center gap-2.5 rounded-xl bg-primary/[0.07] px-3 py-2.5"
                            >
                              <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
                              <span className="text-xs font-medium text-foreground/70">
                                {item}
                              </span>
                              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                            </motion.div>
                          ),
                        )}
                      </div>
                    )}

                    {index === 1 && (
                      <div className="mt-5 rounded-xl bg-foreground p-4 text-background">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 12,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-background/15 bg-background/[0.08]"
                          >
                            <Brain className="h-5 w-5 text-primary" />
                          </motion.div>
                          <div>
                            <p className="text-xs font-semibold">
                              AI processing
                            </p>
                            <p className="mt-1 text-[10px] text-background/60">
                              Multilingual feedback
                            </p>
                          </div>
                          <motion.span
                            animate={{ opacity: [0.35, 1, 0.35] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="ml-auto h-2 w-2 rounded-full bg-primary"
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {step.tags.map((tag, tagIndex) => (
                            <motion.span
                              key={tag}
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + tagIndex * 0.12 }}
                              className="rounded-lg border border-background/10 bg-background/[0.07] px-2 py-1.5 text-[10px] text-background/80"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="mt-5 rounded-xl bg-primary/[0.06] p-4">
                        <p className="text-xs font-semibold text-foreground">
                          Insight categories
                        </p>

                        {[
                          { label: "Sentiment patterns", width: "82%" },
                          { label: "Recurring topics", width: "64%" },
                        ].map((item, itemIndex) => (
                          <div key={item.label} className="mt-3">
                            <p className="mb-1.5 text-[10px] text-muted-foreground">
                              {item.label}
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: item.width }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 0.9,
                                  delay: 0.5 + itemIndex * 0.15,
                                  ease: "easeOut",
                                }}
                                className="h-full rounded-full bg-primary"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.article>

                  {/* Flow connector */}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="relative mx-auto flex h-9 w-full items-center justify-center md:h-12"
                    >
                      <div className="absolute inset-x-0 top-1/2 hidden h-px bg-border md:block" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-border md:hidden" />

                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="absolute inset-0 hidden overflow-hidden rounded-full md:block">
                          <motion.span
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              delay: index * 0.5,
                              ease: "linear",
                            }}
                            className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
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
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-xs font-medium text-primary">
              <Globe2 className="h-4 w-4" />
              <span>Amharic</span>
              <span className="text-muted-foreground/50">·</span>
              <span>Afaan Oromo</span>
              <span className="text-muted-foreground/50">·</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        AI-assisted analysis supports human judgment; it does not replace it.
      </p>
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function CivicPulseHero() {
  const threadsColor = useThemeColor("--primary", "#3FA88D");

  return (
    <section className="relative isolate overflow-hidden bg-background px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-40 lg:px-10 lg:pb-28 lg:pt-44">
      {/* Animated background */}

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

      {/* Readability overlay */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/10 via-background/15 to-background/75"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Hero copy */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card/75 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-foreground/70 shadow-sm shadow-foreground/[0.02] backdrop-blur-sm sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              PUBLIC FEEDBACK INTELLIGENCE
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-7 max-w-3xl text-[43px] font-semibold leading-[1.06] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[68px] xl:text-[74px]"
          >
            We listen to{" "}
            <span className="font-serif font-normal italic text-primary">
              what
            </span>
            <br className="hidden sm:block" /> citizens are saying.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-sm leading-7 text-foreground/65 sm:mt-7 sm:text-base sm:leading-8 lg:text-[17px]"
          >
            Understand public feedback at scale. CivicPulse turns available
            Facebook comments into sentiment, topic, and trend insights
            across Amharic, Afaan Oromo, and English.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center"
          >
            <Link href="/auth/login">
              <Button className="group h-12 w-full rounded-xl bg-foreground px-5 text-sm font-semibold text-background shadow-lg shadow-foreground/10 transition-all hover:-translate-y-0.5 hover:bg-foreground/90 sm:w-auto sm:px-6">
                Connect your page
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <a
              href="#product"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-foreground/15 bg-card/55 px-5 text-sm font-semibold text-foreground/80 transition-colors hover:border-foreground/25 hover:bg-card/90 sm:px-6"
            >
              Explore the platform
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Supported languages */}

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-foreground/10 pt-5 text-xs text-foreground/55 sm:mt-10"
          >
            <span className="font-medium text-foreground/40">
              MULTILINGUAL ANALYSIS
            </span>

            <LanguageCheck text="Amharic" />
            <LanguageCheck text="Afaan Oromo" />
            <LanguageCheck text="English" />
          </motion.div>
        </motion.div>

        {/* Mobile phone preview */}

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto w-full max-w-[390px] lg:ml-auto lg:mr-0"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-[65px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 left-1/2 -z-10 h-20 w-[72%] -translate-x-1/2 rounded-full bg-foreground/20 blur-2xl"
          />

          {/* Phone hardware buttons (device mockup, intentionally not themed) */}

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

          {/* Phone chassis (device mockup, intentionally not themed) */}

          <div className="relative rounded-[3.35rem] border-[3px] border-[#747C86] bg-gradient-to-br from-[#424A55] via-[#171C24] to-[#353D48] p-[7px] shadow-[0_35px_90px_-28px_rgba(35,43,54,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)]">
            <div className="rounded-[2.85rem] border border-black/70 bg-[#080B10] p-[5px]">
              {/* Phone screen */}

              <div className="relative overflow-hidden rounded-[2.55rem] bg-background">
                {/* Status bar */}

                <div className="relative z-20 flex h-[45px] items-center justify-between bg-background px-6 pt-1">
                  <span className="text-[11px] font-bold tracking-tight text-foreground">
                    9:41
                  </span>

                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[8px] h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-black shadow-inner"
                  >
                    <span className="absolute right-[13px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-[#17202A] ring-1 ring-[#202A35]" />
                  </div>

                  <div className="flex items-center gap-1.5 text-foreground">
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

                <div className="h-[610px] overflow-y-auto overscroll-contain bg-background px-3 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:h-[650px]">
                  <HeroInsightCard />
                </div>

                {/* Home indicator */}

                <div className="absolute inset-x-0 bottom-0 z-20 flex h-[22px] items-center justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
                  <span
                    aria-hidden="true"
                    className="h-[4px] w-[108px] rounded-full bg-foreground/85"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-foreground/45">
            MOBILE DASHBOARD PREVIEW · ILLUSTRATIVE DATA
          </p>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-b from-transparent to-background/90"
      />
    </section>
  );
}

/* =========================================================
   ANALYSIS PIPELINE
========================================================= */

const PIPELINE_COMMENT = {
  original: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
  translation: "Our area has had no running water for two weeks.",
};

type StageTone = "primary" | "destructive" | "neutral";

const STAGE_TONE_STYLES: Record<StageTone, string> = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

const PIPELINE_STAGES: {
  key: string;
  label: string;
  value: string;
  icon: typeof Globe2;
  tone: StageTone;
}[] = [
  {
    key: "language",
    label: "Language",
    value: "Afaan Oromo",
    icon: Globe2,
    tone: "primary",
  },
  {
    key: "sentiment",
    label: "Sentiment",
    value: "Negative",
    icon: Frown,
    tone: "destructive",
  },
  {
    key: "topic",
    label: "Detected topic",
    value: "Water supply",
    icon: Tag,
    tone: "neutral",
  },
];

function AnalysisPipeline() {
  return (
    <section
      id="product"
      className="scroll-mt-28 bg-background px-5 py-20 sm:px-8 sm:py-24 lg:py-28"
    >
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

          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[44px]">
            Understand the meaning behind every comment.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            CivicPulse organizes public feedback into language, sentiment, and
            topic insights your team can review.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:mt-12"
        >
          {/* Workspace header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Brain className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Comment analysis
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Example result
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Analysis overview
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr]">
            {/* Original comment */}
            <div className="border-b border-border/60 p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Original comment
              </p>

              <blockquote className="mt-4 text-base font-medium leading-7 text-foreground">
                “{PIPELINE_COMMENT.original}”
              </blockquote>

              <div className="mt-5 rounded-xl bg-muted/60 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Globe2 className="h-3.5 w-3.5" />
                  English translation
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  {PIPELINE_COMMENT.translation}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Sample text for demonstration. Translation may require
                contextual review.
              </p>
            </div>

            {/* Structured AI results */}
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Analysis results
                </p>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div className="mt-4 divide-y divide-border/60">
                {PIPELINE_STAGES.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const toneClass = STAGE_TONE_STYLES[stage.tone];

                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 py-4 first:pt-2 last:pb-2"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
                      >
                        <StageIcon className="h-4 w-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {stage.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {stage.value}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${toneClass}`}
                      >
                        {stage.key === "sentiment" ? "Detected" : "Identified"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key takeaway */}
          <div className="border-t border-border/60 bg-muted/50 px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Droplet className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Key takeaway
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The comment expresses dissatisfaction about water
                  availability. This may help the relevant service team
                  identify an issue for further review.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Illustrative example · AI results support human review and
          decision-making.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   HERO INSIGHT DASHBOARD
========================================================= */

const SENTIMENT_SPLIT = [
  { label: "Positive", share: 58, bar: "bg-primary" },
  { label: "Neutral", share: 27, bar: "bg-muted-foreground" },
  { label: "Negative", share: 15, bar: "bg-destructive" },
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
  positive: "bg-primary",
  negative: "bg-destructive",
  neutral: "bg-muted-foreground",
} as const;

const DASH_CARD =
  "rounded-[18px] border border-foreground/[0.06] bg-card shadow-sm shadow-foreground/[0.025]";

function HeroInsightCard() {
  return (
    <div className="w-full space-y-3 bg-background px-1 pb-4 pt-1">
      {/* App header */}

      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <Waves className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-tight text-foreground">
              CivicPulse
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-muted-foreground">
              PUBLIC VOICE INTELLIGENCE
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/[0.08] px-2 py-1 text-[9px] font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          DEMO
        </span>
      </div>

      {/* Page heading */}

      <div className="px-1 pt-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
          Overview
        </p>
        <h3 className="mt-1 text-[21px] font-semibold leading-tight tracking-[-0.04em] text-foreground">
          Public sentiment
        </h3>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Sample page · Last 7 days
        </p>
      </div>

      {/* Main sentiment metric */}

      <div className={`${DASH_CARD} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">
              Overall positive sentiment
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-foreground">
                58%
              </span>
              <span className="text-[9px] font-semibold text-primary">
                positive
              </span>
            </div>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>

        <div
          role="img"
          aria-label="Illustrative sentiment distribution: 58 percent positive, 27 percent neutral, and 15 percent negative"
          className="mt-4 flex h-[7px] overflow-hidden rounded-full bg-muted"
        >
          {SENTIMENT_SPLIT.map((segment) => (
            <span
              key={segment.label}
              className={segment.bar}
              style={{ width: `${segment.share}%` }}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {SENTIMENT_SPLIT.map((segment) => (
            <div key={segment.label} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${segment.bar}`}
                />
                <span className="truncate text-[9px] text-muted-foreground">
                  {segment.label}
                </span>
              </div>

              <p className="mt-1 pl-3 text-[12px] font-bold tabular-nums text-foreground">
                {segment.share}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Topic analysis */}

      <div className={`${DASH_CARD} p-4`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-foreground">
              Top concerns
            </p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Frequently discussed topics
            </p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {INSIGHT_TOPICS.map((topic, index) => (
            <div key={topic.label}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-background text-[9px] font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                  <span className="truncate text-[10px] font-medium text-foreground/80">
                    {topic.label}
                  </span>
                </div>

                <span className="text-[10px] font-bold tabular-nums text-foreground/70">
                  {topic.share}%
                </span>
              </div>

              <div className="ml-7 h-[5px] overflow-hidden rounded-full bg-foreground/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${topic.share}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.12 * index,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen voices */}

      <div className={`${DASH_CARD} p-4`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-foreground">
              Citizen voices
            </p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Example comments from different languages
            </p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <MessageSquareText className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {SAMPLE_COMMENTS.map((comment) => (
            <div
              key={comment.text}
              className="flex min-w-0 items-start gap-2 rounded-xl border border-border/60 bg-background/60 p-2.5"
            >
              <span
                aria-hidden="true"
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${SENTIMENT_DOT[comment.sentiment]}`}
              />

              <div className="min-w-0 flex-1">
                <p className="break-words text-[10px] leading-[1.65] text-foreground/70">
                  {comment.text}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground">
                    {comment.language}
                  </span>

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
                      comment.sentiment === "positive"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {comment.sentiment.toUpperCase()}
                  </span>

                  {comment.priority && (
                    <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[8px] font-bold text-destructive">
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

      <div className={`${DASH_CARD} p-3.5`}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe2 className="h-4 w-4" />
          </span>

          <div>
            <p className="text-[11px] font-semibold text-foreground">
              Multilingual analysis
            </p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Designed for local public feedback
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["English", "አማርኛ", "Afaan Oromo"].map((lang) => (
            <span
              key={lang}
              className="rounded-full border border-border px-2 py-1 text-[9px] font-medium text-foreground/70"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Responsible AI note */}

      <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-[9px] leading-[1.65] text-muted-foreground">
          AI-generated insights support human review. Results should be
          interpreted in context and are not a substitute for professional
          judgment.
        </p>
      </div>

      <p className="px-2 pb-2 text-center text-[9px] leading-4 text-muted-foreground">
        Illustrative dashboard. Values and comments shown here are examples,
        not live municipal data.
      </p>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-3.5 py-2 text-[11px] font-semibold tracking-wide text-foreground/65 shadow-sm shadow-foreground/[0.02]">
      <span className="inline-flex items-center gap-2 text-primary">
        {children}
      </span>
    </span>
  );
}

function LanguageCheck({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
      {text}
    </span>
  );
}

function TrustPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-2 text-xs font-medium text-foreground/70">
      <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      {text}
    </span>
  );
}

/* =========================================================
   CARDS (currently unused, themed for future sections)
========================================================= */

const ACCENT_STYLES = {
  mint: {
    icon: "bg-primary/10 text-primary",
    hover: "group-hover:bg-primary group-hover:text-primary-foreground",
  },
  slate: {
    icon: "bg-muted text-foreground/70",
    hover: "group-hover:bg-foreground group-hover:text-background",
  },
  coral: {
    icon: "bg-destructive/10 text-destructive",
    hover: "group-hover:bg-destructive group-hover:text-white",
  },
} as const;

export function FeatureCard({
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
  accent: keyof typeof ACCENT_STYLES;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card p-6 shadow-sm shadow-foreground/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/[0.05] sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground">
            {number}
          </span>

          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${styles.icon} ${styles.hover}`}
          >
            <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
          </span>
        </div>

        <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
          Built for better understanding
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </motion.div>
  );
}

export function ProcessCard({
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
      <Card className="group relative h-full rounded-2xl border-border bg-background p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-foreground/[0.03] sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
            {number}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold text-foreground">{title}</h3>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
      </Card>
    </motion.div>
  );
}

export function PrivacyCard({
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
      <Card className="group rounded-2xl border-border bg-card p-5 shadow-sm shadow-foreground/[0.02] transition-colors hover:border-primary/25 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
          </span>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {text}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}