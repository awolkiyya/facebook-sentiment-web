"use client"

import type {
  ExecutiveSummaryData,
  FacebookPost,
  TopicInsight,
} from  "@/types/facebook-post"

import { ExecutiveSummary } from "./executive-summary"
import { MostDiscussed } from "./most-discussed"
import { TopicsToWatch } from "./topics-to-watch"

interface FacebookInsightsRailProps {
  executiveSummary: ExecutiveSummaryData
  topics: TopicInsight[]
  mostDiscussedPost: FacebookPost | null
  onViewComments: (
    postId: string,
  ) => void
}

export function FacebookInsightsRail({
  executiveSummary,
  topics,
  mostDiscussedPost,
  onViewComments,
}: FacebookInsightsRailProps) {
  return (
    <aside className="space-y-4">
      <ExecutiveSummary
        data={executiveSummary}
      />

      <TopicsToWatch
        topics={topics}
      />

      <MostDiscussed
        post={mostDiscussedPost}
        onViewComments={onViewComments}
      />
    </aside>
  )
}