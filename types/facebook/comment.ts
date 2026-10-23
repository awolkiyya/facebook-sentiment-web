import { CommenterFilter } from "@/components/facebook/comments-section"
import type {
  CommentAnalysisStatus,
  CommentSortMode,
  LanguageCode,
  SentimentLabel,
} from "./common"

/* -------------------------------------------------------------------------- */
/* COMMENT AUTHOR                                                             */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentAuthor {
  name: string | null
  facebook_id: string | null
}

/* -------------------------------------------------------------------------- */
/* COMMENT ENGAGEMENT                                                         */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentEngagement {
  like_count: number
}

/* -------------------------------------------------------------------------- */
/* COMMENT SENTIMENT SCORES                                                   */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentSentimentScores {
  positive: number | null
  neutral: number | null
  negative: number | null
}

/* -------------------------------------------------------------------------- */
/* COMMENT AI ANALYSIS                                                        */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentAIAnalysis {
  sentiment: {
    label: SentimentLabel
    confidence: number | null
    scores: FacebookCommentSentimentScores
  }

  language: LanguageCode
  language_confidence: number | null

  topic: string | null
  topic_confidence: number | null

  priority: string | null
  priority_confidence: number | null

  processing_time_ms: number | null
  analyzed_at: string | null
  sentiment_model_version_id: string | null
}

/* -------------------------------------------------------------------------- */
/* FACEBOOK COMMENT                                                           */
/* -------------------------------------------------------------------------- */

export interface FacebookComment {
  /**
   * Internal Laravel FacebookComment UUID.
   */
  id: string

  /**
   * Internal Laravel FacebookPost UUID.
   *
   * References:
   *     facebook_posts.id
   */
  facebook_post_id: string

  /**
   * External Meta/Facebook Comment ID.
   */
  facebook_comment_id: string

  /**
   * External Meta/Facebook parent comment ID.
   *
   * Null when this is a top-level comment.
   */
  parent_comment_id: string | null

  author: FacebookCommentAuthor

  message: string | null

  permalink_url: string | null

  commented_at: string | null

  engagement: FacebookCommentEngagement

  ai_analysis: FacebookCommentAIAnalysis | null

  created_at: string | null

  updated_at: string | null
}

/* -------------------------------------------------------------------------- */
/* COMMENTS QUERY                                                             */
/* -------------------------------------------------------------------------- */

export interface FacebookPostCommentsParams {
  page?: number
  perPage?: number
  sortBy?: CommentSortMode
  search?: string
  sentiment?: SentimentLabel
  language?: LanguageCode
  analysisStatus?: CommentAnalysisStatus
  commenter?: CommenterFilter
  startDate?: string
  endDate?: string
}

/* -------------------------------------------------------------------------- */
/* COMMENTS PAGINATION                                                        */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

/* -------------------------------------------------------------------------- */
/* GET COMMENTS RESPONSE                                                      */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentsResponse {
  success: boolean

  data: {
    comments: FacebookComment[]
    pagination: FacebookCommentsPagination
  }

  message?: string
}

/* -------------------------------------------------------------------------- */
/* SYNC COMMENTS RESPONSE                                                     */
/* -------------------------------------------------------------------------- */

export interface FacebookCommentsSyncResponse {
  success: boolean

  message: string

  data: {
    /**
     * Internal Laravel FacebookPost UUID.
     */
    post_id: string

    /**
     * External Meta/Facebook Post ID.
     */
    facebook_post_id: string

    comments_count: number

    comments_for_analysis: number

    /**
     * Internal Laravel FacebookComment UUIDs.
     */
    comment_ids_for_analysis: string[]
  }
}

/* -------------------------------------------------------------------------- */
/* FACEBOOK POST COMMENT INSIGHTS                                             */
/* -------------------------------------------------------------------------- */

/**
 * One highly engaged, top-level Facebook comment selected by sentiment.
 *
 * Confidence uses the raw persisted backend value.
 * It is not a language confidence score.
 */
