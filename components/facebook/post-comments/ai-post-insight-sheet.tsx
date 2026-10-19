"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, formatEthiopianDateWithTime } from "@/lib/utils";
import { useAiInsight } from "@/hooks/use-ai-insight";

import type {
  InsightLanguage,
  InsightModel,
} from "@/types/ai-insight.types";

interface AiPostInsightPopoverProps {
  /** Internal UUID from facebook_posts.id */
  postId: string;
  /** Language the insight is generated and displayed in. */
  initialLanguage?: InsightLanguage;
  triggerLabel?: string;
}

const DEFAULT_MODEL: InsightModel = "qwen2.5:7b";

const MODEL_OPTIONS: {
  value: InsightModel;
  label: string;
  description: string;
}[] = [
  {
    value: "qwen2.5:7b",
    label: "Qwen 2.5 · 7B",
    description: "Faster. Good for most posts.",
  },
  {
    value: "qwen3:32b",
    label: "Qwen 3 · 32B",
    description: "Slower. More detailed analysis.",
  },
];

const SECTION_LABELS: Record<
  InsightLanguage,
  { summary: string; findings: string; recommendations: string }
> = {
  en: {
    summary: "Summary",
    findings: "Key findings",
    recommendations: "Recommendations",
  },
  am: {
    summary: "ማጠቃለያ",
    findings: "ዋና ግኝቶች",
    recommendations: "ምክሮች",
  },
  or: {
    summary: "Cuunfaa",
    findings: "Argannoowwan ijoo",
    recommendations: "Gorsa",
  },
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function SectionHeading({
  children,
  count,
}: {
  children: ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h4 className="text-sm font-semibold tracking-tight text-foreground">
        {children}
      </h4>

      {typeof count === "number" && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function InsightSkeleton({ message }: { message: string }) {
  const bar = "animate-pulse rounded bg-muted motion-reduce:animate-none";

  return (
    <div role="status" aria-live="polite" className="space-y-7">
      <div className="space-y-2.5">
        <div className={cn(bar, "h-3 w-20")} />
        <div className={cn(bar, "h-3.5 w-full")} />
        <div className={cn(bar, "h-3.5 w-11/12")} />
        <div className={cn(bar, "h-3.5 w-9/12")} />
      </div>

      <div className="space-y-3">
        <div className={cn(bar, "h-3 w-24")} />
        <div className={cn(bar, "h-3.5 w-10/12")} />
        <div className={cn(bar, "h-3.5 w-full")} />
        <div className={cn(bar, "h-3.5 w-8/12")} />
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2
          className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        {message}
      </p>
    </div>
  );
}

function InlineAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/5 p-3"
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />

      <p className="min-w-0 break-words text-xs leading-5 text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

export default function AiPostInsightPopover({
  postId,
  initialLanguage = "am",
  triggerLabel = "AI Insight",
}: AiPostInsightPopoverProps) {
  const [open, setOpen] = useState(false);

  const [selectedModel, setSelectedModel] =
    useState<InsightModel>(DEFAULT_MODEL);

  const [attemptState, setAttemptState] = useState<{
    postId: string;
    hasAttempted: boolean;
    copied: boolean;
  }>({
    postId,
    hasAttempted: false,
    copied: false,
  });

  const isCurrentPost = attemptState.postId === postId;
  const hasAttempted = isCurrentPost && attemptState.hasAttempted;
  const copied = isCurrentPost && attemptState.copied;

  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    insight,
    language,
    isGenerating,
    isLoading,
    error,
    loadLatest,
    generate,
  } = useAiInsight({ postId, initialLanguage });

  const busy = isGenerating || isLoading;

  const selectedModelOption =
    MODEL_OPTIONS.find((option) => option.value === selectedModel) ??
    MODEL_OPTIONS[0];

  const labels = SECTION_LABELS[language] ?? SECTION_LABELS.en;

  const hasSummary =
    typeof insight?.summary === "string" &&
    insight.summary.trim().length > 0;

  // Display only the insight belonging to the current hook result.
  // No render-time ref access or state-updating cache effect is required.
  const shownInsight = hasSummary ? insight : null;

  const summary =
    typeof shownInsight?.summary === "string"
      ? shownInsight.summary.trim()
      : "";

  const findings = normalizeStringArray(shownInsight?.key_findings);

  const recommendations = normalizeStringArray(
    shownInsight?.recommendations,
  );

  const hasInsight = summary.length > 0;
  const canGenerate = Boolean(postId.trim()) && !busy;

  const generatedAt = shownInsight?.generated_at
    ? formatEthiopianDateWithTime(shownInsight.generated_at)
    : null;

  const showSkeleton = busy && !hasInsight;
  const showError = !busy && Boolean(error) && !hasInsight;
  const showEmpty = !busy && !error && !hasInsight;
  const showContent = hasInsight;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (nextOpen && !hasInsight && !busy) {
        void loadLatest(language);
      }
    },
    [hasInsight, busy, loadLatest, language],
  );

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;

    setAttemptState({
      postId,
      hasAttempted: true,
      copied: false,
    });

    void generate(language, selectedModel, hasInsight);
  }, [
    canGenerate,
    generate,
    language,
    selectedModel,
    hasInsight,
    postId,
  ]);

  const handleModelChange = useCallback(
    (value: string) => {
      const next = MODEL_OPTIONS.find(
        (option) => option.value === value,
      )?.value;

      if (next && !busy) {
        setSelectedModel(next);
      }
    },
    [busy],
  );

  const handleRetryLoad = useCallback(() => {
    if (!busy) {
      void loadLatest(language);
    }
  }, [busy, language, loadLatest]);

  const handleCopy = useCallback(async () => {
    if (!hasInsight) return;

    const text = [
      `${labels.summary}\n${summary}`,
      findings.length
        ? `${labels.findings}\n${findings
            .map((item) => `- ${item}`)
            .join("\n")}`
        : "",
      recommendations.length
        ? `${labels.recommendations}\n${recommendations
            .map((item) => `- ${item}`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);

      setAttemptState((previous) => ({
        postId,
        hasAttempted:
          previous.postId === postId
            ? previous.hasAttempted
            : false,
        copied: true,
      }));

      if (copyTimer.current !== null) {
        clearTimeout(copyTimer.current);
      }

      copyTimer.current = setTimeout(() => {
        setAttemptState((previous) => {
          if (previous.postId !== postId) return previous;

          return {
            ...previous,
            copied: false,
          };
        });

        copyTimer.current = null;
      }, 1800);
    } catch {
      setAttemptState((previous) => ({
        postId,
        hasAttempted:
          previous.postId === postId
            ? previous.hasAttempted
            : false,
        copied: false,
      }));
    }
  }, [hasInsight, labels, summary, findings, recommendations, postId]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        clearTimeout(copyTimer.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full px-3.5 shadow-none hover:bg-accent"
        >
          {busy ? (
            <Loader2
              className="size-4 animate-spin text-primary motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Sparkles
              className="size-4 text-primary"
              aria-hidden="true"
            />
          )}

          <span className="font-medium">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        aria-label="AI post insight"
        className={cn(
          "flex flex-col overflow-hidden p-0",
          "w-[min(440px,calc(100vw-24px))] rounded-xl shadow-lg",
          "max-h-[min(680px,var(--radix-popover-content-available-height,calc(100dvh-32px)))]",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight">
              Post insight
            </h3>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {showContent && generatedAt
                ? `Saved ${generatedAt}`
                : "What people are saying about this post"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {showContent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground sm:h-8 sm:px-2"
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}

                <span aria-live="polite">
                  {copied ? "Copied" : "Copy"}
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-muted-foreground sm:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close insight"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          className="min-h-[200px] flex-1 overflow-y-auto overscroll-contain px-4 py-5"
          aria-busy={busy}
        >
          {showSkeleton && (
            <InsightSkeleton
              message={
                isGenerating
                  ? "Generating insight. This can take a minute."
                  : "Loading saved insight…"
              }
            />
          )}

          {showError && error && (
            <div role="alert" className="space-y-4 py-2">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Couldn’t load the insight
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                    {error.message}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-2 sm:h-8"
                onClick={handleRetryLoad}
                disabled={busy}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Try again
              </Button>
            </div>
          )}

          {showEmpty && (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>

              <p className="text-sm font-medium">
                {hasAttempted ? "No summary came back" : "No insight yet"}
              </p>

              <p className="mt-1.5 max-w-[300px] text-xs leading-5 text-muted-foreground">
                {hasAttempted
                  ? "The model finished without returning a summary. Select Generate to try again, or switch to another model."
                  : "Select Generate to get a summary, the main concerns people raised, and suggested next steps."}
              </p>
            </div>
          )}

          {showContent && (
            <article
              lang={language}
              className={cn(
                "space-y-7 transition-opacity motion-reduce:transition-none",
                isGenerating && "opacity-60",
              )}
              aria-label="AI-generated insight"
            >
              {isGenerating && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"
                >
                  <Loader2
                    className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />

                  Generating a new insight. The current one stays until it’s
                  ready.
                </div>
              )}

              {error && !busy && (
                <InlineAlert>
                  The last request failed, so this may be an earlier saved
                  result. {error.message}
                </InlineAlert>
              )}

              <section aria-label={labels.summary}>
                <SectionHeading>{labels.summary}</SectionHeading>

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/90">
                  {summary}
                </p>
              </section>

              {findings.length > 0 && (
                <section aria-label={labels.findings}>
                  <SectionHeading count={findings.length}>
                    {labels.findings}
                  </SectionHeading>

                  <ul className="space-y-2.5">
                    {findings.map((finding, index) => (
                      <li
                        key={`${index}-${finding}`}
                        className="flex gap-3 text-sm leading-6 text-foreground/90"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60"
                        />

                        <span className="min-w-0 break-words">
                          {finding}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {recommendations.length > 0 && (
                <section aria-label={labels.recommendations}>
                  <SectionHeading count={recommendations.length}>
                    {labels.recommendations}
                  </SectionHeading>

                  <ul className="space-y-2">
                    {recommendations.map((recommendation, index) => (
                      <li
                        key={`${index}-${recommendation}`}
                        className="rounded-r-lg border-l-2 border-primary bg-primary/5 py-2.5 pl-3.5 pr-3 text-sm leading-6 text-foreground/90"
                      >
                        <span className="break-words">
                          {recommendation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          )}
        </div>

        <div className="border-t bg-muted/30 px-3 pb-2.5 pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 min-w-0 gap-1.5 px-2 text-xs sm:h-8"
                  disabled={busy}
                  aria-label={`AI model: ${selectedModelOption.label}`}
                >
                  <span className="hidden text-muted-foreground min-[380px]:inline">
                    Model
                  </span>

                  <span className="truncate font-medium">
                    {selectedModelOption.label}
                  </span>

                  <ChevronDown
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                side="top"
                className="w-[min(256px,calc(100vw-24px))]"
              >
                <DropdownMenuRadioGroup
                  value={selectedModel}
                  onValueChange={handleModelChange}
                >
                  {MODEL_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer py-2.5"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>

                        <span className="text-[11px] text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              size="sm"
              variant={hasInsight ? "outline" : "default"}
              className="h-10 shrink-0 gap-1.5 px-4 text-xs sm:h-8 sm:px-3"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {isGenerating ? (
                <Loader2
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : hasInsight ? (
                <RefreshCw className="size-3.5" aria-hidden="true" />
              ) : (
                <Sparkles className="size-3.5" aria-hidden="true" />
              )}

              {isGenerating
                ? "Generating…"
                : hasInsight
                  ? "Regenerate"
                  : "Generate"}
            </Button>
          </div>

          <p className="mt-1.5 px-2 text-[11px] leading-4 text-muted-foreground">
            AI-generated by Degertu AI. Check the details before acting on
            them.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}