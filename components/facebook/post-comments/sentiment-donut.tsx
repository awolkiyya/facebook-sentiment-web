import { sentimentConfig } from "@/configs/sentiment-config"
import { Sentiment } from "@/types/facebook/post-comments-analytics"

const ORDER: Sentiment[] = ["positive", "neutral", "negative"]

interface SentimentDonutProps {
  counts: Record<Sentiment, number>
  percentages: Record<Sentiment, number>
  hasData: boolean
  onSelect: (sentiment: Sentiment) => void
}

export function SentimentDonut({
  counts,
  percentages,
  hasData,
  onSelect,
}: SentimentDonutProps) {
  const size = 178
  const r = 65
  const stroke = 25
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const totalCount = ORDER.reduce((sum, s) => sum + counts[s], 0)
  const total = totalCount || 1

  let cumulative = 0

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
      <div
        className="relative shrink-0"
        style={{ height: size, width: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 h-full w-full"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-muted"
            strokeWidth={stroke}
          />

          {hasData &&
            ORDER.map((sentiment) => {
              const value = counts[sentiment]
              if (value === 0) return null

              const fraction = value / total
              const dash = fraction * circumference
              const offset = cumulative * circumference
              cumulative += fraction

              return (
                <circle
                  key={sentiment}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={sentimentConfig[sentiment].hex}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  className="cursor-pointer transition-opacity hover:opacity-75"
                  onClick={() => onSelect(sentiment)}
                />
              )
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums">{totalCount}</span>
          <span className="text-[11px] text-muted-foreground">analyzed</span>
        </div>
      </div>

      <div className="grid min-w-[150px] gap-2">
        {ORDER.map((sentiment) => {
          const config = sentimentConfig[sentiment]
          const Icon = config.icon

          return (
            <button
              key={sentiment}
              type="button"
              onClick={() => onSelect(sentiment)}
              className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/60"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.soft}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium">
                  {config.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {counts[sentiment]} comments
                </span>
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {percentages[sentiment]}%
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}