export interface FacebookPostCommentInsight {
  /**
   * Internal Laravel FacebookComment UUID.
   */
  id: string

  author: FacebookCommentAuthor

  message: string | null

  language: LanguageCode | null

  sentiment_confidence: number | null

  likes: number

  permalink_url: string | null

  commented_at: string | null

  sentiment: Extract<SentimentLabel, "positive" | "negative">
}

/* -------------------------------------------------------------------------- */
/* COMMENT INSIGHTS QUERY                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Optional date range for the post's comment insights.
 *
 * Expected format: YYYY-MM-DD
 */
export interface FacebookPostCommentInsightsParams {
  startDate?: string
  endDate?: string
}

/* -------------------------------------------------------------------------- */
/* COMMENT INSIGHTS PERIOD                                                   */
/* -------------------------------------------------------------------------- */

export interface FacebookPostCommentInsightsPeriod {
  start_date: string | null
  end_date: string | null
}

/* -------------------------------------------------------------------------- */
/* COMMENT INSIGHTS RESPONSE                                                  */
/* -------------------------------------------------------------------------- */

export interface FacebookPostCommentInsightsResponse {
  success: boolean

  message: string

  data: {
    period: FacebookPostCommentInsightsPeriod

    /**
     * Most-liked top-level comment with positive sentiment.
     * Null when no qualifying comment exists.
     */
    top_positive: FacebookPostCommentInsight | null

    /**
     * Most-liked top-level comment with negative sentiment.
     * Null when no qualifying comment exists.
     */
    top_negative: FacebookPostCommentInsight | null
  }
}



/* -------------------------------------------------------------------------- */
/* Facebook Post Sentiment Overview                                           */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSentimentDistributionItem {
  count: number
  percentage: number
}

export interface FacebookPostOverallSentiment {
  score: number | null
  scale: {
    min: number
    max: number
  }
  label: "Positive" | "Neutral" | "Negative" | "No analysis yet"
  analyzed_count: number
}

export interface FacebookPostSentimentDistribution {
  positive: FacebookPostSentimentDistributionItem
  neutral: FacebookPostSentimentDistributionItem
  negative: FacebookPostSentimentDistributionItem
  total: number
  has_data: boolean
}

export interface FacebookPostSentimentTimelineItem {
  date: string
  comment_count: number
  average_sentiment_score: number | null
}

export interface FacebookPostSentimentTimeline {
  has_data: boolean
  data: FacebookPostSentimentTimelineItem[]
}

export interface FacebookPostSentimentOverview {
  overall_sentiment: FacebookPostOverallSentiment
  sentiment_distribution: FacebookPostSentimentDistribution
  sentiment_timeline: FacebookPostSentimentTimeline
}


/* -------------------------------------------------------------------------- */
/* Facebook Post Sentiment Overview Parameters                                */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSentimentOverviewParams {
  startDate?: string
  endDate?: string
}


/* -------------------------------------------------------------------------- */
/* Top Topics Types                                                           */
/* -------------------------------------------------------------------------- */

export interface FacebookPostTopTopicsParams {
  startDate?: string
  endDate?: string
  limit?: number
}

export interface FacebookPostTopTopic {
  topic: string
  comment_count: number
  percentage: number
}

export interface FacebookPostTopTopics {
  topics: FacebookPostTopTopic[]
  analyzed_comment_count: number
}


/* -------------------------------------------------------------------------- */
/* Comment Insights Types                                                     */
/* -------------------------------------------------------------------------- */

export interface FacebookPostCommentInsightsParams {
  startDate?: string
  endDate?: string
}

/* -------------------------------------------------------------------------- */
/* Sentiment Overview Types                                                   */
/* -------------------------------------------------------------------------- */

export interface FacebookPostSentimentOverviewParams {
  startDate?: string
  endDate?: string
}
