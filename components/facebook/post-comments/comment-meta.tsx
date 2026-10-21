import { Clock3, Languages } from "lucide-react"

import type { LanguageCode } from "@/types/facebook/common"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDate, languageLabelOf } from "@/utils/post-comments-helpers"


interface CommentMetaProps {
  publishedAt: string | null
  language: LanguageCode | null
  confidence: number | null
}

/** Requires a <TooltipProvider> ancestor. */
export function CommentMeta({
  publishedAt,
  language,
  confidence,
}: CommentMetaProps) {
  const languageLabel = languageLabelOf("am")

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <Clock3 className="h-3 w-3" />
        {formatDate(publishedAt)}
      </span>

      {languageLabel && (
        <span className="flex items-center gap-1">
          <Languages className="h-3 w-3" />
          {languageLabel}
        </span>
      )}

      {confidence !== null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default underline decoration-dotted underline-offset-2">
              {confidence}% confidence
            </span>
          </TooltipTrigger>

          <TooltipContent side="top" className="text-xs">
            How confident the AI classifier is in this sentiment label.
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}