"use client"

import {
  ArrowUp,
  Files,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useParams,
  usePathname,
  useRouter,
} from "next/navigation"

import { Button } from "@/components/ui/button"

import { useFacebookPages } from "@/hooks/facebook/use-facebook-pages"
import { useFacebookPosts } from "@/hooks/facebook/use-facebook-posts"

import type { FacebookPageSummary } from "@/types/facebook/page"
import type { FacebookPost } from "@/types/facebook/post"

import type {
  SentimentFilter,
  SortMode,
} from "@/types/facebook/common"

import {
  calculateFacebookPostAnalytics,
} from "@/utils/facebook-post-analytics"

import {
  FacebookPageHeader,
} from "@/components/facebook/facebook-page-header"

import {
  FacebookPostsDebug,
} from "@/components/facebook/facebook-posts-debug"

import {
  FacebookPostsKpi,
} from "@/components/facebook/facebook-posts-kpi"

import {
  FacebookPostFilters,
} from "@/components/facebook/facebook-post-filters"

import {
  FacebookPostList,
} from "@/components/facebook/facebook-post-list"

import {
  FacebookInsightsRail,
} from "@/components/facebook/insights/facebook-insights-rail"

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const POSTS_PER_PAGE = 20

/*
 * Show the Back to Top control after the user
 * has moved this distance from the top.
 */
