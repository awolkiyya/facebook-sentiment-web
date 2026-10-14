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

  const [posts, setPosts] =
    useState<FacebookPost[]>([])

  const [pagination, setPagination] =
    useState<FacebookPostsPagination>(
      DEFAULT_PAGINATION,
    )

  /*
   * Initial / replacement loading.
   *
   * Used by:
   * - initial page load
   * - refresh
   * - changing the complete result set
   */
  const [isLoading, setIsLoading] =
    useState(false)

  /*
   * Next-page loading.
   *
   * Used only by infinite scrolling.
   */
  const [isLoadingMore, setIsLoadingMore] =
    useState(false)

  /*
   * Facebook/Meta synchronization.
   */
  const [isSyncing, setIsSyncing] =
    useState(false)

  /*
  |--------------------------------------------------------------------------
  | Get Posts
  |--------------------------------------------------------------------------
  |
  | This method REPLACES the current collection.
  |
  | Example:
  |
  | page 1 -> [1 ... 20]
  |
  | Calling getPosts(page: 1) again replaces the
  | existing posts instead of appending them.
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
            response.message ||
              "Unable to load Facebook posts.",
          )
        }

        /*
         * Replace the current collection.
         */
        setPosts(
          response.data.posts,
        )

        /*
         * Replace pagination metadata.
         */
        setPagination(
          response.data.pagination,
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to load Facebook posts",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          },
        )

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
  | This method is specifically for infinite scrolling.
  |
  | It:
  |
  | 1. Checks whether another page exists.
  | 2. Prevents duplicate requests.
  | 3. Requests the next page.
  | 4. Appends the new posts.
  | 5. Updates pagination metadata.
  |
  */

  const loadMorePosts = useCallback(
    async (
      facebookPageId: string,
    ) => {
      /*
      |--------------------------------------------------------------------------
      | Prevent duplicate requests
      |--------------------------------------------------------------------------
      */

      if (isLoadingMore) {
        return
      }

      /*
      |--------------------------------------------------------------------------
      | Determine whether another page exists
      |--------------------------------------------------------------------------
      */

      const currentPage =
        pagination.current_page

      const lastPage =
        pagination.last_page

      if (
        currentPage >=
        lastPage
      ) {
        return
      }

      /*
      |--------------------------------------------------------------------------
      | Next page
      |--------------------------------------------------------------------------
      */

      const nextPage =
        currentPage + 1

      try {
        setIsLoadingMore(true)

        const response: FacebookPostsResponse =
          await facebookPostService.getPosts(
            facebookPageId,
            {
              page: nextPage,

              per_page:
                pagination.per_page ||
                DEFAULT_PER_PAGE,
            },
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load more Facebook posts.",
          )
        }

        const nextPosts =
          response.data.posts

        /*
        |--------------------------------------------------------------------------
        | Append safely
        |--------------------------------------------------------------------------
        |
        | Avoid duplicate local post IDs.
        |
        | This protects against:
        |
        | - repeated observer events
        | - backend changes between requests
        | - accidental duplicate pages
        |
        */

        setPosts(
          (currentPosts) => {
            const existingIds =
              new Set(
                currentPosts.map(
                  (post) =>
                    post.id,
                ),
              )

            const uniqueNextPosts =
              nextPosts.filter(
                (post) =>
                  !existingIds.has(
                    post.id,
                  ),
              )

            return [
              ...currentPosts,
              ...uniqueNextPosts,
            ]
          },
        )

        /*
        |--------------------------------------------------------------------------
        | Update pagination
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | Use the pagination returned by the API
        | rather than manually calculating it.
        |
        */

        setPagination(
          response.data.pagination,
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to load more Facebook posts",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          },
        )

        throw error
      } finally {
        setIsLoadingMore(false)
      }
    },
    [
      isLoadingMore,
      pagination.current_page,
      pagination.last_page,
      pagination.per_page,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Has More Posts
  |--------------------------------------------------------------------------
  |
  | Used by the IntersectionObserver on the posts page.
  |
  | Example:
  |
  | current_page = 1
  | last_page    = 38
  |
  | hasMorePosts = true
  |
  | When:
  |
  | current_page = 38
  | last_page    = 38
  |
  | hasMorePosts = false
  |
  */

  const hasMorePosts =
    pagination.current_page <
    pagination.last_page

  /*
  |--------------------------------------------------------------------------
  | Sync Posts
  |--------------------------------------------------------------------------
  |
  | Synchronizes posts from Meta and then reloads
  | the currently visible page.
  |
  */

  const syncPosts = useCallback(
    async (
      facebookPageId: string,
    ) => {
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

        /*
        |--------------------------------------------------------------------------
        | Refresh the currently visible page
        |--------------------------------------------------------------------------
        |
        | Keep the user's current pagination position.
        |
        */

        await getPosts(
          facebookPageId,
          {
            page:
              pagination.current_page,

            per_page:
              pagination.per_page ||
              DEFAULT_PER_PAGE,
          },
        )

        toast.success(
          "Facebook posts synchronized",
          {
            description:
              `${response.data.posts_for_comment_sync_count} post(s) require comment synchronization.`,
          },
        )

        return response.data
      } catch (error) {
        toast.error(
          "Unable to synchronize Facebook posts",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          },
        )

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

  const clearPosts =
    useCallback(() => {
      setPosts([])

      setPagination(
        DEFAULT_PAGINATION,
      )

      setIsLoadingMore(false)
    }, [])

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    /*
     * Data
     */
    posts,
    pagination,

    /*
     * Loading states
     */
    isLoading,
    isLoadingMore,
    isSyncing,

    /*
     * Pagination state
     */
    hasMorePosts,

    /*
     * Operations
     */
    getPosts,
    loadMorePosts,
    syncPosts,
    clearPosts,
  }
}