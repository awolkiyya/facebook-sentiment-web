import type { FacebookComment } from "./comment"
import type { SentimentLabel } from "./common"

/*
|--------------------------------------------------------------------------
| POST ENGAGEMENT
|--------------------------------------------------------------------------
*/

/**
 * Engagement statistics for a Facebook post.
 *
 * Values may be zero when Meta reports no engagement.
 */
export interface FacebookPostEngagement {
  likes: number
  comments: number
  shares: number
}

/*
|--------------------------------------------------------------------------
| POST ATTACHMENTS
|--------------------------------------------------------------------------
*/

/**
 * Normalized Facebook post attachment.
 *
 * This represents the application-level attachment returned
 * by the Laravel API rather than the raw Meta Graph API payload.
 *
 * Supported original Meta types may include:
 *
 * - photo
 * - album
 * - video_inline
 * - video_direct_response
 * - share
 * - native_templates
 *
 * The `media_type` field is normalized by the backend and may be:
 *
 * - image
 * - video
 * - album
 * - link
 * - unavailable
 * - unknown
 */
export interface FacebookPostAttachment {
  /**
   * Internal Laravel UUID.
   */
  id: string

  /**
   * Original Meta attachment type.
   *
   * Examples:
   *
   * - photo
   * - album
   * - video_inline
   * - video_direct_response
   * - share
   * - native_templates
   */
  type: string | null

  /**
   * Application-normalized media type.
   *
   * Examples:
   *
   * - image
   * - video
   * - album
   * - link
   * - unavailable
   * - unknown
   */
  media_type: string

  /**
   * Facebook attachment URL.
   *
   * This may be a Facebook post, photo, reel, share,
   * or other attachment URL depending on the attachment type.
   */
  url: string | null

  /**
   * Direct media URL.
   *
   * Usually available for video attachments.
   *
   * Meta CDN URLs may be temporary/signed URLs.
   */
  media_url: string | null

  /**
   * Preview/thumbnail image URL.
   *
   * Commonly available for image and video attachments.
   *
   * Meta CDN URLs may be temporary/signed URLs.
   */
  thumbnail_url: string | null

  /**
   * Facebook target information.
   */
  target: {
    /**
     * External Facebook/Meta target ID.
     */
    id: string | null

    /**
     * Target URL.
     */
    url: string | null
  }

  /**
   * Attachment title.
   */
  title: string | null

  /**
   * Attachment description.
   */
  description: string | null

  /**
   * Media width in pixels.
   */
  width: number | null

  /**
   * Media height in pixels.
   */
  height: number | null

  /**
   * Position within the current attachment level.
   *
   * For top-level attachments, this is the position within
   * the post's attachment collection.
   *
   * For child attachments, this is the position within
   * the parent's children collection.
   */
  position: number

  /**
   * Nested child attachments.
   *
   * Example:
   *
   * album
   *   ├── photo
   *   ├── photo
   *   └── photo
   */
  children: FacebookPostAttachment[]

  /**
   * Laravel record creation timestamp.
   */
  created_at: string | null

  /**
   * Laravel record last-update timestamp.
   */
  updated_at: string | null
}

/*
|--------------------------------------------------------------------------
| POST SENTIMENT
|--------------------------------------------------------------------------
*/

/**
 * Sentiment analysis for a Facebook post.
 */
export interface FacebookPostSentiment {
  /**
   * Predicted sentiment label.
   */
  label: SentimentLabel | null

  /**
   * Model confidence/score for the predicted sentiment.
   *
   * This matches the Laravel API field:
   *
   *     sentiment.score
   */
  score: number | null

  /**
   * Optional probability/score distribution.
   *
   * Not currently required by the API response,
   * but supported when available.
   */
  scores?: {
    positive: number | null
    neutral: number | null
    negative: number | null
  }
}

/*
|--------------------------------------------------------------------------
| POST AI ANALYSIS
|--------------------------------------------------------------------------
*/

/**
 * AI-generated analysis for a Facebook post.
 */
export interface FacebookPostAIAnalysis {
  /**
   * Sentiment analysis.
   */
  sentiment: FacebookPostSentiment

  /**
   * Topic classification.
   */
  topic: {
    /**
     * Predicted topic name.
     */
    name: string | null

    /**
     * Topic model confidence.
     */
    confidence: number | null
  }
}

/*
|--------------------------------------------------------------------------
| FACEBOOK POST
|--------------------------------------------------------------------------
*/

/**
 * Facebook post returned by the Laravel API.
 */
export interface FacebookPost {
  /**
   * Internal Laravel UUID.
   *
   * Primary key of facebook_posts.id.
   */
  id: string

  /**
   * Internal Laravel FacebookPage UUID.
   *
   * References:
   *
   *     facebook_posts.facebook_page_id
   *         ->
   *     facebook_pages.id
   */
  facebook_page_id: string

  /**
   * External Meta/Facebook Post ID.
   *
   * Example:
   *
   *     100297668388012_1392367932910327
   */
  facebook_post_id: string

  /**
   * Facebook post text.
   */
  message: string | null

  /**
   * Public Facebook permalink.
   */
  permalink_url: string | null

  /**
   * Original Facebook publication timestamp.
   *
   * Returned as an ISO-8601 date-time string.
   */
  published_at: string | null

  /**
   * Post engagement statistics.
   */
  engagement: FacebookPostEngagement

  /**
   * Post-level AI analysis.
   */
  ai_analysis: FacebookPostAIAnalysis

  /**
   * Root-level Facebook attachments.
   *
   * Nested album/media attachments are available through:
   *
   *     attachment.children
   */
  attachments: FacebookPostAttachment[]

  /**
   * Top comments returned by the API.
   *
   * The backend should enforce any maximum-comment limit.
   */
  top_comments: FacebookComment[]

  /**
   * Laravel record creation timestamp.
   */
  created_at: string | null

  /**
   * Laravel record last-update timestamp.
   */
  updated_at: string | null
}

/*
|--------------------------------------------------------------------------
| POSTS QUERY
|--------------------------------------------------------------------------
*/

/**
 * Query parameters for retrieving Facebook posts.
 */
export interface FacebookPostsQueryParams {
  /**
   * Number of posts to return per page.
   *
   * Backend maximum is currently 100.
   */
  per_page?: number

  /**
   * Requested pagination page.
   */
  page?: number
}
