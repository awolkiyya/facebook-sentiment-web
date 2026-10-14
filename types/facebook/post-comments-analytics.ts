import { LanguageCode } from "./common";

export type SentimentLabel = "positive" | "neutral" | "negative";

export type SupportedLanguage = "en" | "am" | "om";

export type CommentSortOption =
  | "newest"
  | "oldest"
  | "most_liked"
  | "most_replied"
  | "positive"
  | "negative";

export type CommentDatePreset =
  | "all"
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "custom";

export type CommentAnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface FacebookCommentAuthor {
  id?: string | null;
  name: string;
  pictureUrl?: string | null;
  profileUrl?: string | null;
}

export interface FacebookComment {
  id: string;
  facebookCommentId?: string | null;
  postId: string;

  message: string;
  author: FacebookCommentAuthor;

  sentiment: SentimentLabel | null;
  sentimentScore?: number | null;
  sentimentConfidence?: number | null;

  language?: SupportedLanguage | null;
  analysisStatus?: CommentAnalysisStatus;

  likeCount: number;
  replyCount: number;

  publishedAt: string;
  analyzedAt?: string | null;

  permalinkUrl?: string | null;
  isHidden?: boolean;
}

export interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
  unanalyzed: number;
  total: number;
}

export interface SentimentPercentages {
  positive: number;
  neutral: number;
  negative: number;
  unanalyzed: number;
}

export interface SentimentDistribution {
  counts: SentimentCounts;
  percentages: SentimentPercentages;
}

export interface SentimentTimelinePoint {
  date: string;
  label?: string;

  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface SentimentScoreSummary {
  /**
   * Optional application-defined score.
   * This is not necessarily the model's confidence or probability.
   */
  value: number | null;
  label: string;
  description?: string;
}

export interface FacebookPostContext {
  id: string;
  facebookPostId?: string | null;

  message?: string | null;
  permalinkUrl?: string | null;
  imageUrl?: string | null;

  publishedAt?: string | null;

  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface CommentTopic {
  id: string;
  name: string;
  description?: string | null;

  count: number;
  percentage: number;

  sentiment?: SentimentLabel | null;
  keywords?: string[];

  /**
   * Identifies whether the topic came from the backend model,
   * a rule-based classifier, or a manually curated source.
   */
  source?: "ai" | "rule_based" | "manual";
}

export interface CommentHighlight {
  comment: FacebookComment;
  reason:
    | "most_positive"
    | "most_negative"
    | "most_liked"
    | "most_replied"
    | "high_confidence";
}

export interface CommentPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  hasMorePages: boolean;
}

export interface CommentFilters {
  search: string;
  sentiment: SentimentLabel | "all";
  language: SupportedLanguage | "all";
  analysisStatus: CommentAnalysisStatus | "all";
  sortBy: CommentSortOption;
  datePreset: CommentDatePreset;
  startDate: string | null;
  endDate: string | null;
}

export interface PostCommentsAnalytics {
  post: FacebookPostContext;

  distribution: SentimentDistribution;
  timeline: SentimentTimelinePoint[];

  totalComments: number;
  analyzedComments: number;
  unanalyzedComments: number;
  uniqueCommenters: number;

  averageConfidence: number | null;

  topics: CommentTopic[];
  highlights: CommentHighlight[];

  generatedAt?: string | null;
}

export interface PaginatedCommentsResponse {
  data: FacebookComment[];
  meta: CommentPagination;
}

export interface PostCommentsAnalyticsResponse {
  data: PostCommentsAnalytics;
}

export interface CommentsQueryParams {
  page?: number;
  perPage?: number;

  search?: string;
  sentiment?: SentimentLabel;
  language?: SupportedLanguage;
  analysisStatus?: CommentAnalysisStatus;

  sortBy?: CommentSortOption;

  startDate?: string;
  endDate?: string;
}

export interface SyncCommentsResult {
  success: boolean;
  message: string;

  fetchedCount?: number;
  analyzedCount?: number;
  failedCount?: number;

  lastSyncedAt?: string | null;
}

export interface PostCommentsLoadingState {
  post: boolean;
  analytics: boolean;
  comments: boolean;
  topics: boolean;
  syncing: boolean;
}

export interface PostCommentsErrorState {
  post: string | null;
  analytics: string | null;
  comments: string | null;
  topics: string | null;
  syncing: string | null;
}

export const DEFAULT_COMMENT_FILTERS: CommentFilters = {
  search: "",
  sentiment: "all",
  language: "all",
  analysisStatus: "all",
  sortBy: "newest",
  datePreset: "all",
  startDate: null,
  endDate: null,
};


export type Sentiment = SentimentLabel
export type SentimentFilter = "all" | Sentiment
export type DateRange = "7d" | "30d" | "90d" | "all" | "custom"
export type SortMode = "newest" | "oldest" | "most_liked"

export interface UiComment {
  id: string
  author: string
  message: string
  publishedAt: string | null
  sentiment: Sentiment | null
  sentimentConfidence: number | null
  language: LanguageCode | null
  likes: number
  permalinkUrl: string | null
  analyzedAt: string | null
}

export interface PostTopic {
  topic: string
  score: number
}

export interface TimelinePoint {
  date: string
  positive: number
  neutral: number
  negative: number
  average: number
  total: number
}

export type ApiFacebookComment = FacebookComment & {
  is_flagged?: boolean | null
  is_replied?: boolean | null
}