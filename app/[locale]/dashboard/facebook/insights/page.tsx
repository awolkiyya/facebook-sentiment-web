"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  ExternalLink,
  Languages,
  MessageSquareText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { aiInsightService } from "@/services/ai-insight.service";

import type {
  InsightLanguage,
  InsightListFilters,
  InsightListResponse,
  InsightSentiment,
  InsightStatus,
  PostInsightData,
} from "@/types/ai-insight.types";

/* -------------------------------------------------------------------------- */
/* Types & options                                                            */
/* -------------------------------------------------------------------------- */

type LanguageFilter = "ALL" | InsightLanguage;
type StatusFilter = "ALL" | InsightStatus;
type LoadMode = "initial" | "refresh" | "silent";

const PAGE_SIZE = 100;
const POLL_INTERVAL_MS = 15_000;

const LANGUAGE_OPTIONS: { value: LanguageFilter; label: string }[] = [
  { value: "ALL", label: "All languages" },
  { value: "en", label: "English" },
  { value: "am", label: "Amharic" },
  { value: "or", label: "Afaan Oromo" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES: Record<InsightStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-green-500/10 text-green-700 dark:text-green-400",
  FAILED: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const STATUS_BAR: Record<InsightStatus, string> = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  FAILED: "bg-red-500",
};

const SENTIMENT_STYLES: Record<InsightSentiment, string> = {
  POSITIVE: "bg-green-500/10 text-green-700 dark:text-green-400",
  NEUTRAL: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  NEGATIVE: "bg-red-500/10 text-red-700 dark:text-red-400",
  MIXED: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-600/10 text-red-700 dark:text-red-400",
  HIGH: "bg-red-500/10 text-red-700 dark:text-red-400",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  LOW: "bg-muted text-muted-foreground",
};

const CONTROL_CLASS =
  "h-10 min-w-0 rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-3.5 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-ET", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

function formatTime(value: Date | null): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-ET", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Addis_Ababa",
  }).format(value);
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return "Not available";

  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatConfidence(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return `${(value * 100).toFixed(1)}%`;
}

function getLanguageLabel(
  language: InsightLanguage | null | undefined,
): string {
  switch (language) {
    case "en":
      return "English";
    case "am":
      return "Amharic";
    case "or":
      return "Afaan Oromo";
    default:
      return "Unknown language";
  }
}

function getSentiment(
  value: string | null | undefined,
): InsightSentiment | null {
  if (
    value === "POSITIVE" ||
    value === "NEUTRAL" ||
    value === "NEGATIVE" ||
    value === "MIXED"
  ) {
    return value;
  }

  return null;
}

function getStatus(value: string | null | undefined): InsightStatus {
  if (
    value === "PENDING" ||
    value === "PROCESSING" ||
    value === "COMPLETED" ||
    value === "FAILED"
  ) {
    return value;
  }

  return "PENDING";
}

function getPriorityClass(value: string | null | undefined): string {
  return (
    PRIORITY_STYLES[value?.toUpperCase() ?? ""] ??
    "bg-muted text-muted-foreground"
  );
}

function isHighPriority(value: string | null | undefined): boolean {
  const priority = value?.toUpperCase() ?? "";
  return priority === "HIGH" || priority === "CRITICAL";
}

function getPostTitle(insight: PostInsightData): string {
  const message = insight.post?.message?.trim();

  if (message) {
    return message.length > 140
      ? `${message.slice(0, 140).trimEnd()}…`
      : message;
  }

  return "Facebook post";
}

