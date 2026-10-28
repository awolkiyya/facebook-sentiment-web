"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  BarChart3,
  Brain,
  Building2,
  Check,
  ChevronRight,
  Eye,
  Frown,
  Globe2,
  Landmark,
  Lock,
  LogIn,
  Megaphone,
  Meh,
  Menu,
  MessageSquareText,
  Plug,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Tag,
  TrendingUp,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Threads from "@/components/Threads";

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
      setColor(
        `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`,
      );
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
   MOTION
   Motion is kept deliberate: one hero entrance, the pulse line
   drawing itself, and responses to user actions.
========================================================= */

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/* =========================================================
   CONTENT
========================================================= */

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#demo", label: "Live example" },
  { href: "#how", label: "How it works" },
  { href: "#use-cases", label: "Who it's for" },
  { href: "#trust", label: "Responsible AI" },
];

type Sentiment = "positive" | "neutral" | "negative";

const SENTIMENT_META: Record<
  Sentiment,
  { label: string; icon: LucideIcon; chip: string; dot: string }
> = {
  positive: {
    label: "Positive",
    icon: Smile,
    chip: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  neutral: {
    label: "Neutral",
    icon: Meh,
    chip: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  negative: {
    label: "Negative",
    icon: Frown,
    chip: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

const DEMO_SAMPLES: {
  id: string;
  language: string;
  code: string;
  text: string;
  translation: string | null;
  sentiment: Sentiment;
  topic: string;
  priority: "High" | "Medium" | "Low";
  takeaway: string;
}[] = [
  {
    id: "or-water",
    language: "Afaan Oromo",
    code: "OR",
    text: "Bishaan naannoo keenya torban lama guutuu hin jiru.",
    translation: "Our area has had no running water for two weeks.",
    sentiment: "negative",
    topic: "Water supply",
    priority: "High",
    takeaway:
      "The commenter reports a two-week water outage. A service team may want to confirm the affected area.",
  },
  {
    id: "am-roads",
    language: "Amharic",
    code: "AM",
    text: "የመንገዱ ስራ በጣም ጥሩ ነው፣ አመሰግናለሁ።",
    translation: "The road work is very good, thank you.",
    sentiment: "positive",
    topic: "Roads and construction",
    priority: "Low",
    takeaway:
      "Residents are expressing appreciation for completed road work. Useful for communications and progress reports.",
  },
  {
    id: "en-waste",
    language: "English",
    code: "EN",
    text: "The waste collection truck has not come to our street this week.",
    translation: null,
    sentiment: "negative",
    topic: "Waste collection",
    priority: "Medium",
    takeaway:
      "A missed collection is reported. Repeated mentions on one street could point to a route problem.",
  },
  {
    id: "en-health",
    language: "English",
    code: "EN",
    text: "When will the new health center open to the public?",
    translation: null,
    sentiment: "neutral",
    topic: "Health services",
    priority: "Medium",
    takeaway:
      "A question about an opening date. A clear public update could answer many similar comments at once.",
  },
];

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const POSITIVE_TREND = [42, 46, 44, 51, 55, 53, 58];
const NEGATIVE_TREND = [24, 22, 25, 20, 18, 19, 15];

const TOP_TOPICS = [
  { label: "Roads and construction", share: 31 },
  { label: "Water supply", share: 24 },
  { label: "Waste collection", share: 18 },
  { label: "Health services", share: 12 },
];

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground antialiased">
      <SiteHeader />
      <Hero />
      <CapabilityStrip />
      <FeatureGrid />
      <LiveExample />
      <HowItWorks />
      <UseCases />
      <ResponsibleAI />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

/* =========================================================
   HEADER
========================================================= */

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Link
      href="/"
      aria-label="CivicPulse home"
      className="flex shrink-0 items-center gap-2.5"
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
      <span className="text-[17px] font-semibold tracking-tight">
        CivicPulse
      </span>
    </Link>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-border bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <BrandMark size={34} />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/auth/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/auth/login">
            <Button className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Connect your page
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-border bg-background px-5 pb-5 pt-3 lg:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-60" />
              </a>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="mt-3 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              Sign in
              <LogIn className="h-4 w-4" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  const threadsColor = useThemeColor("--primary", "#0066FF");

  return (
    <section className="relative isolate overflow-hidden px-5 pb-8 pt-32 sm:px-8 sm:pt-40 lg:pt-44">
      {/* Background: threads + faint grid, both fade out toward the bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_35%,transparent_95%)]"
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
          opacity={0.35}
          seed={0}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroStagger}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.span
          variants={heroItem}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 py-1.5 pl-2 pr-3.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3" />
          </span>
          Sentiment and language insight for Amharic, Afaan Oromo and English
        </motion.span>

        <motion.h1
          variants={heroItem}
          className="mt-7 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[68px]"
        >
          Turn public conversations into decisions you can act on.
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          CivicPulse reads the comments citizens leave on your Facebook Page,
          then shows you how people feel, what they talk about, and what needs
          attention first.
        </motion.p>

        <motion.div
          variants={heroItem}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button className="group h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto">
              Connect your page
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a
            href="#demo"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-6 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-muted sm:w-auto"
          >
            See a live example
          </a>
        </motion.div>

        <motion.ul
          variants={heroItem}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {["Amharic", "Afaan Oromo", "English"].map((lang) => (
            <li key={lang} className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              {lang}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Product preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.35 }}
        className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[48px] bg-primary/15 blur-[90px]"
        />

        <DashboardPreview />

        {/* Floating context cards (large screens) */}
        <div className="absolute -left-6 top-28 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 xl:block">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5 text-primary" />
            Language detected
          </div>
          <p className="mt-2 text-sm font-semibold">Afaan Oromo</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Translated for review by your team.
          </p>
        </div>

        <div className="absolute -right-6 bottom-32 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/10 xl:block">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5 text-destructive" />
            Flagged for review
          </div>
          <p className="mt-2 text-sm font-semibold">Water supply</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Several negative comments from one area.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Product preview with illustrative data.
        </p>
      </motion.div>
    </section>
  );
}

/* =========================================================
   TREND CHART (shared by hero preview and features)
========================================================= */

function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
}

function TrendChart({
  height = 150,
  showLabels = true,
}: {
  height?: number;
  showLabels?: boolean;
}) {
  const w = 420;
  const h = 150;
  const max = 70;
  const toPoints = (values: number[]): [number, number][] =>
    values.map((v, i) => [(i * w) / (values.length - 1), h - (v / max) * h]);

  const positive = toPoints(POSITIVE_TREND);
  const negative = toPoints(NEGATIVE_TREND);
  const positiveLine = smoothPath(positive);
  const negativeLine = smoothPath(negative);

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Illustrative seven day trend: positive sentiment rising from 42 to 58 percent while negative sentiment falls from 24 to 15 percent"
        style={{ height }}
        className="w-full overflow-visible"
      >
        <defs>
          <linearGradient id="cp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1="0"
            x2={w}
            y1={h * r}
            y2={h * r}
            stroke="var(--border)"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={`${positiveLine} L${w} ${h} L0 ${h} Z`} fill="url(#cp-area)" />

        <motion.path
          d={negativeLine}
          fill="none"
          stroke="var(--destructive)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.9, ease: "easeInOut" }}
        />
        <motion.path
          d={positiveLine}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.75"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.7, ease: "easeInOut" }}
        />
      </svg>

      {showLabels && (
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {TREND_DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD PREVIEW (hero)
========================================================= */

const SIDEBAR_ITEMS: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: BarChart3, label: "Overview", active: true },
  { icon: MessageSquareText, label: "Comments" },
  { icon: Tag, label: "Topics" },
  { icon: Activity, label: "Trends" },
  { icon: Bell, label: "Review queue" },
];

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10 ring-1 ring-foreground/[0.03]">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-xs items-center justify-center rounded-md border border-border bg-background text-[11px] text-muted-foreground">
          CivicPulse overview
        </div>
        <div className="w-10" aria-hidden="true" />
      </div>

      <div className="grid md:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border bg-muted/30 p-4 md:block">
          <div className="flex items-center gap-2 px-2 pb-4">
            <Image
              src="/icons/icon.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="text-sm font-semibold">CivicPulse</span>
          </div>
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
              <li
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="min-w-0 p-4 text-left sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Public sentiment
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sample page, last 7 days
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Demo data
            </span>
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Comments analyzed",
                value: "12,480",
                note: "+8% vs last week",
                icon: MessageSquareText,
              },
              {
                label: "Positive sentiment",
                value: "58%",
                note: "+6 points",
                icon: TrendingUp,
              },
              {
                label: "Needs review",
                value: "42",
                note: "7 high priority",
                icon: Bell,
              },
            ].map(({ label, value, note, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            {/* Trend */}
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Sentiment trend</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Positive
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    Negative
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <TrendChart />
              </div>
            </div>

            {/* Topics */}
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">Top concerns</p>
              <ul className="mt-4 space-y-3.5">
                {TOP_TOPICS.map((topic, i) => (
                  <li key={topic.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="truncate text-foreground/80">
                        {topic.label}
                      </span>
                      <span className="font-medium tabular-nums text-muted-foreground">
                        {topic.share}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.share * 2.8}%` }}
                        transition={{
                          duration: 0.9,
                          delay: 0.8 + i * 0.1,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${
                          i === 1 ? "bg-chart-2" : "bg-primary"
                        }`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CAPABILITY STRIP
========================================================= */

function CapabilityStrip() {
  const items = [
    {
      title: "3 languages",
      text: "Amharic, Afaan Oromo and English in one workspace.",
    },
    {
      title: "3 layers of insight",
      text: "Language, sentiment and topic for every comment.",
    },
    {
      title: "Your team decides",
      text: "AI organizes feedback. People make the call.",
    },
    {
      title: "Authorized data only",
      text: "Works with Pages you connect and comments available to you.",
    },
  ];

  return (
    <section className="px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="bg-card p-6">
            <p className="text-base font-semibold tracking-tight">
              {item.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  center = false,
}: {
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FEATURE GRID (bento)
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-7 ${className}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

function FeatureGrid() {
  return (
    <section id="product" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          center
          title="Everything you need to understand public feedback"
          description="One workspace that reads comments in the languages your community uses and turns them into patterns your team can review."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          <FeatureCard
            className="lg:col-span-2"
            icon={Globe2}
            title="Understands the languages your community speaks"
            description="Comments are identified and analyzed in Amharic, Afaan Oromo and English, with an English translation to help every team member follow along."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "አማርኛ", sub: "Amharic", sample: "በጣም ጥሩ ነው" },
                { name: "Afaan Oromo", sub: "Oromo", sample: "Galatoomaa" },
                { name: "English", sub: "English", sample: "Thank you" },
              ].map((l) => (
                <div
                  key={l.sub}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{l.name}</p>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {l.sample}
                  </p>
                </div>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            icon={Smile}
            title="Sentiment you can read at a glance"
            description="See how people feel about each topic, page and time period."
          >
            <div className="space-y-4">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <span className="bg-primary" style={{ width: "58%" }} />
                <span className="bg-muted-foreground/60" style={{ width: "27%" }} />
                <span className="bg-destructive" style={{ width: "15%" }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    ["positive", "58%"],
                    ["neutral", "27%"],
                    ["negative", "15%"],
                  ] as [Sentiment, string][]
                ).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className={`h-2 w-2 rounded-full ${SENTIMENT_META[key].dot}`}
                      />
                      {SENTIMENT_META[key].label}
                    </div>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={Tag}
            title="Topics found automatically"
            description="Recurring subjects surface on their own, so you don't need to tag comments by hand."
          >
            <div className="flex flex-wrap gap-2">
              {[
                "Roads",
                "Water supply",
                "Waste collection",
                "Health services",
                "Electricity",
                "Schools",
                "Public transport",
              ].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    i < 2
                      ? "border-primary/25 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            icon={Activity}
            title="Track how opinion changes over time"
            description="Follow sentiment day by day to see whether a service improvement is landing or a concern is growing."
          >
            <div className="rounded-2xl border border-border bg-background p-4">
              <TrendChart height={120} />
            </div>
          </FeatureCard>

          <FeatureCard
            icon={Lock}
            title="Built with privacy in mind"
            description="Only content from Pages you are authorized to manage is analyzed."
          >
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                "Authorized Page access",
                "Data deletion on request",
                "No data sold or shared",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            className="lg:col-span-2"
            icon={Bell}
            title="Know what needs attention first"
            description="Comments that point to urgent service problems are flagged, so your team starts with what matters most."
          >
            <div className="space-y-2.5">
              {[
                {
                  text: "Water outage reported for two weeks",
                  tag: "High priority",
                  tone: "bg-destructive/10 text-destructive",
                },
                {
                  text: "Missed waste collection on one street",
                  tag: "Medium priority",
                  tone: "bg-muted text-muted-foreground",
                },
              ].map((row) => (
                <div
                  key={row.text}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <p className="min-w-0 truncate text-sm">{row.text}</p>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${row.tone}`}
                  >
                    {row.tag}
                  </span>
                </div>
              ))}
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LIVE EXAMPLE (interactive)
========================================================= */

function LiveExample() {
  const [activeId, setActiveId] = useState(DEMO_SAMPLES[0].id);
  const sample = DEMO_SAMPLES.find((s) => s.id === activeId) ?? DEMO_SAMPLES[0];
  const meta = SENTIMENT_META[sample.sentiment];
  const SentimentIcon = meta.icon;

  const priorityTone =
    sample.priority === "High"
      ? "bg-destructive/10 text-destructive"
      : sample.priority === "Medium"
        ? "bg-chart-2/15 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <section
      id="demo"
      className="scroll-mt-20 border-y border-border bg-muted/30 px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="Pick a comment and see how CivicPulse reads it"
          description="Each comment is identified by language, scored for sentiment, matched to a topic and given a review priority."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Comment picker */}
          <div
            role="tablist"
            aria-label="Sample comments"
            className="space-y-3"
          >
            {DEMO_SAMPLES.map((s) => {
              const selected = s.id === activeId;
              return (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    selected
                      ? "border-primary/40 bg-card shadow-md shadow-primary/10"
                      : "border-border bg-card/60 hover:bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                      {s.language}
                    </span>
                    {selected && (
                      <span className="text-xs font-medium text-primary">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[15px] leading-6 text-foreground/90">
                    {s.text}
                  </p>
                </button>
              );
            })}
            <p className="px-1 pt-1 text-xs leading-5 text-muted-foreground">
              Sample comments written for demonstration. Translations may need
              contextual review.
            </p>
          </div>

          {/* Result panel */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-foreground/[0.04]">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold">Analysis result</p>
              </div>
              <Sparkles className="h-4 w-4 text-chart-2" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="p-6"
              >
                {sample.translation && (
                  <div className="rounded-2xl bg-muted/70 p-4">
                    <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Globe2 className="h-3.5 w-3.5" />
                      English translation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {sample.translation}
                    </p>
                  </div>
                )}

                <dl
                  className={`grid grid-cols-2 gap-3 ${sample.translation ? "mt-4" : ""}`}
                >
                  <div className="rounded-2xl border border-border p-4">
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe2 className="h-3.5 w-3.5" />
                      Language
                    </dt>
                    <dd className="mt-2 text-sm font-semibold">
                      {sample.language}
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <SentimentIcon className="h-3.5 w-3.5" />
                      Sentiment
                    </dt>
                    <dd className="mt-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      Topic
                    </dt>
                    <dd className="mt-2 text-sm font-semibold">
                      {sample.topic}
                    </dd>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bell className="h-3.5 w-3.5" />
                      Review priority
                    </dt>
                    <dd className="mt-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${priorityTone}`}
                      >
                        {sample.priority}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
                  <p className="text-sm font-semibold">What this means</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {sample.takeaway}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          AI-assisted analysis supports human judgment. It does not replace it.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   HOW IT WORKS (a real sequence, so steps are numbered)
========================================================= */

function HowItWorks() {
  const steps = [
    {
      icon: Plug,
      title: "Connect your Facebook Page",
      description:
        "Sign in and authorize the Pages you manage. CivicPulse brings in posts and the comments available to you.",
    },
    {
      icon: Brain,
      title: "AI reads every comment",
      description:
        "Each comment is identified by language, scored for sentiment and matched to a public-service topic.",
    },
    {
      icon: Search,
      title: "Explore and act on insights",
      description:
        "Filter by topic, language or time period, review flagged comments, and share what you find with your team.",
    },
  ];

  return (
    <section id="how" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          center
          title="From connected Page to clear insight in three steps"
          description="No spreadsheets, no manual tagging. Connect once and keep a live view of how your community feels."
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative text-center md:px-4">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* =========================================================
   USE CASES
========================================================= */

function UseCases() {
  const cases = [
    {
      icon: Landmark,
      title: "City and municipal offices",
      description:
        "Learn which neighborhoods and services residents talk about most.",
    },
    {
      icon: Building2,
      title: "Service delivery teams",
      description:
        "Catch outages and complaints early and route them to the right team.",
    },
    {
      icon: Megaphone,
      title: "Communications and outreach",
      description:
        "See which announcements land well and which questions keep coming back.",
    },
    {
      icon: Eye,
      title: "Policy and research",
      description:
        "Study how public opinion shifts across topics, places and languages.",
    },
  ];

  return (
    <section
      id="use-cases"
      className="scroll-mt-20 border-t border-border bg-muted/30 px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          title="Made for teams that serve the public"
          description="Whether you run a city office or study civic opinion, CivicPulse helps you hear residents in their own words."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   RESPONSIBLE AI
========================================================= */

function ResponsibleAI() {
  const points = [
    {
      icon: UserCheck,
      title: "People stay in charge",
      text: "Results support human review. Nothing is decided automatically.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy-conscious by design",
      text: "Only content from authorized Pages is analyzed.",
    },
    {
      icon: Eye,
      title: "Clear about its limits",
      text: "Translations and sentiment can be wrong, so context always matters.",
    },
  ];

  return (
    <section id="trust" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            title="AI that supports public service, not replaces it"
            description="Public feedback deserves care. CivicPulse is designed to help your team understand people, and to keep your team responsible for what happens next."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Works only with Pages you are authorized to manage",
              "Shows translations so reviewers can verify meaning",
              "Lets you request data deletion at any time",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm leading-6">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl"
          />
          <div className="relative space-y-6">
            {points.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/10 text-chart-2">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-background/65">
                      {p.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CTA
========================================================= */

function FinalCta() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-border bg-foreground px-6 py-16 text-center text-background sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/50 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-chart-2/25 blur-[90px]"
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-5xl">
            Hear your community clearly.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-background/70">
            Connect your Facebook Page and see what citizens are saying about
            your services today.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button className="group h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 sm:w-auto">
                Connect your page
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a
              href="#demo"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-background/20 px-6 text-sm font-semibold text-background transition-colors hover:bg-background/10 sm:w-auto"
            >
              See a live example
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function SiteFooter() {
  const columns = [
    {
      title: "Product",
      links: [
        { href: "#product", label: "Features" },
        { href: "#demo", label: "Live example" },
        { href: "#how", label: "How it works" },
        { href: "#use-cases", label: "Who it's for" },
      ],
    },
    {
      title: "Trust",
      links: [
        { href: "#trust", label: "Responsible AI" },
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/data-deletion", label: "Data Deletion" },
      ],
    },
    {
      title: "Account",
      links: [{ href: "/auth/login", label: "Sign in" }],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <BrandMark size={34} />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Public voice intelligence for teams that want to understand the
              people they serve.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CivicPulse. All rights reserved.</p>
          <p>AI-assisted analysis supports human judgment.</p>
        </div>
      </div>
    </footer>
  );
}