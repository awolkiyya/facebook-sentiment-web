
"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import { facebookService } from "@/services/facebook.service"

import type {
  FacebookComment,
  FacebookCommentsPagination,
  FacebookCommentsResponse,
  FacebookCommentsSyncResponse,
  FacebookPostCommentsParams,
} from "@/types/facebook/comment"

import type {
  FacebookPage,
  FacebookPageResponse,
  FacebookPagesResponse,
} from "@/types/facebook/page"

import type {
  FacebookPost,
  FacebookPostsPagination,
  FacebookPostsQueryParams,
  FacebookPostsResponse,
  FacebookPostsSyncResponse,
} from "@/types/facebook/post"

/*
|--------------------------------------------------------------------------
| Constants and initial state
|--------------------------------------------------------------------------
*/

const DEFAULT_PAGE_SIZE = 20

const createEmptyPagination = () => ({
  current_page: 1,
  per_page: DEFAULT_PAGE_SIZE,
  total: 0,
  last_page: 1,
  from: null,
  to: null,
})

/*
|--------------------------------------------------------------------------
| Facebook Hook
|--------------------------------------------------------------------------
|
| Responsibilities:
| - Facebook OAuth connection
| - Connected Page management
| - Page monitoring
| - Page metadata synchronization
| - Page disconnection
| - Post fetching and synchronization
| - Comment fetching and synchronization
|
| Laravel remains the source of truth. After successful mutations,
| the corresponding resources are fetched again from the API.
|
| ID contract:
| - facebookPageId: Meta/Facebook Page ID
| - facebookPostId: Local Laravel FacebookPost UUID
|
*/

