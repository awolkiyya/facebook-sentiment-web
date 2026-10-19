import type { LanguageCode, SentimentLabel } from "./common"

export interface FacebookCommentAuthor {
  name: string | null
  facebook_id: string | null
}

export interface FacebookCommentEngagement {
  likes: number
}

export interface FacebookCommentSentimentScores {
  positive: number | null
  neutral: number | null
  negative: number | null
}

export interface FacebookCommentAIAnalysis {
  sentiment: {
    label: SentimentLabel
    confidence: number | null

    scores: FacebookCommentSentimentScores
  }

  language: LanguageCode

  processing_time_ms: number | null

  analyzed_at: string | null

  sentiment_model_version_id: string
}

export interface FacebookComment {
  /**
   * Internal Laravel UUID.
   */
  id: string

  /**
   * Internal Laravel FacebookPost UUID.
   *
   * References:
   *
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

/*
|--------------------------------------------------------------------------
| COMMENTS QUERY
|--------------------------------------------------------------------------
*/

export interface FacebookCommentsQueryParams {
  per_page?: number
  page?: number
  sort_by?:string
}

/*
|--------------------------------------------------------------------------
| COMMENTS PAGINATION
|--------------------------------------------------------------------------
*/

export interface FacebookCommentsPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

/*
|--------------------------------------------------------------------------
| GET COMMENTS RESPONSE
|--------------------------------------------------------------------------
*/

export interface FacebookCommentsResponse {
  success: boolean

  data: {
    comments: FacebookComment[]
    pagination: FacebookCommentsPagination
  }

  message?: string
}

/*
|--------------------------------------------------------------------------
| SYNC COMMENTS RESPONSE
|--------------------------------------------------------------------------
*/

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