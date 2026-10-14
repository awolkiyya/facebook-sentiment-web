import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatNumber } from "@/utils/post-comments-helpers"

interface SentimentStatCardProps {
  icon: React.ElementType
  label: string
  value: number
  growthPercent: number | null
  accent: string
}

/** Requires a <TooltipProvider> ancestor. */
export function SentimentStatCard({
  icon: Icon,
  label,
  value,
  growthPercent,
  accent,
}: SentimentStatCardProps) {
  const isUp = (growthPercent ?? 0) >= 0

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          {growthPercent !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-medium ${
                    isUp
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(growthPercent)}%
                </span>
              </TooltipTrigger>

              <TooltipContent side="top" className="text-xs">
                Compared with the previous equivalent period.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatNumber(value)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}