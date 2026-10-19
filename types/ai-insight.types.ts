export type InsightLanguage = "en" | "am" | "or";

export type InsightModel = "qwen2.5:7b" | "qwen3:32b";

export type InsightStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type InsightSentiment =
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE"
  | "MIXED";

export type InsightPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface InsightDateRange {
  from?: string | null;
  to?: string | null;
}

export interface GenerateInsightRequest {
  language: InsightLanguage;
  model?: InsightModel;
  date_range?: InsightDateRange;
  regenerate?: boolean;
}

/**
 * Facebook page associated with the original post.
 */
export interface InsightFacebookPage {
  id: string;
  name: string;
}

/**
 * Original Facebook post returned with a saved insight.
 * Optional fields accommodate unavailable Facebook post details.
 */
export interface InsightFacebookPost {
  id: string;
  message?: string | null;
  permalink_url?: string | null;
  posted_at?: string | null;
  page?: InsightFacebookPage | null;
}

/**
 * AI model and analysis version metadata.
 */
export interface InsightModelMetadata {
  name: string | null;
  version: string | null;
  analysis_version: string;
}

/**
 * Evidence used to generate the insight.
 */
export interface InsightEvidence {
  hash: string | null;
  version: string | null;
}

/**
 * Saved AI insight returned by PostAiInsightResource.
 */
export interface PostInsightData {
  id: string;
  facebook_post_id: string;
  language: InsightLanguage;

  summary: string | null;
  key_concern: string | null;
  key_findings: string[];
  recommendations: string[];

  primary_topic: string | null;
  sentiment: InsightSentiment | string | null;
  priority: InsightPriority | string | null;
  actionable: boolean;
  analyzed_comments: number;
  confidence: number | null;

  model: InsightModelMetadata;
  status: InsightStatus;

  evidence: InsightEvidence;
  error_message?: string | null;
  generation_attempts: number;
  metadata: Record<string, unknown> | null;

  generated_at: string | null;
  created_at: string | null;
  updated_at: string | null;

  post?: InsightFacebookPost | null;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Response for queueing insight generation.
 */
export type GenerateInsightResponse = ApiResponse<PostInsightData>;

/**
 * Response for retrieving the latest saved insight.
 */
export type LatestInsightResponse = ApiResponse<PostInsightData | null>;

/**
 * Pagination metadata returned by the insights index endpoint.
 */
export interface InsightPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Pagination URLs returned by the insights index endpoint.
 */
export interface InsightPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/**
 * Filters supported by the insights index endpoint.
 */
export interface InsightListFilters {
  language?: InsightLanguage;
  model?: InsightModel;
  post_id?: string;
  from?: string;
  to?: string;
  per_page?: number;
}

/**
 * Response for listing saved insights.
 */
export interface InsightListResponse {
  success: boolean;
  message: string;
  data: PostInsightData[];
  meta: InsightPaginationMeta;
  links: InsightPaginationLinks;
}

/**
 * Query parameters for listing saved insights.
 */
export interface InsightListParams {
  language?: InsightLanguage;
  model?: string;
  post_id?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}
