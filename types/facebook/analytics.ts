import type { FacebookPost } from "./post"

export interface FacebookPostKpis {
  posts: number
  reactions: number
  comments: number
  shares: number
}

export interface ExecutiveSummaryData {
  totalPosts: number

  positivePosts: number
  neutralPosts: number
  negativePosts: number

  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
}

export interface TopicInsight {
  topic: string
  count: number
  negative: number
  comments: number
}

export interface FacebookPostAnalytics {
  kpis: FacebookPostKpis

  executiveSummary: ExecutiveSummaryData

  topics: TopicInsight[]

  mostDiscussedPost: FacebookPost | null
}