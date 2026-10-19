
import type { FacebookPost } from "@/types/facebook/post"

/*
|--------------------------------------------------------------------------
| Analytics types
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getSentiment(
  post: FacebookPost,
): string | null {
  return post.ai_analysis?.sentiment?.label?.toLowerCase() ?? null
}

function getTopic(
  post: FacebookPost,
): string {
  return post.ai_analysis?.topic?.name?.trim() || "Uncategorized"
}

/*
|--------------------------------------------------------------------------
| KPI calculation
|--------------------------------------------------------------------------
*/

export function calculatePostKpis(
  posts: FacebookPost[],
): FacebookPostKpis {
  return posts.reduce<FacebookPostKpis>(
    (totals, post) => {
      totals.posts += 1
      totals.reactions += post.engagement.likes
      totals.comments += post.engagement.comments
      totals.shares += post.engagement.shares

      return totals
    },
    {
      posts: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
    },
  )
}

/*
|--------------------------------------------------------------------------
| Executive summary
|--------------------------------------------------------------------------
*/

export function calculateExecutiveSummary(
  posts: FacebookPost[],
): ExecutiveSummaryData {
  const totalPosts = posts.length

  let positivePosts = 0
  let neutralPosts = 0
  let negativePosts = 0

  for (const post of posts) {
    switch (getSentiment(post)) {
      case "positive":
        positivePosts += 1
        break

      case "neutral":
        neutralPosts += 1
        break

      case "negative":
        negativePosts += 1
        break
    }
  }

  const percentage = (count: number) =>
    totalPosts > 0 ? (count / totalPosts) * 100 : 0

  return {
    totalPosts,
    positivePosts,
    neutralPosts,
    negativePosts,
    positivePercentage: percentage(positivePosts),
    neutralPercentage: percentage(neutralPosts),
    negativePercentage: percentage(negativePosts),
  }
}

/*
|--------------------------------------------------------------------------
| Topic insights
|--------------------------------------------------------------------------
|
| Aggregates topic information from Facebook post AI analysis.
| These are post-topic metrics, not comment-topic analytics.
|
*/

export function calculateTopicInsights(
  posts: FacebookPost[],
): TopicInsight[] {
  const topics = new Map<
    string,
    {
      count: number
      negative: number
      comments: number
    }
  >()

  for (const post of posts) {
    const topic = getTopic(post)

    const current = topics.get(topic) ?? {
      count: 0,
      negative: 0,
      comments: 0,
    }

    current.count += 1
    current.comments += post.engagement.comments

    if (getSentiment(post) === "negative") {
      current.negative += 1
    }

    topics.set(topic, current)
  }

  return Array.from(topics.entries())
    .map(([topic, value]) => ({
      topic,
      count: value.count,
      negative: value.negative,
      comments: value.comments,
    }))
    .sort(
      (a, b) =>
        b.comments - a.comments ||
        b.count - a.count ||
        a.topic.localeCompare(b.topic),
    )
    .slice(0, 4)
}

/*
|--------------------------------------------------------------------------
| Most discussed post
|--------------------------------------------------------------------------
*/

export function calculateMostDiscussedPost(
  posts: FacebookPost[],
): FacebookPost | null {
  if (posts.length === 0) {
    return null
  }

  return posts.reduce((mostDiscussed, current) =>
    current.engagement.comments >
    mostDiscussed.engagement.comments
      ? current
      : mostDiscussed,
  )
}

/*
|--------------------------------------------------------------------------
| Complete analytics
|--------------------------------------------------------------------------
*/

export function calculateFacebookPostAnalytics(
  posts: FacebookPost[],
): FacebookPostAnalytics {
  return {
    kpis: calculatePostKpis(posts),
    executiveSummary: calculateExecutiveSummary(posts),
    topics: calculateTopicInsights(posts),
    mostDiscussedPost: calculateMostDiscussedPost(posts),
  }
}
