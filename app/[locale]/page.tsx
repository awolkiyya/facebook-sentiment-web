"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Languages,
  Lock,
  LogIn,
  Menu,
  MessageSquareText,
  PieChart,
  Plug,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingDown,
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
   THEME HELPER
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
      ctx.fillStyle = raw;
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
   SAMPLE DATA (illustrative, deterministic so SSR matches)
========================================================= */

type Sentiment = "positive" | "neutral" | "negative";

const SENTIMENT: Record<
  Sentiment,
  { label: string; chip: string; dot: string; stroke: string }
> = {
  positive: {
    label: "Positive",
    chip: "bg-primary/10 text-primary",
    dot: "bg-primary",
    stroke: "var(--primary)",
  },
  neutral: {
    label: "Neutral",
    chip: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
    stroke: "var(--muted-foreground)",
  },
  negative: {
    label: "Negative",
    chip: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    stroke: "var(--destructive)",
  },
};

function seeded(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const POS_30 = Array.from({ length: 30 }, (_, i) =>
  Math.round(40 + i * 0.6 + Math.sin(i / 2.3) * 4 + seeded(i) * 4),
);
const NEG_30 = Array.from({ length: 30 }, (_, i) =>
  Math.round(28 - i * 0.4 + Math.cos(i / 2.9) * 3 + seeded(i + 50) * 3),
);

const TOPICS = [
  { label: "Roads and construction", share: 31, change: +4 },
  { label: "Water supply", share: 24, change: +9 },
  { label: "Waste collection", share: 18, change: -2 },
  { label: "Health services", share: 12, change: +1 },
  { label: "Electricity", share: 9, change: -3 },
];

const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT = TOPICS.map((_, r) =>
  HEAT_DAYS.map((_, c) => 0.12 + seeded(r * 7 + c + 3) * 0.88),
);

const LANGUAGES = [
  { name: "Amharic", native: "አማርኛ", volume: 41, split: [61, 24, 15] },
  { name: "Afaan Oromo", native: "Afaan Oromo", volume: 33, split: [52, 28, 20] },
  { name: "English", native: "English", volume: 26, split: [58, 29, 13] },
];

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#trust", label: "Responsible AI" },
];

/* =========================================================
   MOTION
========================================================= */

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground antialiased">
      <SiteHeader />
      <Hero />
      <ProductTabs />
      <HowItWorks />
      <TrustAndCta />
      <SiteFooter />
    </main>
  );
}

/* =========================================================
   HEADER
========================================================= */

function BrandMark({ size = 34 }: { size?: number }) {
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
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <BrandMark />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
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
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
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
            className="border-t border-border bg-background px-5 pb-5 pt-3 md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
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
   GRAPHICS PRIMITIVES
========================================================= */

function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
}

