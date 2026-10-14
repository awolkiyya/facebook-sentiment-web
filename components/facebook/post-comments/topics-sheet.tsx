import { Sparkles, Tags } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PostTopic } from "@/types/facebook/post-comments-analytics"


interface TopicsSheetProps {
  topics: PostTopic[]
}

export function TopicsSheet({ topics }: TopicsSheetProps) {
  if (topics.length === 0) return null

  const sorted = [...topics].sort((a, b) => b.score - a.score)
  const primary = sorted[0]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Tags className="h-3.5 w-3.5" />
          <span>Conversation topics</span>
          <Badge
            variant="secondary"
            className="ml-0.5 h-5 min-w-5 justify-center px-1.5 text-[10px]"
          >
            {topics.length}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Tags className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">
                  Conversation topics
                </SheetTitle>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[9px] font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              </div>

              <SheetDescription className="mt-1.5 text-xs leading-5">
                Main themes detected across the comments on this post.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Primary topic
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5">
                    {primary.topic}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${primary.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      {primary.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Detected topics</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Ranked by topic relevance.
                  </p>
                </div>

                <Badge variant="outline" className="text-[10px] font-normal">
                  {topics.length} topics
                </Badge>
              </div>

              <div className="divide-y rounded-xl border">
                {sorted.map((topic, index) => {
                  const isPrimary = topic.topic === primary.topic

                  return (
                    <div key={topic.topic} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${
                            isPrimary
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-5">
                                {topic.topic}
                              </p>

                              {isPrimary && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1.5 text-[9px]"
                                >
                                  Primary topic
                                </Badge>
                              )}
                            </div>

                            <span className="shrink-0 text-xs font-semibold tabular-nums">
                              {topic.score}%
                            </span>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={
                                isPrimary
                                  ? "h-full rounded-full bg-blue-600"
                                  : "h-full rounded-full bg-blue-500/50"
                              }
                              style={{ width: `${topic.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-dashed bg-muted/20 p-4">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">About topic detection</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Topic scores indicate how strongly a theme is represented in
                    the analyzed conversation. They are AI-generated signals,
                    not percentages of all comments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-background px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI analysis available
            </div>

            <Badge variant="outline" className="text-[10px] font-normal">
              {topics.length} detected
            </Badge>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}