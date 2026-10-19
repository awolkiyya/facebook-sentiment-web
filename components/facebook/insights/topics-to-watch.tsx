"use client"

import {
  AlertTriangle,
  MessageSquare,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TopicInsight } from "@/types/facebook/analytics"


interface TopicsToWatchProps {
  topics: TopicInsight[]
}

export function TopicsToWatch({
  topics,
}: TopicsToWatchProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Topics to Watch
        </CardTitle>
      </CardHeader>

      <CardContent>
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topic insights available.
          </p>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => {
              const negativePercentage =
                topic.count > 0
                  ? (topic.negative /
                      topic.count) *
                    100
                  : 0

              return (
                <div
                  key={topic.topic}
                  className="space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {topic.topic}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />

                        {topic.comments.toLocaleString()}{" "}
                        comments
                      </div>
                    </div>

                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {negativePercentage.toFixed(
                        0,
                      )}
                      % negative
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/70"
                      style={{
                        width: `${Math.min(
                          negativePercentage,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}