
"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import { facebookPostService } from "@/services/facebook/post"

import type {
  FacebookPost,
  FacebookPostsPagination,
  FacebookPostsQueryParams,
  FacebookPostsResponse,
  FacebookPostsSyncResponse,
} from "@/types/facebook/post"

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const DEFAULT_PER_PAGE = 20

const DEFAULT_PAGINATION: FacebookPostsPagination = {
  current_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
  last_page: 1,
  from: null,
  to: null,
}

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export const useFacebookPosts = () => {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [posts, setPosts] = useState<FacebookPost[]>([])

  const [pagination, setPagination] =
    useState<FacebookPostsPagination>(DEFAULT_PAGINATION)

  const [isLoading, setIsLoading] = useState(false)

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)

  const [isFindingPost, setIsFindingPost] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | Get Posts
  |--------------------------------------------------------------------------
  |
  | Replaces the current collection and pagination metadata.
  |
  */

  const getPosts = useCallback(
    async (
      facebookPageId: string,
      params?: FacebookPostsQueryParams,
    ) => {
      try {
        setIsLoading(true)

        const response: FacebookPostsResponse =
          await facebookPostService.getPosts(
            facebookPageId,
            params,
          )

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load Facebook posts.",
          )
        }

        setPosts(response.data.posts)
        setPagination(response.data.pagination)

        return response.data
      } catch (error) {
        toast.error("Unable to load Facebook posts", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  /*
  |--------------------------------------------------------------------------
  | Load More Posts
  |--------------------------------------------------------------------------
  |
  | Loads and appends the next page without duplicating post IDs.
  |
  */

  const loadMorePosts = useCallback(
    async (facebookPageId: string) => {
      if (isLoadingMore || isLoading || isFindingPost) {
        return
      }

      const currentPage = pagination.current_page
      const lastPage = pagination.last_page

      if (currentPage >= lastPage) {
        return
      }

      const nextPage = currentPage + 1

      try {
        setIsLoadingMore(true)

        const response: FacebookPostsResponse =
          await facebookPostService.getPosts(
            facebookPageId,
            {
              page: nextPage,
              per_page:
                pagination.per_page || DEFAULT_PER_PAGE,
            },
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load more Facebook posts.",
          )
        }

        const nextPosts = response.data.posts

        setPosts((currentPosts) => {
          const existingIds = new Set(
            currentPosts.map((post) => post.id),
          )

          const uniqueNextPosts = nextPosts.filter(
            (post) => !existingIds.has(post.id),
          )

          return [...currentPosts, ...uniqueNextPosts]
        })

        setPagination(response.data.pagination)

        return response.data
      } catch (error) {
        toast.error("Unable to load more Facebook posts", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsLoadingMore(false)
      }
    },
    [
      isLoadingMore,
      isLoading,
      isFindingPost,
      pagination.current_page,
      pagination.last_page,
      pagination.per_page,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Find Post by ID
  |--------------------------------------------------------------------------
  |
  | 1. Searches already loaded posts.
  | 2. Requests additional pages when necessary.
  | 3. Stops when the post is found or the final page is reached.
  |
  | Note: This searches the posts returned by your existing API.
  | It does not guarantee discovery of posts excluded by the API.
  |
  */

  const findPostById = useCallback(
    async (
      facebookPageId: string,
      postId: string,
    ): Promise<FacebookPost | null> => {
      const normalizedPageId = facebookPageId.trim()
      const normalizedPostId = postId.trim()

      if (!normalizedPageId || !normalizedPostId) {
        toast.error("Invalid search", {
          description:
            "Facebook page ID and post ID are required.",
        })

        return null
      }

      if (isFindingPost || isLoading || isLoadingMore) {
        return null
      }

      try {
        setIsFindingPost(true)

        // Search the currently loaded collection first.
        const existingPost = posts.find(
          (post) => post.id === normalizedPostId,
        )

        if (existingPost) {
          return existingPost
        }

        /*
         * Start with the next page after the currently loaded
         * collection. Do not replace the user's existing posts.
         */
        let nextPage = pagination.current_page + 1
        let lastPage = pagination.last_page

        while (nextPage <= lastPage) {
          const response: FacebookPostsResponse =
            await facebookPostService.getPosts(
              normalizedPageId,
              {
                page: nextPage,
                per_page:
                  pagination.per_page || DEFAULT_PER_PAGE,
              },
            )

          if (!response.success) {
            throw new Error(
              response.message ||
                "Unable to search Facebook posts.",
            )
          }

          const pageData = response.data
          const pagePosts = pageData.posts

          // Append newly retrieved posts without duplicates.
          setPosts((currentPosts) => {
            const existingIds = new Set(
              currentPosts.map((post) => post.id),
            )

            const uniquePosts = pagePosts.filter(
              (post) => !existingIds.has(post.id),
            )

            return [...currentPosts, ...uniquePosts]
          })

          setPagination(pageData.pagination)

          // Search the newly fetched page.
          const matchingPost = pagePosts.find(
            (post) => post.id === normalizedPostId,
          )

          if (matchingPost) {
            return matchingPost
          }

          lastPage = pageData.pagination.last_page
          nextPage = pageData.pagination.current_page + 1
        }

        toast.error("Post not found", {
          description:
            `No post with ID "${normalizedPostId}" was found ` +
            "in the available pages.",
        })

        return null
      } catch (error) {
        toast.error("Unable to find Facebook post", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsFindingPost(false)
      }
    },
    [
      posts,
      pagination.current_page,
      pagination.last_page,
      pagination.per_page,
      isFindingPost,
      isLoading,
      isLoadingMore,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Has More Posts
  |--------------------------------------------------------------------------
  */

  const hasMorePosts =
    pagination.current_page < pagination.last_page

  /*
  |--------------------------------------------------------------------------
  | Sync Posts
  |--------------------------------------------------------------------------
  |
  | Synchronizes posts with Meta and refreshes the current page.
  |
  */

  const syncPosts = useCallback(
    async (facebookPageId: string) => {
      try {
        setIsSyncing(true)

        const response: FacebookPostsSyncResponse =
          await facebookPostService.syncPosts(
            facebookPageId,
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook posts.",
          )
        }

        await getPosts(facebookPageId, {
          page: pagination.current_page,
          per_page:
            pagination.per_page || DEFAULT_PER_PAGE,
        })

        toast.success("Facebook posts synchronized", {
          description:
            `${response.data.posts_for_comment_sync_count} ` +
            "post(s) require comment synchronization.",
        })

        return response.data
      } catch (error) {
        toast.error("Unable to synchronize Facebook posts", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsSyncing(false)
      }
    },
    [
      getPosts,
      pagination.current_page,
      pagination.per_page,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Clear Posts
  |--------------------------------------------------------------------------
  */

  const clearPosts = useCallback(() => {
    setPosts([])
    setPagination(DEFAULT_PAGINATION)
    setIsLoadingMore(false)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    // Data
    posts,
    pagination,

    // Loading states
    isLoading,
    isLoadingMore,
    isSyncing,
    isFindingPost,

    // Pagination
    hasMorePosts,

    // Operations
    getPosts,
    loadMorePosts,
    findPostById,
    syncPosts,
    clearPosts,
  }
}
