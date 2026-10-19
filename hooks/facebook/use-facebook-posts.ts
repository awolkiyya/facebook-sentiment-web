"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { toast } from "sonner"

import { facebookPostService } from "@/services/facebook/post"

import type {
  FacebookPost,
  FacebookPostsQueryParams,
} from "@/types/facebook/post"

import { ApiClientError } from "@/lib/api/api-error"
import { SingleResponse } from "@/types/api"

type ServerDrivenPostParams = FacebookPostsQueryParams & {
  search?: string
  sort_by?: "published_at" | "engagement"
  sort_direction?: "asc" | "desc"
}


export const facebookPostQueryKeys = {
  all: ["facebook-posts"] as const,

  page: (facebookPageId: string) =>
    [...facebookPostQueryKeys.all, "page", facebookPageId] as const,

  lists: (facebookPageId: string) =>
    [...facebookPostQueryKeys.page(facebookPageId), "list"] as const,

  infinite: (
    facebookPageId: string,
    params: ServerDrivenPostParams,
  ) =>
    [
      ...facebookPostQueryKeys.lists(facebookPageId),
      "infinite",
      params,
    ] as const,

  details: (facebookPageId: string) =>
    [...facebookPostQueryKeys.page(facebookPageId), "details"] as const,

  detail: (facebookPageId: string, postId: string) =>
    [...facebookPostQueryKeys.details(facebookPageId), postId] as const,
}

export function useInfiniteFacebookPosts(
  facebookPageId: string | undefined,
  params: ServerDrivenPostParams,
) {
  const pageId = facebookPageId?.trim() ?? ""

  return useInfiniteQuery({
    queryKey: facebookPostQueryKeys.infinite(pageId, params),

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const response = await facebookPostService.getPosts(
        pageId,
        {
          ...params,
          page: pageParam,
        },
      )

      return response
    },

    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta?.pagination

      if (!pagination) {
        return undefined
      }

      const currentPage = pagination.current_page ?? 1
      const lastPageNumber = pagination.last_page ?? 1

      return currentPage < lastPageNumber
        ? currentPage + 1
        : undefined
    },

    enabled: pageId.length > 0,

    staleTime: 30_000,
  })
}

export function useSyncFacebookPosts() {
  const queryClient = useQueryClient()

  return useMutation<
    SingleResponse<FacebookPost>,
    Error,
    { facebookPageId: string }
  >({
    mutationFn: ({ facebookPageId }) =>
      facebookPostService.syncPosts(facebookPageId),

    onSuccess: async (_response, { facebookPageId }) => {
      await queryClient.invalidateQueries({
        queryKey: facebookPostQueryKeys.page(facebookPageId),
      })

      toast.success("Facebook posts synchronized successfully.")
    },

    onError: () => {
      toast.error("Failed to synchronize Facebook posts.")
    },
  })
}


export function useFacebookPost(
 facebookPageId: string,
 postId: string,
) {
 return useQuery<
   SingleResponse<FacebookPost>,
   ApiClientError
 >({
   queryKey: facebookPostQueryKeys.detail(
     facebookPageId,
     postId,
   ),

   queryFn: () =>
     facebookPostService.getPostById(
       facebookPageId,
       postId,
     ),

   enabled: Boolean(
     facebookPageId.trim() &&
     postId.trim(),
   ),

   staleTime: 30_000,
 })
}