import { SentimentTimeline } from "@/components/facebook/sentiment-timeline"
import { TimelinePoint } from "@/types/facebook/post-comments-analytics"


interface SentimentTimelineCardProps {
  data: TimelinePoint[]
}

export function SentimentTimelineCard({ data }: SentimentTimelineCardProps) {
  return <SentimentTimeline data={data} />
}