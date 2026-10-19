
"use client"

import type {
  ExecutiveSummaryData,
} from "./executive-summary"



import type {
  FacebookPost,
} from "@/types/facebook/post"

import { ExecutiveSummary } from "./executive-summary"
import { MostDiscussed } from "./most-discussed"
import { TopicsToWatch } from "./topics-to-watch"
import { TopicInsight } from "@/types/facebook/analytics"

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

interface FacebookInsightsRailProps {
  executiveSummary: ExecutiveSummaryData
  topics: TopicInsight[]
  mostDiscussedPost: FacebookPost | null
  onViewComments: (postId: string) => void
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export function FacebookInsightsRail({
  executiveSummary,
  topics,
  mostDiscussedPost,
  onViewComments,
}: FacebookInsightsRailProps) {
  return (
    <aside
      aria-label="Facebook post insights"
      className="space-y-4"
    >
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