const SHOW_BACK_TO_TOP_AFTER = 600

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PagePosts() {
  const router = useRouter()
  const pathname = usePathname()

  const params = useParams<{
    id: string
  }>()

  /*
  |--------------------------------------------------------------------------
  | Facebook Pages
  |--------------------------------------------------------------------------
  */

  const {
    pages,
    getPages,
  } = useFacebookPages()

  /*
  |--------------------------------------------------------------------------
  | Facebook Posts
  |--------------------------------------------------------------------------
  */

  const {
    posts,
    pagination: postsPagination,
    isLoading: isLoadingPosts,
    isLoadingMore,
    isSyncing: isSyncingPosts,
    hasMorePosts,
    getPosts,
    loadMorePosts,
    syncPosts,
  } = useFacebookPosts()

  /*
  |--------------------------------------------------------------------------
  | Route
  |--------------------------------------------------------------------------
  */

  /**
   * External Meta/Facebook Page ID.
   *
   * Example:
   *
   *     100297668388012
   *
   * This is NOT the local Laravel UUID.
   */
  const facebookPageId =
    typeof params?.id === "string"
      ? params.id
      : ""

  /**
   * Preserve existing locale behavior.
   */
  const locale =
    pathname.split("/")[1] || "or"

  /*
  |--------------------------------------------------------------------------
  | Local UI State
  |--------------------------------------------------------------------------
  */

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    sentimentFilter,
    setSentimentFilter,
  ] = useState<SentimentFilter>("all")

  const [
    sortMode,
    setSortMode,
  ] = useState<SortMode>("recent")

  const [
    expandedCommentsId,
    setExpandedCommentsId,
  ] = useState<string | null>(null)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    showBackToTop,
    setShowBackToTop,
  ] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | Back To Top Visibility
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(
        window.scrollY >=
          SHOW_BACK_TO_TOP_AFTER,
      )
    }

    handleScroll()

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    )

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      )
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Back To Top
  |--------------------------------------------------------------------------
  */

  const handleBackToTop =
    useCallback(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, [])

  /*
  |--------------------------------------------------------------------------
  | Load Connected Facebook Pages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!facebookPageId) {
      return
    }

    if (pages.length === 0) {
      void getPages()
    }
  }, [
    facebookPageId,
    pages.length,
    getPages,
  ])

  /*
  |--------------------------------------------------------------------------
  | Current Facebook Page
  |--------------------------------------------------------------------------
  */

  const currentPage =
    useMemo(() => {
      if (!facebookPageId) {
        return null
      }

      return (
        pages.find(
          (page) =>
            page.facebook_page_id ===
            facebookPageId,
        ) ?? null
      )
    }, [
      pages,
      facebookPageId,
    ])

  /*
  |--------------------------------------------------------------------------
  | Display Page
  |--------------------------------------------------------------------------
  */

  const displayPage:
    FacebookPageSummary =
    currentPage
      ? {
          id:
            currentPage.id,

          facebookPageId:
            currentPage.facebook_page_id,

          name:
            currentPage.name,

          category:
            currentPage.category ??
            "Government Organization",

          followers:
            currentPage.followers_count ??
            0,

          isActive:
            currentPage.is_active,
        }
      : {
          id:
            facebookPageId,

          facebookPageId:
            facebookPageId,

          name:
            "Facebook Page",

          category:
            "Government Organization",

          followers:
            0,

          isActive:
            false,
        }

  /*
  |--------------------------------------------------------------------------
  | Initial Posts Load
  |--------------------------------------------------------------------------
  */

  const loadFacebookData =
    useCallback(async () => {
      if (!facebookPageId) {
        return
      }

      try {
        await getPosts(
          facebookPageId,
          {
            page: 1,
            per_page:
              POSTS_PER_PAGE,
          },
        )
      } catch (error) {
        console.error(
          "Failed to load Facebook posts:",
          error,
        )
      }
    }, [
      facebookPageId,
      getPosts,
    ])

  useEffect(() => {
    void loadFacebookData()
  }, [
    loadFacebookData,
  ])

  /*
  |--------------------------------------------------------------------------
  | Load More Posts
  |--------------------------------------------------------------------------
  */

  const handleLoadMore =
    async () => {
      if (!facebookPageId) {
        return
      }

      if (isLoadingMore) {
        return
      }

      if (!hasMorePosts) {
        return
      }

      try {
        await loadMorePosts(
          facebookPageId,
        )
      } catch (error) {
        console.error(
          "Failed to load more Facebook posts:",
          error,
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | UI Posts Mapper
  |--------------------------------------------------------------------------
  */

  const displayPosts =
    useMemo(() => {
      return posts.map(
        (
          post: FacebookPost,
        ) => ({
          /*
           * Identity
           */
          id:
            post.id,

          facebookPostId:
            post.facebook_post_id,

          /*
           * Content
           */
          message:
            post.message ?? "",

          publishedAt:
            post.published_at ??
            post.created_at ??
            "",

          permalinkUrl:
            post.permalink_url,

          /*
           * Attachments
           *
           * Keep the normalized backend structure.
           *
           * Album children remain available through:
           *
           *     attachment.children
           */
          attachments:
            post.attachments ?? [],

          /*
           * Engagement
           */
          reactions:
            post.engagement
              .likes ?? 0,

          comments:
            post.engagement
              .comments ?? 0,

          shares:
            post.engagement
              .shares ?? 0,

          /*
           * AI Sentiment
           */
          sentiment:
            post.ai_analysis
              .sentiment
              .label ??
            "neutral",

          sentimentConfidence:
            post.ai_analysis
              .sentiment
              .score ??
            null,

          /*
           * AI Topic
           */
          topic:
            post.ai_analysis
              .topic
              .name ??
            "Uncategorized",

          topicConfidence:
            post.ai_analysis
              .topic
              .confidence ??
            null,

          /*
           * Top Comments
           */
          topComments:
            post.top_comments ??
            [],
        }),
      )
    }, [
      posts,
    ])

  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  */

  const analytics =
    useMemo(
      () =>
        calculateFacebookPostAnalytics(
          displayPosts,
        ),
      [
        displayPosts,
      ],
    )

  /*
  |--------------------------------------------------------------------------
  | Filter + Sort
  |--------------------------------------------------------------------------
  */

  const filteredPosts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      const filtered =
        displayPosts.filter(
          (post) => {
            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              post.message
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              post.topic
                .toLowerCase()
                .includes(
                  normalizedSearch,
                )

            const matchesSentiment =
              sentimentFilter ===
                "all" ||
              post.sentiment ===
                sentimentFilter

            return (
              matchesSearch &&
              matchesSentiment
            )
          },
        )

      /*
       * Never mutate displayPosts.
       */
      return [
        ...filtered,
      ].sort(
        (a, b) => {
          /*
          |--------------------------------------------------------------------------
          | Engagement
          |--------------------------------------------------------------------------
          */

          if (
            sortMode ===
            "engagement"
          ) {
            const engagementA =
              a.reactions +
              a.comments +
              a.shares

            const engagementB =
              b.reactions +
              b.comments +
              b.shares

            return (
              engagementB -
              engagementA
            )
          }

          /*
          |--------------------------------------------------------------------------
          | Recent
          |--------------------------------------------------------------------------
          */

          return (
            new Date(
              b.publishedAt,
            ).getTime() -
            new Date(
              a.publishedAt,
            ).getTime()
          )
        },
      )
    }, [
      displayPosts,
      search,
      sentimentFilter,
      sortMode,
    ])

  /*
  |--------------------------------------------------------------------------
  | Comment Handlers
  |--------------------------------------------------------------------------
  */

  const handleToggleComments =
    (
      postId: string,
    ) => {
      setExpandedCommentsId(
        (current) =>
          current === postId
            ? null
            : postId,
      )
    }

  /**
   * `postId` is the local Laravel
   * FacebookPost UUID.
   *
   * `facebookPageId` is the external
   * Meta Page ID.
   */
  const handleViewComments =
    (
      postId: string,
    ) => {
      router.push(
        `/${locale}/dashboard/facebook/pages/${facebookPageId}/posts/${postId}/comments`,
      )
    }

  /*
  |--------------------------------------------------------------------------
  | Sync Posts
  |--------------------------------------------------------------------------
  */

  const handleSyncPosts =
    async () => {
      if (!facebookPageId) {
        return
      }

      try {
        await syncPosts(
          facebookPageId,
        )

        /*
         * New synchronized posts are normally
         * displayed at the top of the feed.
         */
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      } catch (error) {
        console.error(
          "Failed to sync Facebook posts:",
          error,
        )
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh =
    async () => {
      if (!facebookPageId) {
        return
      }

      try {
        setIsRefreshing(true)

        await getPosts(
          facebookPageId,
          {
            page:
              postsPagination
                ?.current_page ??
              1,

            per_page:
              postsPagination
                ?.per_page ??
              POSTS_PER_PAGE,
          },
        )
      } catch (error) {
        console.error(
          "Failed to refresh Facebook posts:",
          error,
        )
      } finally {
        setIsRefreshing(false)
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  const isLoading =
    isLoadingPosts ||
    isSyncingPosts

  /*
  |--------------------------------------------------------------------------
  | Loaded Post Count
  |--------------------------------------------------------------------------
  */

  const loadedPostsCount =
    posts.length

  const totalPosts =
    postsPagination?.total ??
    loadedPostsCount

  /*
  |--------------------------------------------------------------------------
  | Invalid Page
  |--------------------------------------------------------------------------
  */

  if (!facebookPageId) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-xl border bg-background p-8 text-center">

          <h2 className="text-lg font-semibold">
            Facebook Page not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            A Facebook Page ID is required to
            view posts.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() =>
              router.push(
                `/${locale}/dashboard/facebook/pages`,
              )
            }
          >
            Back to Pages
          </Button>

        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 py-4 md:px-4 sm:px-6 lg:px-8">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <FacebookPageHeader
        page={displayPage}
        locale={locale}
      />

      {/* =====================================================
          DEBUG
      ===================================================== */}

      {/*
      <FacebookPostsDebug
        facebookPageId={
          facebookPageId
        }
        postsCount={
          posts.length
        }
        totalPosts={
          postsPagination?.total ?? 0
        }
      />
      */}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h2 className="text-lg font-semibold">
            Facebook Posts
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor public response and AI-analyzed
            sentiment across page posts.
          </p>

        </div>

        <div className="flex shrink-0 items-center gap-1.5">

          {/* -------------------------------------------------
              Add Post
          ------------------------------------------------- */}

          <Button
            size="sm"
            onClick={() => {}}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />

            <span className="hidden sm:inline">
              Add Post
            </span>
          </Button>

          {/* -------------------------------------------------
              Bulk Posts
          ------------------------------------------------- */}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {}}
            className="gap-2"
          >
            <Files className="h-4 w-4" />

            <span className="hidden sm:inline">
              Bulk Posts
            </span>
          </Button>

          {/* -------------------------------------------------
              Sync
          ------------------------------------------------- */}

          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              void handleSyncPosts()
            }
            disabled={
              isSyncingPosts ||
              isLoadingPosts ||
              isRefreshing ||
              isLoadingMore ||
              !facebookPageId
            }
            title="Sync posts"
            aria-label="Sync posts"
          >
            <RefreshCw
              className={
                isSyncingPosts
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />
          </Button>

          {/* -------------------------------------------------
              Refresh
          ------------------------------------------------- */}

          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              void handleRefresh()
            }
            disabled={
              isRefreshing ||
              isLoading ||
              isLoadingMore ||
              !facebookPageId
            }
            title="Refresh posts"
            aria-label="Refresh posts"
          >
            <RotateCcw
              className={
                isRefreshing
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />
          </Button>

        </div>
      </div>

      {/* =====================================================
          KPI
      ===================================================== */}

      <FacebookPostsKpi
        kpis={
          analytics.kpis
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* ===================================================
            POSTS COLUMN
        =================================================== */}

        <section className="min-w-0 space-y-4">

          {/* -------------------------------------------------
              Filters
          ------------------------------------------------- */}

          <FacebookPostFilters
            search={
              search
            }
            onSearchChange={
              setSearch
            }
            sortMode={
              sortMode
            }
            onSortModeChange={
              setSortMode
            }
          />

          {/* -------------------------------------------------
              Posts
          ------------------------------------------------- */}

          <FacebookPostList
            posts={
              filteredPosts
            }
            expandedCommentsId={
              expandedCommentsId
            }
            onToggleComments={
              handleToggleComments
            }
            onViewComments={
              handleViewComments
            }
          />

          {/* =================================================
              LOAD MORE
          ================================================= */}

          {!isLoadingPosts &&
            posts.length > 0 && (
              <div
                className="flex flex-col items-center justify-center border-t pt-5"
                aria-live="polite"
                aria-busy={
                  isLoadingMore
                }
              >

                <p className="mb-3 text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {loadedPostsCount}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalPosts}
                  </span>{" "}
                  posts
                </p>

                {hasMorePosts && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void handleLoadMore()
                    }
                    disabled={
                      isLoadingMore ||
                      isLoadingPosts ||
                      isSyncingPosts ||
                      isRefreshing
                    }
                    className="min-w-40 gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        <span>
                          Loading posts...
                        </span>
                      </>
                    ) : (
                      <span>
                        Load more posts
                      </span>
                    )}
                  </Button>
                )}

                {!hasMorePosts && (
                  <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">

                    <span className="h-px w-8 bg-border" />

                    <span>
                      All posts loaded
                    </span>

                    <span className="h-px w-8 bg-border" />

                  </div>
                )}

              </div>
            )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!isLoadingPosts &&
            !isLoadingMore &&
            posts.length === 0 && (
              <div className="rounded-xl border bg-background px-6 py-10 text-center">

                <p className="text-sm font-medium">
                  No Facebook posts found.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Try refreshing the page or
                  synchronizing posts from Facebook.
                </p>

              </div>
            )}

          {/* =================================================
              INITIAL LOADING
          ================================================= */}

          {isLoadingPosts &&
            posts.length === 0 && (
              <div
                className="flex min-h-32 items-center justify-center"
                aria-live="polite"
                aria-busy="true"
              >

                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span>
                    Loading Facebook posts...
                  </span>

                </div>

              </div>
            )}

        </section>

        {/* ===================================================
            INSIGHTS ASIDE
        =================================================== */}

        <aside className="min-w-0 xl:sticky xl:top-6">

          <FacebookInsightsRail
            executiveSummary={
              analytics.executiveSummary
            }

            topics={
              analytics.topics
            }

            mostDiscussedPost={
              analytics.mostDiscussedPost
            }

            onViewComments={
              handleViewComments
            }
          />

        </aside>

      </div>

      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      {showBackToTop && (
        <div
          className="
            fixed
            right-4
            bottom-5
            z-50
            sm:right-5
            sm:bottom-6
            lg:right-6
          "
        >
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="
              h-10
              w-10
              rounded-full
              bg-background/95
              shadow-md
              backdrop-blur
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-lg
              active:scale-95
            "
            onClick={
              handleBackToTop
            }
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      )}

    </div>
  )
}