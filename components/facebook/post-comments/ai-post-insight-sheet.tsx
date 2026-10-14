"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  ChevronDown,
  Languages,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export type SupportedLanguage = "en" | "am" | "om";



interface AiPostInsightPopoverProps {
  analytics: string | null;
  isLoading?: boolean;
  isGenerating?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onGenerateInsight?: (language: SupportedLanguage) => void;
  preferredLanguage?: SupportedLanguage;
  triggerLabel?: string;
}

const languageOptions: {
  value: SupportedLanguage;
  label: string;
  nativeLabel: string;
}[] = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { value: "om", label: "Afaan Oromo", nativeLabel: "Afaan Oromoo" },
];

export default function AiPostInsightPopover({
  analytics,
  isLoading = false,
  isGenerating = false,
  error = null,
  onRefresh,
  onGenerateInsight,
  preferredLanguage = "en",
  triggerLabel = "AI Insight",
}: AiPostInsightPopoverProps) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] =
    useState<SupportedLanguage>(preferredLanguage);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  useEffect(() => {
    setLanguage(preferredLanguage);
  }, [preferredLanguage]);

  const insight = analytics?.trim() ?? "";
  const selectedLanguage = languageOptions.find(
    (option) => option.value === language,
  );

  const busy = isLoading || isGenerating;

  const handleGenerate = () => {
    onGenerateInsight?.(language);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-full"
          aria-label="View AI post insight"
        >
          <BrainCircuit className="h-4 w-4" />
          <span>{triggerLabel}</span>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className="w-[min(380px,calc(100vw-24px))] overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold">
                AI Post Insight
              </h3>
              <p className="text-xs text-muted-foreground">
                Public sentiment analysis
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="shrink-0 gap-1">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        </div>

        {/* Language and actions */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-2 px-2 text-xs"
              onClick={() => setLanguageMenuOpen((value) => !value)}
              aria-expanded={languageMenuOpen}
              aria-label="Choose insight language"
            >
              <Languages className="h-4 w-4" />
              {selectedLanguage?.nativeLabel ?? "English"}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>

            {languageMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setLanguage(option.value);
                      setLanguageMenuOpen(false);

                      if (option.value !== language) {
                        onGenerateInsight?.(option.value);
                      }
                    }}
                  >
                    <span>{option.nativeLabel}</span>
                    {language === option.value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
            onClick={onRefresh ?? handleGenerate}
            disabled={busy || (!onRefresh && !onGenerateInsight)}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>

        {/* Insight content */}
        <div className="max-h-[55vh] overflow-y-auto p-4">
          {busy ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">
                  Generating insight...
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analyzing public feedback
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Unable to load insight
                  </p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {error}
                  </p>
                </div>
              </div>

              {onGenerateInsight && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Try again
                </Button>
              )}
            </div>
          ) : insight ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Summary
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {insight}
              </p>
            </div>
          ) : (
            <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center">
              <BrainCircuit className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">
                No insight available
              </p>
              <p className="text-xs text-muted-foreground">
                Generate an AI insight to summarize public feedback.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            AI-generated · Review before acting
          </p>

          {onGenerateInsight && (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleGenerate}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {insight ? "Regenerate" : "Generate"}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
