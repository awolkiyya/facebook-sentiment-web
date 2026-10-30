
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Threads from "../Threads";

export interface LegalHeroAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface LegalHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  updatedAt?: string;
  backHref?: string;
  backLabel?: string;
  actions?: LegalHeroAction[];
}

export default function LegalHero({
  eyebrow = "LEGAL & TRANSPARENCY",
  title,
  description,
  updatedAt,
  backHref = "/login",
  backLabel = "Back to sign in",
  actions = [],
}: LegalHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background">
      {/* Animated Threads background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,black_15%,transparent_95%)]"
      >
        <Threads
          color="#64748b"
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
          opacity={0.2}
          seed={0}
        />
      </div>

      {/* Theme-aware overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-background/65"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -top-56 -z-10 size-[600px] rounded-full bg-primary/[0.07] blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-40 -z-10 size-[500px] rounded-full bg-primary/[0.04] blur-[100px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        {/* Back navigation */}
        <Link
          href={backHref}
          className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card/70 transition-all group-hover:border-primary/30 group-hover:bg-primary/5">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
          {backLabel}
        </Link>

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Main content */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-2">
              <ShieldCheck className="size-4 text-primary" />
              <span className="text-[11px] font-bold tracking-[0.16em] text-primary">
                {eyebrow}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {description}
            </p>

            {/* Document metadata */}
            {updatedAt && (
              <div className="mt-7 inline-flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  <span>Last updated</span>
                  <span className="font-semibold text-foreground">
                    {updatedAt}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="hidden size-1 rounded-full bg-border sm:block"
                />

                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>Official platform information</span>
                </div>
              </div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {actions.map((action) => {
                  const isPrimary = action.variant !== "secondary";

                  return (
                    <Link
                      key={`${action.href}-${action.label}`}
                      href={action.href}
                      className={
                        isPrimary
                          ? "group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          : "group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent"
                      }
                    >
                      {action.label}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legal document visual */}
          <div className="relative hidden lg:flex lg:justify-center">
            <div className="relative flex size-[290px] items-center justify-center">
              {/* Circular rings */}
              <div className="absolute inset-0 rounded-full border border-border/80" />
              <div className="absolute inset-7 rounded-full border border-primary/15" />
              <div className="absolute inset-14 rounded-full border border-primary/20" />

              {/* Decorative orbit */}
              <div className="absolute inset-2 rotate-45 rounded-full border border-dashed border-border/70" />

              {/* Main document card */}
              <div className="relative flex h-48 w-40 flex-col rounded-2xl border border-border bg-card/90 p-5 shadow-2xl shadow-primary/[0.08] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>

                  <ShieldCheck className="size-5 text-primary/70" />
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="h-2 w-3/4 rounded-full bg-foreground/15" />
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="h-2 w-5/6 rounded-full bg-muted" />
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="h-2 w-2/3 rounded-full bg-muted" />
                </div>

                <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                    TRANSPARENCY
                  </span>
                </div>
              </div>

              {/* Floating status indicators */}
              <div className="absolute -right-1 top-12 flex size-10 items-center justify-center rounded-xl border border-border bg-card shadow-lg">
                <ShieldCheck className="size-5 text-primary" />
              </div>

              <div className="absolute -bottom-1 left-4 flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-lg">
                <CheckCircle2 className="size-4 text-primary" />
              </div>

              <span className="absolute left-9 top-8 size-2 rounded-full bg-primary/70" />
              <span className="absolute bottom-10 right-8 size-2.5 rounded-full bg-primary/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
