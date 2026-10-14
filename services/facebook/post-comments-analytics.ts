
import { api } from "@/lib/api/api";
import type {
  CommentsQueryParams,
  FacebookComment,
  PaginatedCommentsResponse,
  PostCommentsAnalytics,
  PostCommentsAnalyticsResponse,
  SyncCommentsResult,
} from "@/types/facebook/post-comments-analytics";

/**
 * Adjust these paths to match the routes registered in Laravel.
 *
 * Keep route definitions centralized here rather than embedding
 * endpoint strings in React components.
 */
const FACEBOOK_POSTS_BASE = "/facebook/posts";

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function buildQueryParams(params: CommentsQueryParams): URLSearchParams {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.perPage !== undefined) {
    query.set("per_page", String(params.perPage));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sentiment) {
    query.set("sentiment", params.sentiment);
  }

  if (params.language) {
    query.set("language", params.language);
  }

  if (params.analysisStatus) {
    query.set("analysis_status", params.analysisStatus);
  }

  if (params.sortBy) {
    query.set("sort_by", params.sortBy);
  }

  if (params.startDate) {
    query.set("start_date", params.startDate);
  }

  if (params.endDate) {
    query.set("end_date", params.endDate);
  }

  return query;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
      message?: string;
    };

    return (
      candidate.response?.data?.message ??
      candidate.response?.data?.error ??
      candidate.message ??
      "An unexpected error occurred while communicating with the API."
    );
  }

  return "An unexpected error occurred while communicating with the API.";
}

function normalizePaginatedCommentsResponse(
  response: unknown,
): PaginatedCommentsResponse {
  const payload = response as {
    data?: FacebookComment[] | { data?: FacebookComment[] };
    meta?: {
      current_page?: number;
      per_page?: number;
      total?: number;
      last_page?: number;
    };
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
  };

  // Supports Laravel ResourceCollection responses whose `data`
  // property contains the actual array.
  const nested = Array.isArray(payload.data)
    ? payload.data
    : payload.data?.data ?? [];

  const currentPage = Number(
    payload.meta?.current_page ?? payload.current_page ?? 1,
  );

  const perPage = Number(
    payload.meta?.per_page ?? payload.per_page ?? nested.length,
  );

  const total = Number(payload.meta?.total ?? payload.total ?? nested.length);

  const lastPage = Number(
    payload.meta?.last_page ??
      payload.last_page ??
      Math.max(1, Math.ceil(total / Math.max(perPage, 1))),
  );

  return {
    data: nested,
    meta: {
      currentPage,
      perPage,
      total,
      lastPage,
      hasMorePages: currentPage < lastPage,
    },
  };
}

export const postCommentsAnalyticsService = {
  /**
   * Fetch a single page of comments for a post.
   *
   * `postId` should be the internal post UUID expected by your API,
   * unless your Laravel route explicitly uses the Facebook post ID.
   */
  async getComments(
    postId: string,
    params: CommentsQueryParams = {},
  ): Promise<PaginatedCommentsResponse> {
    try {
      const query = buildQueryParams(params).toString();
      const path =
        `${FACEBOOK_POSTS_BASE}/${encodePathSegment(postId)}/comments`;

      const response = await api.get(
        query ? `${path}?${query}` : path,
      );

      return normalizePaginatedCommentsResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Fetch aggregate analytics for a post.
   *
   * Expected response:
   * { data: PostCommentsAnalytics }
   */
  async getAnalytics(
    postId: string,
  ): Promise<PostCommentsAnalytics> {
    try {
      const path =
        `${FACEBOOK_POSTS_BASE}/${encodePathSegment(postId)}/comments/analytics`;

      const response = await api.get<PostCommentsAnalyticsResponse>(path);

      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Fetch topics identified in comments for a post.
   *
   * If your analytics endpoint already includes topics, you may remove
   * this method and use analytics.data.topics instead.
   */
  async getTopics(
    postId: string,
  ): Promise<PostCommentsAnalytics["topics"]> {
    try {
      const path =
        `${FACEBOOK_POSTS_BASE}/${encodePathSegment(postId)}/comments/topics`;

      const response = await api.get<{
        data: PostCommentsAnalytics["topics"];
      }>(path);

      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Request synchronization from Facebook through your Laravel backend.
   *
   * This endpoint should queue the sync and return its actual status.
   * It should not report success merely because a request was submitted.
   */
  async syncComments(
    postId: string,
  ): Promise<SyncCommentsResult> {
    try {
      const path =
        `${FACEBOOK_POSTS_BASE}/${encodePathSegment(postId)}/comments/sync`;

      const response = await api.post<{ data?: SyncCommentsResult } | SyncCommentsResult>(
        path,
      );

      const payload = response.data;

      if ("data" in payload && payload.data) {
        return payload.data;
      }

      return payload as SyncCommentsResult;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export { getErrorMessage };