import { Flame, Heart, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { AuthorAvatar } from "./author-avatar"
import { Sentiment, UiComment } from "@/types/facebook/post-comments-analytics"
import { sentimentConfig } from "@/configs/sentiment-config"
import { formatNumber, languageLabelOf } from "@/utils/post-comments-helpers"


function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = sentimentConfig[sentiment]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config.soft}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

interface CommentHighlightsProps {
  topPositive: UiComment | null
  topNegative: UiComment | null
  onJumpToComment: (id: string) => void
}

export function CommentHighlights({
  topPositive,
  topNegative,
  onJumpToComment,
}: CommentHighlightsProps) {
  if (!topPositive && !topNegative) return null

  const items = [
    {
      comment: topPositive,
      sentiment: "positive" as Sentiment,
      title: "Most liked positive comment",
    },
    {
      comment: topNegative,
      sentiment: "negative" as Sentiment,
      title: "Most liked negative comment",
    },
  ]

  return (
    <div className="mt-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">What people are saying</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Highly engaged comments from this analysis period.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map(
          ({ comment, sentiment, title }) =>
            comment && (
              <Card key={sentiment} className="border-border/70 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${sentimentConfig[sentiment].soft}`}
                      >
                        <Flame
                          className={`h-3.5 w-3.5 ${sentimentConfig[sentiment].text}`}
                        />
                      </span>
                      <p className="text-xs font-medium">{title}</p>
                    </div>

                    <SentimentBadge sentiment={sentiment} />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <AuthorAvatar name={comment.author} className="h-8 w-8" />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{comment.author}</p>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        {comment.language && (
                          <span className="flex items-center gap-1">
                            <Languages className="h-2.5 w-2.5" />
                            {languageLabelOf(comment.language)}
                          </span>
                        )}

                        {comment.sentimentConfidence !== null && (
                          <span>{comment.sentimentConfidence}% confidence</span>
                        )}
                      </div>

                      <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-foreground/90">
                        {comment.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          {formatNumber(comment.likes)}
                        </span>

                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-[11px]"
                          onClick={() => onJumpToComment(comment.id)}
                        >
                          View comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
        )}
      </div>
    </div>
  )
}