/** Interactive two-series line chart with hover crosshair and tooltip. */
function InteractiveTrend({ range }: { range: 7 | 30 }) {
  const W = 640;
  const H = 230;
  const P = { t: 14, r: 12, b: 26, l: 34 };
  const pos = POS_30.slice(-range);
  const neg = NEG_30.slice(-range);
  const n = pos.length;
  const step = (W - P.l - P.r) / (n - 1);
  const x = (i: number) => P.l + i * step;
  const y = (v: number) => P.t + (1 - v / 80) * (H - P.t - P.b);

  const [hover, setHover] = useState<number | null>(null);

  const posPts = pos.map((v, i) => [x(i), y(v)] as [number, number]);
  const negPts = neg.map((v, i) => [x(i), y(v)] as [number, number]);
  const posLine = smoothPath(posPts);
  const negLine = smoothPath(negPts);

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round((vx - P.l) / step);
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const label = (i: number) =>
    i === n - 1 ? "Today" : `${n - 1 - i} day${n - 1 - i === 1 ? "" : "s"} ago`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Illustrative ${range} day trend. Positive sentiment moves from ${pos[0]} to ${pos[n - 1]} percent. Negative sentiment moves from ${neg[0]} to ${neg[n - 1]} percent.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        className="w-full touch-pan-y"
      >
        <defs>
          <linearGradient id="cp-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line
              x1={P.l}
              x2={W - P.r}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--border)"
              strokeDasharray="3 5"
            />
            <text
              x={P.l - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="var(--muted-foreground)"
            >
              {v}%
            </text>
          </g>
        ))}

        <motion.path
          key={`area-${range}`}
          d={`${posLine} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z`}
          fill="url(#cp-trend-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.path
          key={`neg-${range}`}
          d={negLine}
          fill="none"
          stroke="var(--destructive)"
          strokeWidth="2.25"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        <motion.path
          key={`pos-${range}`}
          d={posLine}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />

        {[0, Math.floor((n - 1) / 2), n - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            fontSize="10"
            fill="var(--muted-foreground)"
          >
            {label(i)}
          </text>
        ))}

        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={P.t}
              y2={H - P.b}
              stroke="var(--foreground)"
              strokeOpacity="0.25"
            />
            <circle cx={x(hover)} cy={y(neg[hover])} r="5" fill="var(--card)" stroke="var(--destructive)" strokeWidth="2.5" />
            <circle cx={x(hover)} cy={y(pos[hover])} r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 min-w-[130px] -translate-x-1/2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xl"
          style={{
            left: `${Math.min(Math.max((x(hover) / W) * 100, 14), 86)}%`,
          }}
        >
          <p className="font-medium">{label(hover)}</p>
          <p className="mt-1.5 flex items-center justify-between gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Positive
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {pos[hover]}%
            </span>
          </p>
          <p className="mt-1 flex items-center justify-between gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Negative
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {neg[hover]}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function Donut({
  segments,
  center,
  sub,
}: {
  segments: { label: string; value: number; stroke: string }[];
  center: string;
  sub: string;
}) {
  const r = 52;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const lengths = segments.map((s) => (s.value / total) * C);
  const offsets = lengths.map((_, i) =>
    lengths.slice(0, i).reduce((a, b) => a + b, 0),
  );

  return (
    <div
      className="relative mx-auto h-40 w-40"
      role="img"
      aria-label={segments.map((s) => `${s.label} ${s.value} percent`).join(", ")}
    >
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="14" />
        {segments.map((s, i) => (
          <motion.circle
            key={s.label}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={s.stroke}
            strokeWidth="14"
            strokeDashoffset={-offsets[i]}
            initial={{ strokeDasharray: `0 ${C}` }}
            whileInView={{
              strokeDasharray: `${Math.max(lengths[i] - 3, 0)} ${C}`,
            }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.15 + i * 0.15, ease: "easeOut" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {center}
        </span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  const threadsColor = useThemeColor("--primary", "#0066FF");
  const reduce = useReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "start 0.25"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);

  return (
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_92%)]"
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
          opacity={0.32}
          seed={0}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
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
          Sentiment analysis in Amharic, Afaan Oromo and English
        </motion.span>

        <motion.h1
          variants={heroItem}
          className="mt-7 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[68px]"
        >
          Know what your citizens think, in real time.
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          CivicPulse analyzes every comment on your Facebook Page for language,
          sentiment and topic, so you see what matters first.
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
            href="#product"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card/70 px-6 text-sm font-semibold backdrop-blur transition-colors hover:bg-muted sm:w-auto"
          >
            See the product
          </a>
        </motion.div>
      </motion.div>

      {/* Dashboard preview with scroll-linked tilt */}
      <div
        ref={previewRef}
        className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
        style={{ perspective: 1600 }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-8 -top-8 bottom-10 -z-10 rounded-[48px] bg-primary/20 blur-[90px]"
        />
        <motion.div
          style={
            reduce
              ? undefined
              : { rotateX, scale, transformOrigin: "50% 0%" }
          }
        >
          <Dashboard />
        </motion.div>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Product preview with illustrative data.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   DASHBOARD (hero)
========================================================= */

function Dashboard() {
  const [range, setRange] = useState<7 | 30>(7);

  const kpis = [
    { label: "Positive", value: "58%", delta: "+6 pts", up: true },
    { label: "Negative", value: "15%", delta: "-4 pts", up: false },
    { label: "Needs review", value: "42", delta: "7 high", up: true },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/15 ring-1 ring-foreground/[0.03]">
      {/* Window bar */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-xs items-center justify-center gap-2 rounded-md border border-border bg-background text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          CivicPulse overview
        </div>
        <div className="hidden w-10 sm:block" aria-hidden="true" />
      </div>

      <div className="space-y-3 p-4 text-left sm:p-5">
        {/* Three simple numbers */}
        <div className="grid grid-cols-3 gap-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border bg-background p-3.5 sm:p-4"
            >
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className="mt-1.5 flex flex-wrap items-end justify-between gap-1.5">
                <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {k.value}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                    k.up
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {k.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {k.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trend + donut */}
        <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">Sentiment over time</p>
              <div
                role="group"
                aria-label="Time range"
                className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs font-medium"
              >
                {([7, 30] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={range === r}
                    onClick={() => setRange(r)}
                    className={`rounded-md px-3 py-1 transition-colors ${
                      range === r
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r} days
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <InteractiveTrend range={range} />
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-medium">Sentiment split</p>
            <div className="my-4 flex flex-1 items-center">
              <Donut
                center="58%"
                sub="positive"
                segments={[
                  { label: "Positive", value: 58, stroke: SENTIMENT.positive.stroke },
                  { label: "Neutral", value: 27, stroke: "var(--muted-foreground)" },
                  { label: "Negative", value: 15, stroke: SENTIMENT.negative.stroke },
                ]}
              />
            </div>
            <ul className="grid grid-cols-3 gap-2 text-xs">
              {(
                [
                  ["positive", 58],
                  ["neutral", 27],
                  ["negative", 15],
                ] as [Sentiment, number][]
              ).map(([key, v]) => (
                <li key={key}>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${SENTIMENT[key].dot}`} />
                    {SENTIMENT[key].label}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold tabular-nums">
                    {v}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
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
   PRODUCT TABS
========================================================= */

type TabId = "sentiment" | "topics" | "languages";

const TABS: { id: TabId; icon: LucideIcon; title: string; text: string }[] = [
  {
    id: "sentiment",
    icon: PieChart,
    title: "Sentiment",
    text: "See how people feel overall and how it changes day to day.",
  },
  {
    id: "topics",
    icon: Tag,
    title: "Topics",
    text: "Find which services people talk about, and where concern is growing.",
  },
  {
    id: "languages",
    icon: Languages,
    title: "Languages",
    text: "Compare volume and mood across Amharic, Afaan Oromo and English.",
  },
];

function ProductTabs() {
  const [tab, setTab] = useState<TabId>("sentiment");

  return (
    <section id="product" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          center
          title="Three views of public opinion"
          description="Switch between sentiment, topics and languages to see the full picture."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div
            role="tablist"
            aria-label="Product views"
            className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`relative min-w-[240px] rounded-2xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:min-w-0 ${
                    active
                      ? "border-primary/40 bg-card shadow-lg shadow-primary/10"
                      : "border-border bg-card/50 hover:bg-card"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-accent"
                      className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary"
                    />
                  )}
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-base font-semibold">{t.title}</span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-muted-foreground">
                    {t.text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-h-[430px] overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-xl shadow-foreground/[0.05] sm:p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {tab === "sentiment" && <SentimentPanel />}
                {tab === "topics" && <TopicsPanel />}
                {tab === "languages" && <LanguagesPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function SentimentPanel() {
  const [range, setRange] = useState<7 | 30>(30);
  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
      <div>
        <Donut
          center="58%"
          sub="positive"
          segments={[
            { label: "Positive", value: 58, stroke: SENTIMENT.positive.stroke },
            { label: "Neutral", value: 27, stroke: "var(--muted-foreground)" },
            { label: "Negative", value: 15, stroke: SENTIMENT.negative.stroke },
          ]}
        />
        <ul className="mt-5 space-y-2 text-sm">
          {(
            [
              ["positive", 58],
              ["neutral", 27],
              ["negative", 15],
            ] as [Sentiment, number][]
          ).map(([k, v]) => (
            <li key={k} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${SENTIMENT[k].dot}`} />
                {SENTIMENT[k].label}
              </span>
              <span className="font-semibold tabular-nums">{v}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Sentiment trend</p>
          <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-xs font-medium">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1 transition-colors ${
                  range === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>
        <InteractiveTrend range={range} />
      </div>
    </div>
  );
}

function TopicsPanel() {
  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Negative mentions by day</p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Low
            <span
              aria-hidden="true"
              className="h-2 w-16 rounded-full bg-gradient-to-r from-destructive/10 to-destructive"
            />
            High
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="grid grid-cols-[110px_repeat(7,1fr)] gap-1.5 text-[10px] text-muted-foreground">
            <span />
            {HEAT_DAYS.map((d) => (
              <span key={d} className="text-center">
                {d}
              </span>
            ))}
          </div>
          {TOPICS.map((t, r) => (
            <div
              key={t.label}
              className="grid grid-cols-[110px_repeat(7,1fr)] items-center gap-1.5"
            >
              <span className="truncate pr-2 text-xs text-foreground/80">
                {t.label}
              </span>
              {HEAT[r].map((v, c) => (
                <div
                  key={c}
                  title={`${t.label}, ${HEAT_DAYS[c]}: ${Math.round(v * 100)} index`}
                  className="relative h-8 overflow-hidden rounded-md bg-muted"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: v }}
                    transition={{ duration: 0.5, delay: (r * 7 + c) * 0.015 }}
                    className="absolute inset-0 bg-destructive"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Share of conversation</p>
        <ul className="mt-4 divide-y divide-border">
          {TOPICS.map((t, i) => (
            <li
              key={t.label}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="truncate">{t.label}</span>
              </span>
              <span className="flex items-center gap-3 tabular-nums">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    t.change >= 0 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {t.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(t.change)}
                </span>
                <span className="w-9 text-right font-semibold">{t.share}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LanguagesPanel() {
  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">
      <div>
        <Donut
          center="3"
          sub="languages"
          segments={LANGUAGES.map((l, i) => ({
            label: l.name,
            value: l.volume,
            stroke:
              i === 0
                ? "var(--primary)"
                : i === 1
                  ? "var(--chart-2)"
                  : "var(--muted-foreground)",
          }))}
        />
        <ul className="mt-5 space-y-2 text-sm">
          {LANGUAGES.map((l, i) => (
            <li key={l.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className={`h-2 w-2 rounded-full ${
                    i === 0
                      ? "bg-primary"
                      : i === 1
                        ? "bg-chart-2"
                        : "bg-muted-foreground"
                  }`}
                />
                {l.name}
              </span>
              <span className="font-semibold tabular-nums">{l.volume}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium">Sentiment by language</p>
        <div className="mt-5 space-y-6">
          {LANGUAGES.map((l, i) => (
            <div key={l.name}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-semibold">{l.native}</span>
                <span className="text-xs text-muted-foreground">
                  {l.volume}% of comments
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {(
                  [
                    ["bg-primary", l.split[0]],
                    ["bg-muted-foreground/50", l.split[1]],
                    ["bg-destructive", l.split[2]],
                  ] as [string, number][]
                ).map(([cls, w], j) => (
                  <motion.div
                    key={j}
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 0.8, delay: i * 0.12 + j * 0.05, ease: "easeOut" }}
                    className={cls}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground tabular-nums">
                <span>{l.split[0]}% positive</span>
                <span>{l.split[1]}% neutral</span>
                <span>{l.split[2]}% negative</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HOW IT WORKS
========================================================= */

function HowItWorks() {
  const steps = [
    {
      icon: Plug,
      title: "Connect your Page",
      text: "Authorize the Facebook Pages you manage.",
    },
    {
      icon: Brain,
      title: "AI reads every comment",
      text: "Language, sentiment and topic, automatically.",
    },
    {
      icon: Search,
      title: "Explore and act",
      text: "Filter, review flagged comments and share insights.",
    },
  ];

  return (
    <section id="how" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          center
          title="Up and running in three steps"
          description="Connect once and keep a live view of how your community feels."
        />

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <svg
            aria-hidden="true"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-[2px] w-[66.8%] md:block"
          >
            <motion.line
              x1="0"
              x2="100"
              y1="1"
              y2="1"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </svg>

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="relative text-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.25, type: "spring", stiffness: 300, damping: 22 }}
                  className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm"
                >
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                </motion.span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-muted-foreground">
                  {s.text}
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
   TRUST + CTA
========================================================= */

function TrustAndCta() {
  const reduce = useReducedMotion();
  const trust: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: UserCheck,
      title: "People decide",
      text: "AI organizes feedback. Your team makes the call.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy-conscious",
      text: "Only content from Pages you are authorized to manage.",
    },
    {
      icon: MessageSquareText,
      title: "Transparent",
      text: "Translations are shown so reviewers can verify meaning.",
    },
  ];

  const pulse =
    "M0 100 H330 L380 100 L420 40 L470 170 L520 20 L565 100 H1200";

  return (
    <section id="trust" className="scroll-mt-20 px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {trust.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {t.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[32px] bg-foreground px-6 py-16 text-center text-background sm:px-12 sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/50 blur-[100px]"
          />

          {/* Looping pulse line */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 opacity-60"
          >
            <path d={pulse} fill="none" stroke="var(--background)" strokeOpacity="0.1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={pulse}
              fill="none"
              stroke="var(--chart-2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduce ? 1 : 0, pathOffset: 0 }}
              animate={reduce ? undefined : { pathLength: [0, 0.35, 0.35], pathOffset: [0, 0.3, 1] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-5xl">
              Hear your community clearly.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-background/70">
              Connect your Facebook Page and see what citizens are saying
              today.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button className="group h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 sm:w-auto">
                  Connect your page
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href="#product"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-background/20 px-6 text-sm font-semibold transition-colors hover:bg-background/10 sm:w-auto"
              >
                See the product
              </a>
            </div>
            <p className="mt-6 text-xs text-background/50">
              AI-assisted analysis supports human judgment. It does not replace
              it.
            </p>
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
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Public voice intelligence for teams that serve people.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/privacy-policy" className="transition-colors hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/data-deletion" className="transition-colors hover:text-primary">
            Data Deletion
          </Link>
        </nav>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} CivicPulse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}