export function useFacebook() {
  /*
  |--------------------------------------------------------------------------
  | Page state
  |--------------------------------------------------------------------------
  */

  const [pages, setPages] = useState<FacebookPage[]>([])

  const [summary, setSummary] = useState({
    total: 0,
    monitoring: 0,
  })

  /*
  |--------------------------------------------------------------------------
  | Post state
  |--------------------------------------------------------------------------
  */

  const [posts, setPosts] = useState<FacebookPost[]>([])

  const [postsPagination, setPostsPagination] =
    useState<FacebookPostsPagination>(createEmptyPagination())

  /*
  |--------------------------------------------------------------------------
  | Comment state
  |--------------------------------------------------------------------------
  */

  const [comments, setComments] = useState<FacebookComment[]>([])

  const [commentsPagination, setCommentsPagination] =
    useState<FacebookCommentsPagination>(createEmptyPagination())

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isSyncingPosts, setIsSyncingPosts] = useState(false)

  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSyncingComments, setIsSyncingComments] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | Entity-specific loading state
  |--------------------------------------------------------------------------
  */

  const [updatingPageId, setUpdatingPageId] =
    useState<string | null>(null)

  const [syncingPageId, setSyncingPageId] =
    useState<string | null>(null)

  const [disconnectingPageId, setDisconnectingPageId] =
    useState<string | null>(null)

  /*
  |--------------------------------------------------------------------------
  | Get pages
  |--------------------------------------------------------------------------
  */

  const getPages = useCallback(async () => {
    try {
      setIsLoading(true)

      const response: FacebookPagesResponse =
        await facebookService.getPages()

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load Facebook Pages.",
        )
      }

      setPages(response.data.pages)
      setSummary(response.data.summary)

      return response.data
    } catch (error) {
      toast.error("Unable to load Facebook Pages", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again later.",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Connect Facebook
  |--------------------------------------------------------------------------
  */

  const connect = useCallback(() => {
    try {
      setIsConnecting(true)
      facebookService.connect()
    } catch (error) {
      setIsConnecting(false)

      toast.error("Unable to connect Facebook", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again later.",
      })
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Update Page monitoring
  |--------------------------------------------------------------------------
  */

  const updateMonitoring = useCallback(
    async (facebookPageId: string, isActive: boolean) => {
      try {
        setUpdatingPageId(facebookPageId)

        const response: FacebookPageResponse =
          await facebookService.updateMonitoring(
            facebookPageId,
            isActive,
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to update monitoring status.",
          )
        }

        // Reload authoritative Page data and summary.
        await getPages()

        toast.success(
          isActive ? "Monitoring enabled" : "Monitoring disabled",
          {
            description: `${response.data.name} is now ${
              isActive ? "being monitored." : "not being monitored."
            }`,
          },
        )

        return response.data
      } catch (error) {
        toast.error("Unable to update monitoring", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setUpdatingPageId(null)
      }
    },
    [getPages],
  )

  /*
  |--------------------------------------------------------------------------
  | Synchronize Page metadata
  |--------------------------------------------------------------------------
  */

  const syncPage = useCallback(
    async (facebookPageId: string) => {
      try {
        setSyncingPageId(facebookPageId)

        const response: FacebookPageResponse =
          await facebookService.syncPage(facebookPageId)

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook Page.",
          )
        }

        await getPages()

        toast.success("Facebook Page synchronized", {
          description: `${response.data.name} was synchronized successfully.`,
        })

        return response.data
      } catch (error) {
        toast.error("Unable to synchronize Facebook Page", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setSyncingPageId(null)
      }
    },
    [getPages],
  )

  /*
  |--------------------------------------------------------------------------
  | Disconnect Page
  |--------------------------------------------------------------------------
  */

  const disconnect = useCallback(
    async (facebookPageId: string) => {
      try {
        setDisconnectingPageId(facebookPageId)

        const response =
          await facebookService.disconnect(facebookPageId)

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to disconnect Facebook Page.",
          )
        }

        // Clear dependent data so disconnected Page content
        // does not remain visible in the current hook instance.
        setPosts([])
        setPostsPagination(createEmptyPagination())

        setComments([])
        setCommentsPagination(createEmptyPagination())

        await getPages()

        toast.success("Facebook Page disconnected", {
          description:
            "The Facebook Page has been disconnected successfully.",
        })

        return response.data
      } catch (error) {
        toast.error("Unable to disconnect Facebook Page", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setDisconnectingPageId(null)
      }
    },
    [getPages],
  )

  /*
  |--------------------------------------------------------------------------
  | Get posts
  |--------------------------------------------------------------------------
  */

  const getPosts = useCallback(
    async (
      facebookPageId: string,
      params?: FacebookPostsQueryParams,
    ) => {
      try {
        setIsLoadingPosts(true)

        const response: FacebookPostsResponse =
          await facebookService.getPosts(
            facebookPageId,
            params,
          )

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load Facebook posts.",
          )
        }

        setPosts(response.data.posts)
        setPostsPagination(response.data.pagination)

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
        setIsLoadingPosts(false)
      }
    },
    [],
  )

  /*
  |--------------------------------------------------------------------------
  | Synchronize posts
  |--------------------------------------------------------------------------
  */

  const syncPosts = useCallback(
    async (facebookPageId: string) => {
      try {
        setIsSyncingPosts(true)

        const response: FacebookPostsSyncResponse =
          await facebookService.syncPosts(facebookPageId)

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook posts.",
          )
        }

        await getPosts(facebookPageId, {
          page: postsPagination.current_page,
          per_page: postsPagination.per_page,
        })

        toast.success("Facebook posts synchronized", {
          description:
            `${response.data.posts_for_comment_sync_count} post(s) require comment synchronization.`,
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
        setIsSyncingPosts(false)
      }
    },
    [
      getPosts,
      postsPagination.current_page,
      postsPagination.per_page,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Get comments
  |--------------------------------------------------------------------------
  */

  const getComments = useCallback(
    async (
      facebookPageId: string,
      facebookPostId: string,
      params?: FacebookPostCommentsParams,
    ) => {
      try {
        setIsLoadingComments(true)

        const response: FacebookCommentsResponse =
          await facebookService.getComments(
            facebookPageId,
            facebookPostId,
            params,
          )

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load Facebook comments.",
          )
        }

        setComments(response.data.comments)
        setCommentsPagination(response.data.pagination)

        return response.data
      } catch (error) {
        toast.error("Unable to load Facebook comments", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsLoadingComments(false)
      }
    },
    [],
  )

  /*
  |--------------------------------------------------------------------------
  | Synchronize comments
  |--------------------------------------------------------------------------
  */

  const syncComments = useCallback(
    async (
      facebookPageId: string,
      facebookPostId: string,
    ) => {
      try {
        setIsSyncingComments(true)

        const response: FacebookCommentsSyncResponse =
          await facebookService.syncComments(
            facebookPageId,
            facebookPostId,
          )

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook comments.",
          )
        }

        await getComments(
          facebookPageId,
          facebookPostId,
          {
            page: commentsPagination.current_page,
            perPage: commentsPagination.per_page,
          },
        )

        toast.success("Facebook comments synchronized", {
          description:
            `${response.data.comments_for_analysis} comment(s) require sentiment analysis.`,
        })

        return response.data
      } catch (error) {
        toast.error("Unable to synchronize Facebook comments", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        })

        throw error
      } finally {
        setIsSyncingComments(false)
      }
    },
    [
      getComments,
      commentsPagination.current_page,
      commentsPagination.per_page,
    ],
  )

  /*
  |--------------------------------------------------------------------------
  | Public hook API
  |--------------------------------------------------------------------------
  */

  return {
    // Page data
    pages,
    summary,

    // Post data
    posts,
    postsPagination,

    // Comment data
    comments,
    commentsPagination,

    // Loading states
    isLoading,
    isConnecting,
    isLoadingPosts,
    isSyncingPosts,
    isLoadingComments,
    isSyncingComments,

    // Entity-specific loading states
    updatingPageId,
    syncingPageId,
    disconnectingPageId,

    // Page actions
    connect,
    getPages,
    updateMonitoring,
    syncPage,
    disconnect,

    // Post actions
    getPosts,
    syncPosts,

    // Comment actions
    getComments,
    syncComments,
  }
}
