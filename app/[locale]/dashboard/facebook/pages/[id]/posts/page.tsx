
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
import type { SortMode } from "@/types/facebook/common"

import {
  calculateFacebookPostAnalytics,
} from "@/utils/facebook-post-analytics"

import {
  FacebookPageHeader,
} from "@/components/facebook/facebook-page-header"

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
const SHOW_BACK_TO_TOP_AFTER = 600

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function getTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PagePosts() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id: string }>()

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
   * This is not the local Laravel UUID.
   */
  const facebookPageId =
    typeof params?.id === "string"
      ? params.id
      : ""

  const locale = pathname.split("/")[1] || "or"

  /*
  |--------------------------------------------------------------------------
  | Local UI State
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("recent")
  const [expandedCommentsId, setExpandedCommentsId] =
    useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | Back-To-Top Visibility
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(
        window.scrollY >= SHOW_BACK_TO_TOP_AFTER,
      )
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Back To Top
  |--------------------------------------------------------------------------
  */

  const handleBackToTop = useCallback(() => {
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
    if (!facebookPageId || pages.length > 0) {
      return
    }

    void getPages().catch((error: unknown) => {
      console.error(
        "Failed to load connected Facebook pages:",
        error,
      )
    })
  }, [facebookPageId, pages.length, getPages])

  /*
  |--------------------------------------------------------------------------
  | Current Facebook Page
  |--------------------------------------------------------------------------
  */

  const currentPage = useMemo(() => {
    if (!facebookPageId) {
      return null
    }

    return (
      pages.find(
        (page) => page.facebook_page_id === facebookPageId,
      ) ?? null
    )
  }, [pages, facebookPageId])

  /*
  |--------------------------------------------------------------------------
  | Display Page
  |--------------------------------------------------------------------------
  */

  const displayPage: FacebookPageSummary = currentPage
    ? {
        id: currentPage.id,
        facebookPageId: currentPage.facebook_page_id,
        name: currentPage.name,
        category:
          currentPage.category ?? "Government Organization",
        followers: currentPage.followers_count ?? 0,
        isActive: currentPage.is_active,
      }
    : {
        id: facebookPageId,
        facebookPageId,
        name: "Facebook Page",
        category: "Government Organization",
        followers: 0,
        isActive: false,
      }

  /*
  |--------------------------------------------------------------------------
  | Initial Posts Load
  |--------------------------------------------------------------------------
  */

  const loadFacebookData = useCallback(async () => {
    if (!facebookPageId) {
      return
    }

    try {
      await getPosts(facebookPageId, {
        page: 1,
        per_page: POSTS_PER_PAGE,
      })
    } catch (error) {
      console.error(
        "Failed to load Facebook posts:",
        error,
      )
    }
  }, [facebookPageId, getPosts])

  useEffect(() => {
    void loadFacebookData()
  }, [loadFacebookData])

  /*
  |--------------------------------------------------------------------------
  | Load More Posts
  |--------------------------------------------------------------------------
  */

  const handleLoadMore = useCallback(async () => {
    if (
      !facebookPageId ||
      isLoadingMore ||
      !hasMorePosts
    ) {
      return
    }

    try {
      await loadMorePosts(facebookPageId)
    } catch (error) {
      console.error(
        "Failed to load more Facebook posts:",
        error,
      )
    }
  }, [
    facebookPageId,
    isLoadingMore,
    hasMorePosts,
    loadMorePosts,
  ])

  /*
  |--------------------------------------------------------------------------
  | Search And Sort API Posts
  |--------------------------------------------------------------------------
  |
  | Keep the original FacebookPost model so that both FacebookPostList
  | and calculateFacebookPostAnalytics receive their expected types.
  |
  */

  const filteredPosts = useMemo<FacebookPost[]>(() => {
    const normalizedSearch = normalizeSearch(search)

    const filtered = posts.filter((post) => {
      if (!normalizedSearch) {
        return true
      }

      const message = post.message ?? ""
      const topic = post.ai_analysis?.topic?.name ?? ""
      const sentiment =
        post.ai_analysis?.sentiment?.label ?? ""

      return [message, topic, sentiment].some((value) =>
        value.toLocaleLowerCase().includes(normalizedSearch),
      )
    })

    return [...filtered].sort((a, b) => {
      const timestampA = getTimestamp(
        a.published_at ?? a.created_at,
      )

      const timestampB = getTimestamp(
        b.published_at ?? b.created_at,
      )

      switch (sortMode) {
        case "engagement":
          return timestampA - timestampB

        case "recent":
        default:
          return timestampB - timestampA
      }
    })
  }, [posts, search, sortMode])

  /*
  |--------------------------------------------------------------------------
  | Analytics
  |--------------------------------------------------------------------------
  |
  | Analytics receives the original API posts, not filtered UI objects.
  |
  */

  const analytics = useMemo(
    () => calculateFacebookPostAnalytics(posts),
    [posts],
  )

  /*
  |--------------------------------------------------------------------------
  | Comment Handlers
  |--------------------------------------------------------------------------
  */

  const handleToggleComments = useCallback(
    (postId: string) => {
      setExpandedCommentsId((current) =>
        current === postId ? null : postId,
      )
    },
    [],
  )

  /**
   * postId is the local Laravel FacebookPost UUID.
   * facebookPageId is the external Meta Page ID.
   */
  const handleViewComments = useCallback(
    (postId: string) => {
      router.push(
        `/${locale}/dashboard/facebook/pages/${encodeURIComponent(
          facebookPageId,
        )}/posts/${encodeURIComponent(postId)}/comments`,
      )
    },
    [router, locale, facebookPageId],
  )

  /*
  |--------------------------------------------------------------------------
  | Sync Posts
  |--------------------------------------------------------------------------
  */

  const handleSyncPosts = useCallback(async () => {
    if (!facebookPageId) {
      return
    }

    try {
      await syncPosts(facebookPageId)

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
  }, [facebookPageId, syncPosts])

  /*
  |--------------------------------------------------------------------------
  | Refresh Posts
  |--------------------------------------------------------------------------
  */

  const handleRefresh = useCallback(async () => {
    if (!facebookPageId || isRefreshing) {
      return
    }

    try {
      setIsRefreshing(true)

      await getPosts(facebookPageId, {
        page: 1,
        per_page:
          postsPagination?.per_page ?? POSTS_PER_PAGE,
      })
    } catch (error) {
      console.error(
        "Failed to refresh Facebook posts:",
        error,
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [
    facebookPageId,
    isRefreshing,
    getPosts,
    postsPagination?.per_page,
  ])

  /*
  |--------------------------------------------------------------------------
  | Loading And Counts
  |--------------------------------------------------------------------------
  */

  const isLoading = isLoadingPosts || isSyncingPosts

  const loadedPostsCount = posts.length

  const totalPosts =
    postsPagination?.total ?? loadedPostsCount

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
            A Facebook Page ID is required to view posts.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() =>
              router.push(`/${locale}/dashboard/facebook/pages`)
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
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      {/* Page Header */}

      <FacebookPageHeader
        page={displayPage}
        locale={locale}
      />

      {/* Actions */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">
            Facebook Posts
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor public response and AI-analyzed sentiment
            across page posts.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled
            title="Creating Facebook posts is not available"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              Add Post
            </span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled
            title="Bulk post creation is not available"
          >
            <Files className="h-4 w-4" />
            <span className="hidden sm:inline">
              Bulk Posts
            </span>
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => void handleSyncPosts()}
            disabled={
              isSyncingPosts ||
              isLoadingPosts ||
              isRefreshing ||
              isLoadingMore
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

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={
              isRefreshing ||
              isLoading ||
              isLoadingMore
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

      {/* KPI */}

      <FacebookPostsKpi kpis={analytics.kpis} />

      {/* Main Content */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Posts Column */}

        <section className="min-w-0 space-y-4">
          <FacebookPostFilters
            search={search}
            onSearchChange={setSearch}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />

          <FacebookPostList
            posts={filteredPosts}
            expandedCommentsId={expandedCommentsId}
            onToggleComments={handleToggleComments}
            onViewComments={handleViewComments}
          />

          {/* Load More */}

          {!isLoadingPosts && posts.length > 0 && (
            <div
              className="flex flex-col items-center justify-center border-t pt-5"
              aria-live="polite"
              aria-busy={isLoadingMore}
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
                  onClick={() => void handleLoadMore()}
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
                      <span>Loading posts...</span>
                    </>
                  ) : (
                    <span>Load more posts</span>
                  )}
                </Button>
              )}

              {!hasMorePosts && (
                <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <span className="h-px w-8 bg-border" />
                  <span>All posts loaded</span>
                  <span className="h-px w-8 bg-border" />
                </div>
              )}
            </div>
          )}

          {/* Empty State */}

          {!isLoadingPosts &&
            !isLoadingMore &&
            filteredPosts.length === 0 && (
              <div className="rounded-xl border bg-background px-6 py-10 text-center">
                <p className="text-sm font-medium">
                  {search.trim()
                    ? "No posts match your search."
                    : "No Facebook posts found."}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {search.trim()
                    ? "Try a different search term."
                    : "Try refreshing the page or synchronizing posts from Facebook."}
                </p>

                {search.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}

          {/* Initial Loading */}

          {isLoadingPosts && posts.length === 0 && (
            <div
              className="flex min-h-32 items-center justify-center"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading Facebook posts...</span>
              </div>
            </div>
          )}
        </section>

        {/* Insights */}

        <aside className="min-w-0 xl:sticky xl:top-6">
          <FacebookInsightsRail
            executiveSummary={analytics.executiveSummary}
            topics={analytics.topics}
            mostDiscussedPost={analytics.mostDiscussedPost}
            onViewComments={handleViewComments}
          />
        </aside>
      </div>

      {/* Back To Top */}

      {showBackToTop && (
        <div className="fixed right-4 bottom-5 z-50 sm:right-5 sm:bottom-6 lg:right-6">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full bg-background/95 shadow-md backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            onClick={handleBackToTop}
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
