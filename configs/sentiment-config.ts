import { Meh, ThumbsDown, ThumbsUp } from "lucide-react"

export const sentimentConfig = {
  positive: {
    label: "Positive",
    icon: ThumbsUp,
    hex: "#16a34a",
    soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    icon: Meh,
    hex: "#d97706",
    soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  negative: {
    label: "Negative",
    icon: ThumbsDown,
    hex: "#dc2626",
    soft: "bg-red-500/10 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
} as const