function getPageName(insight: PostInsightData): string {
  return insight.post?.page?.name || "Facebook page unavailable";
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function getKeyFindings(insight: PostInsightData): string[] {
  return toStringArray(insight.key_findings);
}

function getRecommendations(insight: PostInsightData): string[] {
  return toStringArray(insight.recommendations);
}

/* -------------------------------------------------------------------------- */
/* Small reusable components                                                  */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  icon: Icon,
  onChange,
  disabled,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  icon: LucideIcon;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-label={label}
        disabled={disabled}
        className={cn(
          CONTROL_CLASS,
          "w-full cursor-pointer appearance-none pl-9 pr-9",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>

      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
          {value}
        </p>
      )}

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function ListSkeleton() {
  const bar = "animate-pulse rounded bg-muted motion-reduce:animate-none";

  return (
    <div
      className="divide-y"
      role="status"
      aria-live="polite"
      aria-label="Loading saved insights"
    >
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="space-y-3 p-4 sm:p-5">
          <div className="flex gap-2">
            <div className={cn(bar, "h-5 w-20 rounded-full")} />
            <div className={cn(bar, "h-5 w-24 rounded-full")} />
          </div>
          <div className={cn(bar, "h-4 w-3/4")} />
          <div className={cn(bar, "h-3 w-1/3")} />
          <div className={cn(bar, "h-3 w-full")} />
          <div className={cn(bar, "h-3 w-5/6")} />
        </div>
      ))}
      <span className="sr-only">Loading saved insights…</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Insight details drawer                                                     */
