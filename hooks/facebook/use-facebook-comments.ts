import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { postCommentsAnalyticsService } from "@/services/facebook/post-comments-analytics";

import type {
  CommentsQueryParams,
} from "@/types/facebook/post-comments-analytics";

/**
 * Shared query keys for Facebook post comments.
 */
export const facebookCommentKeys = {
  all: ["facebook-comments"] as const,

  post: (postId: string) =>
    [...facebookCommentKeys.all, postId] as const,

  comments: (
    postId: string,
    params: CommentsQueryParams,
  ) =>
    [...facebookCommentKeys.post(postId), "list", params] as const,

  analytics: (postId: string) =>
    [...facebookCommentKeys.post(postId), "analytics"] as const,

  topics: (postId: string) =>
    [...facebookCommentKeys.post(postId), "topics"] as const,
};

/**
 * Fetch paginated comments with optional search and filters.
 */
export function useFacebookPostComments(
  postId: string,
  params: CommentsQueryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.comments(postId, params),

    queryFn: () =>
      postCommentsAnalyticsService.getComments(postId, params),

    enabled: Boolean(postId) && enabled,

    placeholderData: (previousData) => previousData,

    staleTime: 30_000,
  });
}

/**
 * Fetch sentiment analytics for a Facebook post.
 */
export function useFacebookPostCommentsAnalytics(
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.analytics(postId),

    queryFn: () =>
      postCommentsAnalyticsService.getAnalytics(postId),

    enabled: Boolean(postId) && enabled,

    staleTime: 60_000,
  });
}

/**
 * Fetch classified topics for a Facebook post.
 */
export function useFacebookCommentTopics(
  postId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: facebookCommentKeys.topics(postId),

    queryFn: () =>
      postCommentsAnalyticsService.getTopics(postId),

    enabled: Boolean(postId) && enabled,

    staleTime: 60_000,
  });
}

/**
 * Synchronize Facebook comments and refresh cached post data.
 */
export function useSyncFacebookComments(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [
      ...facebookCommentKeys.post(postId),
      "sync",
    ],

    mutationFn: () =>
      postCommentsAnalyticsService.syncComments(postId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: facebookCommentKeys.post(postId),
      });
    },
  });
}