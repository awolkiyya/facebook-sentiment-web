
import { api } from "@/lib/api/api";
import { GenerateInsightRequest, GenerateInsightResponse, InsightLanguage, InsightListParams, InsightListResponse, LatestInsightResponse, PostInsightData } from "@/types/ai-insight.types";



interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AxiosLikeError {
  isAxiosError?: boolean;
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

interface ApiResponse {
  success: true;
  message: string;
  data: unknown;
  meta?: unknown;
}

function isAxiosLikeError(
  cause: unknown,
): cause is AxiosLikeError {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "isAxiosError" in cause
  );
}

function extractMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractMessages);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(extractMessages);
  }

  return [];
}

function getApiErrorMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const response = body as ApiErrorResponse;
  const messages = extractMessages(response.errors);

  if (messages.length > 0) {
    return messages[0];
  }

  if (
    typeof response.message === "string" &&
    response.message.trim()
  ) {
    return response.message;
  }

  return null;
}

function normalizeApiError(
  cause: unknown,
  fallback: string,
): Error {
  if (isAxiosLikeError(cause)) {
    const message = getApiErrorMessage(cause.response?.data);

    console.error("[AI Insight API Error]", {
      status: cause.response?.status,
      response: cause.response?.data,
      requestMessage: cause.message,
    });

    return new Error(message ?? cause.message ?? fallback);
  }

  if (cause instanceof Error) {
    return cause;
  }

  return new Error(fallback);
}

function assertSuccessfulResponse(
  body: unknown,
  fallback: string,
): asserts body is ApiResponse {
  if (typeof body !== "object" || body === null) {
    throw new Error(fallback);
  }

  const response = body as {
    success?: unknown;
    message?: unknown;
    data?: unknown;
  };

  if (response.success !== true) {
    throw new Error(getApiErrorMessage(body) ?? fallback);
  }
}

