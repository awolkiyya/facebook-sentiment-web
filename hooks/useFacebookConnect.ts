"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { facebookService } from "@/services/facebook.service";

import type {
  FacebookComment,
  FacebookCommentsPagination,
  FacebookCommentsQueryParams,
  FacebookCommentsResponse,
  FacebookCommentsSyncResponse,
  FacebookPage,
  FacebookPageResponse,
  FacebookPagesResponse,
  FacebookPost,
  FacebookPostsPagination,
  FacebookPostsQueryParams,
  FacebookPostsResponse,
  FacebookPostsSyncResponse,
} from "@/types/facebook";

/**
 * ============================================================================
 * FACEBOOK HOOK
 * ============================================================================
 *
 * Handles:
 *
 *     - Facebook OAuth connection
 *     - Fetch connected Pages
 *     - Enable / disable Page monitoring
 *     - Synchronize Page metadata
 *     - Disconnect Page
 *     - Fetch Page posts
 *     - Synchronize Page posts
 *     - Fetch Post comments
 *     - Synchronize Post comments
 *
 * IMPORTANT:
 *
 * After every successful mutation, the corresponding backend resource
 * is re-fetched so the UI always reflects the authoritative database state.
 *
 * INVALIDATION / REFETCH RULES:
 *
 *     updateMonitoring()
 *         -> getPages()
 *
 *     syncPage()
 *         -> getPages()
 *
 *     disconnect()
 *         -> getPages()
 *         -> clear post/comment state
 *
 *     syncPosts()
 *         -> getPosts()
 *
 *     syncComments()
 *         -> getComments()
 *
 * API layer:
 *
 *     facebookService
 *
 * UI layer:
 *
 *     Components / Pages
 *
 * IMPORTANT ID CONTRACT:
 *
 *     facebookPageId
 *         = Meta/Facebook Page ID
 *         = facebook_pages.facebook_page_id
 *
 *     facebookPostId
 *         = Local Laravel FacebookPost UUID
 *         = facebook_posts.id
 *
 *     facebookCommentId
 *         = Local Laravel FacebookComment UUID when used
 *           for internal application operations.
 */