/* -------------------------------------------------------------------------- */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function InsightDetails({
  insight,
  onClose,
}: {
  insight: PostInsightData;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const sentiment = getSentiment(insight.sentiment);
  const status = getStatus(insight.status);
  const findings = getKeyFindings(insight);
  const recommendations = getRecommendations(insight);
  const confidence = formatConfidence(insight.confidence);

  // Focus management, scroll lock, Escape and focus trap.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="insight-dialog-title"
        className="flex h-dvh w-full max-w-xl flex-col border-l bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge className={STATUS_STYLES[status]}>
                {formatLabel(status)}
              </Badge>

              {sentiment && (
                <Badge className={SENTIMENT_STYLES[sentiment]}>
                  {formatLabel(sentiment)}
                </Badge>
              )}

              {insight.priority && (
                <Badge className={getPriorityClass(insight.priority)}>
                  {formatLabel(insight.priority)} priority
                </Badge>
              )}

              <Badge className="bg-muted text-muted-foreground">
                <Languages className="size-3" aria-hidden="true" />
                {getLanguageLabel(insight.language)}
              </Badge>
            </div>

            <h2
              id="insight-dialog-title"
              className="break-words text-base font-semibold leading-6 sm:text-lg"
            >
              {getPostTitle(insight)}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {getPageName(insight)}
              {insight.primary_topic
                ? ` · ${formatLabel(insight.primary_topic)}`
                : ""}
            </p>

            {insight.post?.permalink_url && (
              <a
                href={insight.post.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
              >
                View original post
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close insight details"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
          <dl className="grid grid-cols-3 divide-x rounded-xl border">
            <div className="p-3 sm:p-4">
              <dt className="text-xs text-muted-foreground">Comments</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {formatNumber(insight.analyzed_comments ?? 0)}
              </dd>
            </div>

            <div className="p-3 sm:p-4">
              <dt className="text-xs text-muted-foreground">Confidence</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {confidence ?? "—"}
              </dd>
            </div>

            <div className="p-3 sm:p-4">
              <dt className="text-xs text-muted-foreground">Generated</dt>
              <dd className="mt-1 text-xs font-medium leading-5 sm:text-sm">
                {formatDate(insight.generated_at)}
              </dd>
            </div>
          </dl>

          {insight.key_concern && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Key concern
              </p>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-7">
                {insight.key_concern}
              </p>
            </div>
          )}

          <DetailSection title="AI summary">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
              {insight.summary || "No summary is available."}
            </p>
          </DetailSection>

          <DetailSection title="Key findings">
            {findings.length > 0 ? (
              <ul className="space-y-2.5">
                {findings.map((finding, index) => (
                  <li
                    key={`${insight.id}-finding-${index}`}
                    className="flex gap-3 text-sm leading-6"
                  >
                    <span
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-words">{finding}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No key findings are available.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Recommendations">
            {recommendations.length > 0 ? (
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li
                    key={`${insight.id}-recommendation-${index}`}
                    className="rounded-r-lg border-l-2 border-primary bg-muted/40 py-2.5 pl-3.5 pr-3 text-sm leading-6"
                  >
                    <span className="break-words">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recommendations are available.
              </p>
            )}
          </DetailSection>

          {status === "FAILED" && insight.error_message && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className="size-4 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Generation error
                </p>
              </div>
              <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                {insight.error_message}
              </p>
            </div>
          )}

          <DetailSection title="Analysis metadata">
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {[
                ["Model", insight.model?.name],
                ["Model version", insight.model?.version],
                ["Analysis version", insight.model?.analysis_version],
                [
                  "Generation attempts",
                  String(insight.generation_attempts ?? 0),
                ],
                ["Actionable", insight.actionable ? "Yes" : "No"],
                ["Record ID", insight.id],
              ].map(([term, description]) => (
                <div key={term} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{term}</dt>
                  <dd className="mt-0.5 break-all font-medium">
                    {description || "Not available"}
                  </dd>
                </div>
              ))}
            </dl>
          </DetailSection>

          <p className="border-t pt-4 text-xs leading-5 text-muted-foreground">
            AI-generated findings and recommendations support municipal
            review. Verify the original discussion before making operational
            decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Insight row                                                                */
/* -------------------------------------------------------------------------- */

function InsightRow({
  item,
  onOpen,
}: {
  item: PostInsightData;
  onOpen: (item: PostInsightData) => void;
}) {
  const sentiment = getSentiment(item.sentiment);
  const status = getStatus(item.status);
  const confidence = formatConfidence(item.confidence);

  return (
    <article className="group relative flex items-start gap-3 py-4 pl-5 pr-4 transition-colors hover:bg-muted/40 focus-within:bg-muted/40 sm:py-5 sm:pl-6 sm:pr-5">
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          STATUS_BAR[status],
          status === "COMPLETED" && "opacity-60",
        )}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge className={STATUS_STYLES[status]}>{formatLabel(status)}</Badge>

          {sentiment && (
            <Badge className={SENTIMENT_STYLES[sentiment]}>
              {formatLabel(sentiment)}
            </Badge>
          )}

          {item.priority && (
            <Badge className={getPriorityClass(item.priority)}>
              {formatLabel(item.priority)} priority
            </Badge>
          )}

          <Badge className="bg-muted text-muted-foreground">
            {getLanguageLabel(item.language)}
          </Badge>
        </div>

        <h3 className="break-words text-sm font-medium leading-6 sm:text-base">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
          >
            {getPostTitle(item)}
          </button>
        </h3>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {getPageName(item)}
          {item.primary_topic ? ` · ${formatLabel(item.primary_topic)}` : ""}
        </p>

        <p className="mt-2.5 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {item.summary || "No summary is available."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            {formatNumber(item.analyzed_comments ?? 0)} comments
          </span>

          {confidence && (
            <span className="inline-flex items-center gap-1.5">
              <BrainCircuit className="size-3.5" aria-hidden="true" />
              {confidence} confidence
            </span>
          )}

          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {formatDate(item.generated_at)}
          </span>
        </div>
      </div>

      <ChevronRight
        className="mt-1 hidden size-5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:block"
        aria-hidden="true"
      />
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function FacebookInsightsPage() {
  const [insights, setInsights] = useState<PostInsightData[]>([]);
  const [meta, setMeta] = useState<InsightListResponse["meta"] | null>(null);

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<LanguageFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedInsight, setSelectedInsight] =
    useState<PostInsightData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ignore responses from superseded requests (e.g. fast language switching).
  const requestIdRef = useRef(0);

  const loadInsights = useCallback(
    async (mode: LoadMode = "initial") => {
      const requestId = ++requestIdRef.current;

      if (mode === "refresh") setIsRefreshing(true);
      if (mode === "initial") setIsLoading(true);
      if (mode !== "silent") setError(null);

      try {
        const filters: InsightListFilters = {
          ...(language !== "ALL" ? { language } : {}),
          per_page: PAGE_SIZE,
        };

        const response = await aiInsightService.list(filters);

        if (requestId !== requestIdRef.current) return;

        setInsights(response.data);
        setMeta(response.meta);
        setLastUpdated(new Date());
        setError(null);

        setSelectedInsight((current) => {
          if (!current) return null;
          return response.data.find((item) => item.id === current.id) ?? null;
        });
      } catch (cause: unknown) {
        if (requestId !== requestIdRef.current) return;

        // Background polling should never replace the page with an error.
        if (mode !== "silent") {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to retrieve AI insights.",
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [language],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInsights("initial");
    }, 0);
  
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadInsights]);
  /* ------------------------------ Derived data ----------------------------- */

  const stats = useMemo(() => {
    const byStatus: Record<InsightStatus, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    };

    let totalAnalyzed = 0;
    let highPriority = 0;

    for (const item of insights) {
      const status = getStatus(item.status);
      byStatus[status] += 1;
      totalAnalyzed += item.analyzed_comments ?? 0;

      if (status === "COMPLETED" && isHighPriority(item.priority)) {
        highPriority += 1;
      }
    }

    return {
      byStatus,
      totalAnalyzed,
      highPriority,
      inProgress: byStatus.PENDING + byStatus.PROCESSING,
    };
  }, [insights]);

  // Quietly refresh while something is still being generated.
  useEffect(() => {
    if (stats.inProgress === 0) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadInsights("silent");
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [stats.inProgress, loadInsights]);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label:
          option.value === "ALL"
            ? `${option.label} (${formatNumber(insights.length)})`
            : `${option.label} (${formatNumber(stats.byStatus[option.value])})`,
      })),
    [insights.length, stats.byStatus],
  );

  const filteredInsights = useMemo(() => {
    const query = search.trim().toLowerCase();

    return insights.filter((item) => {
      if (statusFilter !== "ALL" && getStatus(item.status) !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const searchableText = [
        item.id,
        item.facebook_post_id,
        item.post?.message ?? "",
        item.post?.page?.name ?? "",
        item.primary_topic ?? "",
        item.key_concern ?? "",
        item.summary ?? "",
        ...getKeyFindings(item),
        ...getRecommendations(item),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [insights, search, statusFilter]);

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "ALL";
  const isTruncated = Boolean(meta && meta.total > insights.length);
  const updatedAt = formatTime(lastUpdated);

  const closeDialog = useCallback(() => setSelectedInsight(null), []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("ALL");
  }, []);

  /* --------------------------------- Render -------------------------------- */

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            Facebook
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Insights
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            AI-generated analysis of public feedback: what residents are
            raising and what to do about it.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Updated {updatedAt}
            </span>
          )}

          <button
            type="button"
            onClick={() => void loadInsights("refresh")}
            disabled={isLoading || isRefreshing}
            className={cn(BUTTON_CLASS, "w-full sm:w-auto")}
          >
            <RefreshCw
              className={cn(
                "size-4",
                isRefreshing && "animate-spin motion-reduce:animate-none",
              )}
              aria-hidden="true"
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Unable to load insights</p>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInsights("refresh")}
            disabled={isRefreshing}
            className="shrink-0 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics */}
      <section
        aria-label="Insight metrics"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <MetricCard
          title="Saved insights"
          value={formatNumber(meta?.total ?? insights.length)}
          description={
            language === "ALL"
              ? "Across all languages"
              : `In ${getLanguageLabel(language)}`
          }
          icon={BrainCircuit}
          loading={isLoading}
        />

        <MetricCard
          title="Comments analyzed"
          value={formatNumber(stats.totalAnalyzed)}
          description="In the loaded records"
          icon={MessageSquareText}
          loading={isLoading}
        />

        <MetricCard
          title="High priority"
          value={formatNumber(stats.highPriority)}
          description="Completed, high or critical"
          icon={AlertTriangle}
          loading={isLoading}
        />

        <MetricCard
          title="In progress"
          value={formatNumber(stats.inProgress)}
          description={
            stats.byStatus.FAILED > 0
              ? `${formatNumber(stats.byStatus.FAILED)} failed`
              : "Pending or processing"
          }
          icon={Activity}
          loading={isLoading}
        />
      </section>

      {/* Insight list */}
      <section
        aria-label="Saved AI insights"
        className="overflow-hidden rounded-xl border bg-card"
      >
        {/* Toolbar */}
        <div className="space-y-3 border-b p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold tracking-tight">Saved insights</h2>

            {!isLoading && (
              <p
                className="text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {hasActiveFilters
                  ? `${formatNumber(filteredInsights.length)} of ${formatNumber(
                      insights.length,
                    )} shown`
                  : `${formatNumber(insights.length)} ${
                      insights.length === 1 ? "record" : "records"
                    }`}
              </p>
            )}
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search posts, topics, concerns…"
                aria-label="Search insights"
                className={cn(CONTROL_CLASS, "w-full pl-9")}
              />
            </div>

            <FilterSelect
              label="Filter by language"
              value={language}
              options={LANGUAGE_OPTIONS}
              icon={Languages}
              onChange={setLanguage}
              disabled={isLoading}
            />

            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              options={statusOptions}
              icon={CircleDot}
              onChange={setStatusFilter}
            />

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={cn(BUTTON_CLASS, "sm:col-span-2 lg:col-span-1")}
            >
              <X className="size-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <ListSkeleton />
        ) : error && insights.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Insights could not be loaded"
            description="Check your connection and try again."
            action={
              <button
                type="button"
                onClick={() => void loadInsights("refresh")}
                className={BUTTON_CLASS}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </button>
            }
          />
        ) : filteredInsights.length === 0 ? (
          insights.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No saved insights yet"
              description={
                language === "ALL"
                  ? "Insights appear here after they are generated from a Facebook post."
                  : `No ${getLanguageLabel(language)} insights found. Try another language or choose All languages.`
              }
              action={
                language !== "ALL" ? (
                  <button
                    type="button"
                    onClick={() => setLanguage("ALL")}
                    className={BUTTON_CLASS}
                  >
                    Show all languages
                  </button>
                ) : undefined
              }
            />
          ) : (
            <EmptyState
              title="No matching insights"
              description="Try a different search term or status."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className={BUTTON_CLASS}
                >
                  Clear filters
                </button>
              }
            />
          )
        ) : (
          <div className="divide-y">
            {filteredInsights.map((item) => (
              <InsightRow
                key={item.id}
                item={item}
                onOpen={setSelectedInsight}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {!isLoading && insights.length > 0 && (
          <footer className="flex flex-col gap-1 border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              {isTruncated
                ? `Showing the latest ${formatNumber(
                    insights.length,
                  )} of ${formatNumber(meta?.total ?? 0)} records`
                : `${formatNumber(insights.length)} loaded ${
                    insights.length === 1 ? "record" : "records"
                  }`}
            </span>

            <span>
              {formatNumber(stats.byStatus.COMPLETED)} completed ·{" "}
              {formatNumber(stats.inProgress)} in progress ·{" "}
              {formatNumber(stats.byStatus.FAILED)} failed
            </span>
          </footer>
        )}
      </section>

      {selectedInsight && (
        <InsightDetails insight={selectedInsight} onClose={closeDialog} />
      )}
    </main>
  );
}