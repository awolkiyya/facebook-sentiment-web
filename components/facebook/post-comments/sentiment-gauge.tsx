import { sentimentConfig } from "@/configs/sentiment-config"

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const p1 = polarPoint(cx, cy, r, startAngle)
  const p2 = polarPoint(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`
}

const ZONES = [
  { from: 1, to: 2.2, color: sentimentConfig.negative.hex },
  { from: 2.2, to: 3.6, color: sentimentConfig.neutral.hex },
  { from: 3.6, to: 5, color: sentimentConfig.positive.hex },
]

interface SentimentGaugeProps {
  score: number
  hasData: boolean
}

export function SentimentGauge({ score, hasData }: SentimentGaugeProps) {
  const cx = 110
  const cy = 108
  const r = 88

  const clamped = Math.min(5, Math.max(1, score))
  const toAngle = (value: number) => -90 + ((value - 1) / 4) * 180
  const needleAngle = toAngle(clamped)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="h-36 w-56">
        {ZONES.map((zone) => (
          <path
            key={zone.color}
            d={arcPath(cx, cy, r, toAngle(zone.from), toAngle(zone.to))}
            fill="none"
            stroke={zone.color}
            strokeWidth={13}
            strokeLinecap="round"
            opacity={hasData ? 0.9 : 0.2}
          />
        ))}

        {hasData && (
          <g
            className="transition-transform duration-700 ease-out"
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - r + 26}
              stroke="currentColor"
              className="text-foreground"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        )}

        <circle
          cx={cx}
          cy={cy}
          r={5.5}
          fill="currentColor"
          className="text-foreground"
        />
      </svg>

      <div className="-mt-3 text-center">
        <div className="text-4xl font-bold tracking-tight tabular-nums">
          {hasData ? score.toFixed(2) : "—"}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          sentiment score / 5
        </div>
      </div>
    </div>
  )
}