export const useFacebook = () => {
  /*
  |--------------------------------------------------------------------------
  | PAGE STATE
  |--------------------------------------------------------------------------
  */

  const [pages, setPages] =
    useState<FacebookPage[]>([]);

  const [summary, setSummary] = useState({
    total: 0,
    monitoring: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | POST STATE
  |--------------------------------------------------------------------------
  */

  const [posts, setPosts] =
    useState<FacebookPost[]>([]);

  const [postsPagination, setPostsPagination] =
    useState<FacebookPostsPagination>({
      current_page: 1,
      per_page: 20,
      total: 0,
      last_page: 1,
      from: null,
      to: null,
    });

  /*
  |--------------------------------------------------------------------------
  | COMMENT STATE
  |--------------------------------------------------------------------------
  */

  const [comments, setComments] =
    useState<FacebookComment[]>([]);

  const [commentsPagination, setCommentsPagination] =
    useState<FacebookCommentsPagination>({
      current_page: 1,
      per_page: 20,
      total: 0,
      last_page: 1,
      from: null,
      to: null,
    });

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  const [isLoading, setIsLoading] =
    useState(false);

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [isLoadingPosts, setIsLoadingPosts] =
    useState(false);

  const [isSyncingPosts, setIsSyncingPosts] =
    useState(false);

  const [isLoadingComments, setIsLoadingComments] =
    useState(false);

  const [isSyncingComments, setIsSyncingComments] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ENTITY-SPECIFIC STATE
  |--------------------------------------------------------------------------
  */

  const [updatingPageId, setUpdatingPageId] =
    useState<string | null>(null);

  const [syncingPageId, setSyncingPageId] =
    useState<string | null>(null);

  const [disconnectingPageId, setDisconnectingPageId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | GET PAGES
  |--------------------------------------------------------------------------
  */

  /**
   * Fetch all Facebook Pages connected
   * to the authenticated user.
   *
   * This function also acts as the Page cache invalidation /
   * revalidation mechanism after Page mutations.
   */
  const getPages = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: FacebookPagesResponse =
        await facebookService.getPages();

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to load Facebook Pages."
        );
      }

      setPages(response.data.pages);

      setSummary(response.data.summary);

      return response.data;
    } catch (error) {
      toast.error(
        "Unable to load Facebook Pages",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        }
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CONNECT
  |--------------------------------------------------------------------------
  */

  /**
   * Start Facebook OAuth authorization.
   *
   * The browser will be redirected to Laravel,
   * which then redirects the user to Meta.
   *
   * After OAuth completes, Laravel redirects back to
   * the Facebook Pages screen. The screen calls getPages()
   * on mount, so newly connected Pages are automatically loaded.
   */
  const connect = useCallback(() => {
    try {
      setIsConnecting(true);

      facebookService.connect();
    } catch (error) {
      setIsConnecting(false);

      toast.error(
        "Unable to connect Facebook",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again later.",
        }
      );
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE MONITORING
  |--------------------------------------------------------------------------
  */

  /**
   * Enable or disable monitoring
   * for one Facebook Page.
   *
   * After the mutation succeeds, the complete Page collection
   * is re-fetched from Laravel.
   *
   * This guarantees:
   *
   *     - Page state is correct
   *     - Summary count is correct
   *     - Any backend-side changes are reflected
   *     - No stale local calculation is required
   */
  const updateMonitoring = useCallback(
    async (
      facebookPageId: string,
      isActive: boolean
    ) => {
      try {
        setUpdatingPageId(
          facebookPageId
        );

        const response: FacebookPageResponse =
          await facebookService.updateMonitoring(
            facebookPageId,
            isActive
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to update monitoring status."
          );
        }

        /*
         * -------------------------------------------------------
         * INVALIDATE / REFETCH PAGES
         * -------------------------------------------------------
         *
         * Do not manually modify pages or summary here.
         *
         * Laravel is the source of truth.
         */
        await getPages();

        toast.success(
          isActive
            ? "Monitoring enabled"
            : "Monitoring disabled",
          {
            description:
              `${response.data.name} is now ${
                isActive
                  ? "being monitored."
                  : "not being monitored."
              }`,
          }
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to update monitoring",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setUpdatingPageId(null);
      }
    },
    [getPages]
  );

  /*
  |--------------------------------------------------------------------------
  | SYNC PAGE
  |--------------------------------------------------------------------------
  */

  /**
   * Synchronize Facebook Page metadata.
   *
   * After synchronization, re-fetch all Pages so the UI receives
   * the authoritative state from Laravel.
   */
  const syncPage = useCallback(
    async (
      facebookPageId: string
    ) => {
      try {
        setSyncingPageId(
          facebookPageId
        );

        const response: FacebookPageResponse =
          await facebookService.syncPage(
            facebookPageId
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook Page."
          );
        }

        /*
         * -------------------------------------------------------
         * INVALIDATE / REFETCH PAGES
         * -------------------------------------------------------
         */
        await getPages();

        toast.success(
          "Facebook Page synchronized",
          {
            description:
              `${response.data.name} was synchronized successfully.`,
          }
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to synchronize Facebook Page",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setSyncingPageId(null);
      }
    },
    [getPages]
  );

  /*
  |--------------------------------------------------------------------------
  | DISCONNECT PAGE
  |--------------------------------------------------------------------------
  */

  /**
   * Disconnect one Facebook Page.
   *
   * After successful deletion:
   *
   *     1. Clear dependent post/comment state.
   *     2. Re-fetch Pages from Laravel.
   *
   * We intentionally do not manually decrement summary.total
   * or summary.monitoring because the backend is the source of truth.
   */
  const disconnect = useCallback(
    async (
      facebookPageId: string
    ) => {
      try {
        setDisconnectingPageId(
          facebookPageId
        );

        const response =
          await facebookService.disconnect(
            facebookPageId
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to disconnect Facebook Page."
          );
        }

        /*
         * -------------------------------------------------------
         * Clear dependent data.
         * -------------------------------------------------------
         *
         * Posts/comments belong to the Page being disconnected.
         * They should not remain visible in a component that is
         * still mounted.
         */
        setPosts([]);

        setPostsPagination({
          current_page: 1,
          per_page: 20,
          total: 0,
          last_page: 1,
          from: null,
          to: null,
        });

        setComments([]);

        setCommentsPagination({
          current_page: 1,
          per_page: 20,
          total: 0,
          last_page: 1,
          from: null,
          to: null,
        });

        /*
         * -------------------------------------------------------
         * INVALIDATE / REFETCH PAGES
         * -------------------------------------------------------
         */
        await getPages();

        toast.success(
          "Facebook Page disconnected",
          {
            description:
              "The Facebook Page has been disconnected successfully.",
          }
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to disconnect Facebook Page",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setDisconnectingPageId(null);
      }
    },
    [getPages]
  );

  /*
  |--------------------------------------------------------------------------
  | GET POSTS
  |--------------------------------------------------------------------------
  */

  /**
   * Fetch saved Facebook Page posts.
   *
   * Posts are loaded from the Laravel database.
   *
   * This function is also used to invalidate/revalidate
   * the Posts state after synchronization.
   */
  const getPosts = useCallback(
    async (
      facebookPageId: string,
      params?: FacebookPostsQueryParams
    ) => {
      try {
        setIsLoadingPosts(true);

        const response: FacebookPostsResponse =
          await facebookService.getPosts(
            facebookPageId,
            params
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load Facebook posts."
          );
        }

        setPosts(
          response.data.posts
        );

        setPostsPagination(
          response.data.pagination
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to load Facebook posts",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setIsLoadingPosts(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | SYNC POSTS
  |--------------------------------------------------------------------------
  */

  /**
   * Synchronize Facebook Page posts from Meta.
   *
   * After synchronization:
   *
   *     syncPosts()
   *          ↓
   *     Laravel sync
   *          ↓
   *     getPosts()
   *          ↓
   *     UI receives authoritative database state
   */
  const syncPosts = useCallback(
    async (
      facebookPageId: string
    ) => {
      try {
        setIsSyncingPosts(true);

        const response: FacebookPostsSyncResponse =
          await facebookService.syncPosts(
            facebookPageId
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook posts."
          );
        }

        /*
         * -------------------------------------------------------
         * INVALIDATE / REFETCH POSTS
         * -------------------------------------------------------
         *
         * Preserve the currently visible pagination page.
         */
        await getPosts(
          facebookPageId,
          {
            page:
              postsPagination.current_page,
            per_page:
              postsPagination.per_page,
          }
        );

        toast.success(
          "Facebook posts synchronized",
          {
            description:
              `${response.data.posts_for_comment_sync_count} post(s) require comment synchronization.`,
          }
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to synchronize Facebook posts",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setIsSyncingPosts(false);
      }
    },
    [
      getPosts,
      postsPagination.current_page,
      postsPagination.per_page,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | GET COMMENTS
  |--------------------------------------------------------------------------
  */

  /**
   * Fetch saved comments for a Facebook post.
   *
   * Comments are loaded from the Laravel database.
   *
   * This function is also used to invalidate/revalidate
   * comments after synchronization.
   *
   * IMPORTANT:
   *
   *     facebookPageId
   *         = Meta/Facebook Page ID
   *
   *     facebookPostId
   *         = Local Laravel FacebookPost UUID
   */
  const getComments = useCallback(
    async (
      facebookPageId: string,
      facebookPostId: string,
      params?: FacebookCommentsQueryParams
    ) => {
      try {
        setIsLoadingComments(true);

        const response: FacebookCommentsResponse =
          await facebookService.getComments(
            facebookPageId,
            facebookPostId,
            params
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load Facebook comments."
          );
        }

        setComments(
          response.data.comments
        );

        setCommentsPagination(
          response.data.pagination
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to load Facebook comments",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setIsLoadingComments(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | SYNC COMMENTS
  |--------------------------------------------------------------------------
  */

  /**
   * Synchronize comments for a Facebook post from Meta.
   *
   * After synchronization:
   *
   *     syncComments()
   *          ↓
   *     Laravel sync
   *          ↓
   *     getComments()
   *          ↓
   *     UI receives authoritative database state
   *
   * IMPORTANT:
   *
   *     facebookPageId
   *         = Meta/Facebook Page ID
   *
   *     facebookPostId
   *         = Local Laravel FacebookPost UUID
   */
  const syncComments = useCallback(
    async (
      facebookPageId: string,
      facebookPostId: string
    ) => {
      try {
        setIsSyncingComments(
          true
        );

        const response: FacebookCommentsSyncResponse =
          await facebookService.syncComments(
            facebookPageId,
            facebookPostId
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to synchronize Facebook comments."
          );
        }

        /*
         * -------------------------------------------------------
         * INVALIDATE / REFETCH COMMENTS
         * -------------------------------------------------------
         *
         * Preserve the currently visible pagination page.
         */
        await getComments(
          facebookPageId,
          facebookPostId,
          {
            page:
              commentsPagination.current_page,
            per_page:
              commentsPagination.per_page,
          }
        );

        toast.success(
          "Facebook comments synchronized",
          {
            description:
              `${response.data.comments_for_analysis} comment(s) require sentiment analysis.`,
          }
        );

        return response.data;
      } catch (error) {
        toast.error(
          "Unable to synchronize Facebook comments",
          {
            description:
              error instanceof Error
                ? error.message
                : "Please try again later.",
          }
        );

        throw error;
      } finally {
        setIsSyncingComments(
          false
        );
      }
    },
    [
      getComments,
      commentsPagination.current_page,
      commentsPagination.per_page,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return {
    /*
     * Page data
     */
    pages,
    summary,

    /*
     * Post data
     */
    posts,
    postsPagination,

    /*
     * Comment data
     */
    comments,
    commentsPagination,

    /*
     * Loading
     */
    isLoading,
    isConnecting,
    isLoadingPosts,
    isSyncingPosts,
    isLoadingComments,
    isSyncingComments,

    /*
     * Entity-specific loading state
     */
    updatingPageId,
    syncingPageId,
    disconnectingPageId,

    /*
     * Page actions
     */
    connect,
    getPages,
    updateMonitoring,
    syncPage,
    disconnect,

    /*
     * Post actions
     */
    getPosts,
    syncPosts,

    /*
     * Comment actions
     */
    getComments,
    syncComments,
  };
};