function isCancellation(
  cause: unknown,
  signal?: AbortSignal,
): boolean {
  return (
    signal?.aborted === true ||
    (isAxiosLikeError(cause) && cause.code === "ERR_CANCELED")
  );
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Validate a saved Laravel PostAiInsightResource.
 */
function validateSavedInsight(
  data: unknown,
): data is PostInsightData {
  if (!isRecord(data)) {
    return false;
  }

  const validLanguage =
    data.language === "en" ||
    data.language === "am" ||
    data.language === "or";

  const validStatus =
    data.status === "PENDING" ||
    data.status === "PROCESSING" ||
    data.status === "COMPLETED" ||
    data.status === "FAILED";

  return (
    typeof data.id === "string" &&
    typeof data.facebook_post_id === "string" &&
    validLanguage &&
    validStatus &&
    (typeof data.summary === "string" ||
      data.summary === null) &&
    (data.key_findings === null ||
      (Array.isArray(data.key_findings) &&
        data.key_findings.every(
          (item) => typeof item === "string",
        ))) &&
    (data.recommendations === null ||
      (Array.isArray(data.recommendations) &&
        data.recommendations.every(
          (item) => typeof item === "string",
        ))) &&
    typeof data.actionable === "boolean" &&
    typeof data.analyzed_comments === "number" &&
    isRecord(data.model) &&
    isRecord(data.evidence)
  );
}

/**
 * Validate the full generation DTO, if the API returns one.
 */
function validateGenerationData(
  data: unknown,
): data is PostInsightData {
  if (!isRecord(data)) {
    return false;
  }

  return (
    typeof data.post_id === "string" &&
    (data.language === "en" ||
      data.language === "am" ||
      data.language === "or") &&
    typeof data.summary === "string" &&
    Array.isArray(data.key_findings) &&
    data.key_findings.every(
      (item) => typeof item === "string",
    ) &&
    Array.isArray(data.recommendations) &&
    data.recommendations.every(
      (item) => typeof item === "string",
    ) &&
    typeof data.generated_at === "string"
  );
}

function assertInsightMatchesRequest(
  insight: PostInsightData,
  postId: string,
  language: InsightLanguage,
): void {
  if (
    insight.facebook_post_id !== postId ||
    insight.language !== language
  ) {
    throw new Error(
      "The API returned an insight for a different post or language.",
    );
  }
}

function assertGenerationMatchesRequest(
  insight: PostInsightData,
  postId: string,
  language: InsightLanguage,
): void {
  if (
    insight.post?.id !== postId ||
    insight.language !== language
  ) {
    throw new Error(
      "The API returned generated insight data for a different post or language.",
    );
  }
}

export const aiInsightService = {
  /**
   * Retrieve the latest saved insight for a post.
   * Does not trigger AI generation.
   */
  showLatest: async (
    postId: string,
    language: InsightLanguage,
    signal?: AbortSignal,
  ): Promise<LatestInsightResponse> => {
    if (!postId.trim()) {
      throw new Error("A Facebook post must be selected.");
    }

    try {
      const response = await api.get<LatestInsightResponse>(
        `/v1/ai-insights/facebook/posts/${encodeURIComponent(postId)}/insights/latest`,
        {
          params: { language },
          signal,
        },
      );

      const body: unknown = response.data;

      assertSuccessfulResponse(
        body,
        "Unable to retrieve the saved insight.",
      );

      if (body.data !== null) {
        if (!validateSavedInsight(body.data)) {
          throw new Error(
            "The API returned an invalid saved insight.",
          );
        }

        assertInsightMatchesRequest(
          body.data,
          postId,
          language,
        );
      }

      return body as unknown as LatestInsightResponse;
    } catch (cause: unknown) {
      if (isCancellation(cause, signal)) {
        throw cause;
      }

      throw normalizeApiError(
        cause,
        "Unable to retrieve the saved insight.",
      );
    }
  },

  /**
   * Queue AI insight generation.
   *
   * Supports either the Laravel 202 queue acknowledgement
   * or an API response containing the complete generation DTO.
   */
  generate: async (
    postId: string,
    request: GenerateInsightRequest,
    signal?: AbortSignal,
  ): Promise<GenerateInsightResponse> => {
    if (!postId.trim()) {
      throw new Error("A Facebook post must be selected.");
    }

    try {
      const response = await api.post<GenerateInsightResponse>(
        `/v1/ai-insights/facebook/posts/${encodeURIComponent(postId)}/insights`,
        request,
        { signal },
      );

      const body: unknown = response.data;

      assertSuccessfulResponse(
        body,
        "Unable to queue post insight generation.",
      );

      if (!isRecord(body.data)) {
        throw new Error(
          "The API returned an invalid generation response.",
        );
      }

      const data = body.data;

      // Laravel asynchronous generation acknowledgement.
      if (
        typeof data.insight_id === "string" &&
        typeof data.post_id === "string" &&
        typeof data.status === "string"
      ) {
        if (data.post_id !== postId) {
          throw new Error(
            "The API returned a generation job for a different post.",
          );
        }

        if (
          data.language !== undefined &&
          data.language !== request.language
        ) {
          throw new Error(
            "The API returned a generation job for a different language.",
          );
        }

        if (
          !["PENDING", "PROCESSING", "COMPLETED"].includes(
            data.status,
          )
        ) {
          throw new Error(
            "The API returned an unknown generation status.",
          );
        }

        return body as unknown as GenerateInsightResponse;
      }

      // Alternative: the endpoint returns complete insight data.
      if (!validateGenerationData(data)) {
        throw new Error(
          "The API returned an invalid generation response.",
        );
      }

      assertGenerationMatchesRequest(
        data,
        postId,
        request.language,
      );

      return body as unknown as GenerateInsightResponse;
    } catch (cause: unknown) {
      if (isCancellation(cause, signal)) {
        throw cause;
      }

      throw normalizeApiError(
        cause,
        "Unable to queue post insight generation.",
      );
    }
  },

  /**
   * Retrieve the paginated list of saved insights.
   *
   * Supported filters:
   * language, model, post_id, from, to, page, per_page.
   */
  list: async (
    params: InsightListParams = {},
    signal?: AbortSignal,
  ): Promise<InsightListResponse> => {
    try {
      const response = await api.get<InsightListResponse>(
        "/v1/ai-insights/facebook/posts/insights",
        {
          params: {
            per_page: 100,
            ...params,
          },
          signal,
        },
      );

      const body: unknown = response.data;

      assertSuccessfulResponse(
        body,
        "Unable to retrieve saved insights.",
      );

      if (!Array.isArray(body.data)) {
        throw new Error(
          "The API returned an invalid insights list.",
        );
      }

      if (!isRecord(body.meta)) {
        throw new Error(
          "The API returned invalid pagination metadata.",
        );
      }

      const meta = body.meta;

      if (
        typeof meta.current_page !== "number" ||
        typeof meta.last_page !== "number" ||
        typeof meta.per_page !== "number" ||
        typeof meta.total !== "number"
      ) {
        throw new Error(
          "The API returned invalid pagination values.",
        );
      }

      for (const item of body.data) {
        if (!validateSavedInsight(item)) {
          throw new Error(
            "The API returned an invalid saved insight record.",
          );
        }
      }

      return body as unknown as InsightListResponse;
    } catch (cause: unknown) {
      if (isCancellation(cause, signal)) {
        throw cause;
      }

      throw normalizeApiError(
        cause,
        "Unable to retrieve saved insights.",
      );
    }
  },
};
