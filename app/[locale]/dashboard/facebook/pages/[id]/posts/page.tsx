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

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { useFacebookPages } from "@/hooks/facebook/use-facebook-pages"

import {
  useInfiniteFacebookPosts,
  useSyncFacebookPosts,
} from "@/hooks/facebook/use-facebook-posts"

import type { FacebookPageSummary } from "@/types/facebook/page"
import type { FacebookPost } from "@/types/facebook/post"
import type { SortMode } from "@/types/facebook/common"

import {
  calculateFacebookPostAnalytics,
} from "@/utils/facebook-post-analytics"

import { FacebookPageHeader } from "@/components/facebook/facebook-page-header"
import { FacebookPostsKpi } from "@/components/facebook/facebook-posts-kpi"
import { FacebookPostFilters } from "@/components/facebook/facebook-post-filters"
import { FacebookPostList } from "@/components/facebook/facebook-post-list"
import { FacebookInsightsRail } from "@/components/facebook/insights/facebook-insights-rail"
import { FacebookPostsSummaryCards } from "@/components/facebook/facebook-posts-summary-cards"

const POSTS_PER_PAGE = 20
const SHOW_BACK_TO_TOP_AFTER = 600
const SEARCH_DEBOUNCE_MS = 350

type AnalyticsSummary = ReturnType<
  typeof calculateFacebookPostAnalytics
>

function normalizeSearch(value: string): string {
  return value.trim()
}

export default function PagePosts() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ id: string }>()

  const { pages, getPages } = useFacebookPages()

  const facebookPageId =
    typeof params?.id === "string" ? params.id : ""

  const locale = pathname.split("/")[1] || "or"

  /*
   * Search input updates immediately. The API query changes
   * after a short debounce to avoid a request per keystroke.
   */
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [sortMode, setSortMode] =
    useState<SortMode>("recent")

  const [expandedCommentsId, setExpandedCommentsId] =
    useState<string | null>(null)

  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(normalizeSearch(search))
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [search])

  /*
   * Server-driven search and sorting.
   *
   * Keep these parameter names aligned with Laravel.
   */
  const queryParams = useMemo(
    () => ({
      per_page: POSTS_PER_PAGE,
      search: debouncedSearch || undefined,
      sort_by:
        sortMode === "engagement"
          ? ("engagement" as const)
          : ("published_at" as const),
      sort_direction: "desc" as const,
    }),
    [debouncedSearch, sortMode],
  )

  const {
    data: postsResponse,
    isPending: isLoadingPosts,
    isFetching: isFetchingPosts,
    isError: isPostsError,
    error: postsError,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFacebookPosts(
    facebookPageId,
    queryParams,
  )

  const {
    mutateAsync: synchronizePosts,
    isPending: isSyncingPosts,
  } = useSyncFacebookPosts()

  /*
   * Infinite query pages are accumulated here.
   */
  const posts = useMemo<FacebookPost[]>(
    () =>
      postsResponse?.pages.flatMap(
        (page) => page.data ?? [],
      ) ?? [],
    [postsResponse],
  )

  const summary = postsResponse?.pages[0].meta.summary;

  const firstPage = postsResponse?.pages[0]
  const pagination = firstPage?.meta?.pagination

  /*
   * Load the connected page metadata.
   */
  useEffect(() => {
    if (!facebookPageId || pages.length > 0) {
      return
    }

    void getPages().catch((error: unknown) => {
      console.error("Failed to load Facebook pages:", error)
    })
  }, [facebookPageId, pages.length, getPages])

  const currentPage = useMemo(
    () =>
      pages.find(
        (page) => page.facebook_page_id === facebookPageId,
      ) ?? null,
    [pages, facebookPageId],
  )

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


  const totalPosts = pagination?.total ?? posts.length
  const loadedPostsCount = posts.length

  /*
   * Back-to-top button.
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

  const handleBackToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  /*
   * Refresh the currently active query.
   */
  const handleRefresh = useCallback(async () => {
    if (!facebookPageId || isRefreshing) {
      return
    }

    setIsRefreshing(true)

    try {
      await refetchPosts()
    } catch (error) {
      console.error("Failed to refresh Facebook posts:", error)
      toast.error("Failed to refresh Facebook posts.")
    } finally {
      setIsRefreshing(false)
    }
  }, [facebookPageId, isRefreshing, refetchPosts])

  /*
   * Synchronization invalidates the page's post queries
   * through the mutation hook.
   */
  const handleSyncPosts = useCallback(async () => {
    if (!facebookPageId || isSyncingPosts) {
      return
    }

    try {
      await synchronizePosts({ facebookPageId })

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } catch (error) {
      console.error("Failed to synchronize posts:", error)
    }
  }, [facebookPageId, isSyncingPosts, synchronizePosts])

  /*
   * Proper Load More: fetches and appends the next page.
   */
  const handleLoadMore = useCallback(async () => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchingPosts ||
      isSyncingPosts
    ) {
      return
    }

    try {
      await fetchNextPage()
    } catch (error) {
      console.error("Failed to load more posts:", error)
      toast.error("Failed to load more Facebook posts.")
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchingPosts,
    isSyncingPosts,
    fetchNextPage,
  ])

  const handleToggleComments = useCallback(
    (postId: string) => {
      setExpandedCommentsId((current) =>
        current === postId ? null : postId,
      )
    },
    [],
  )

  /*
   * postId is the local Laravel post UUID.
   * facebookPageId is the external Facebook Page ID.
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <FacebookPageHeader
        page={displayPage}
        locale={locale}
      />

<FacebookPostsSummaryCards
  summary={summary}
  isLoading={isLoadingPosts && !firstPage}
/>

      {/* Page actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">
            Facebook Posts
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor public response and AI-analyzed sentiment across page posts.
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
            <span className="hidden sm:inline">Add Post</span>
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
            <span className="hidden sm:inline">Bulk Posts</span>
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
              isFetchingPosts
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
              isLoadingPosts ||
              isSyncingPosts ||
              isFetchingPosts
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

      {/* Backend-driven KPI data */}
      {/* <FacebookPostsKpi kpis={analytics.kpis} /> */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-4">
          <FacebookPostFilters
            search={search}
            onSearchChange={setSearch}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
          />

          {isPostsError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
              role="alert"
            >
              <p className="text-sm font-medium">
                Failed to load Facebook posts.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {postsError instanceof Error
                  ? postsError.message
                  : "An unexpected error occurred."}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void refetchPosts()}
              >
                Try again
              </Button>
            </div>
          )}

          {!isLoadingPosts && !isPostsError && (
            <FacebookPostList
              posts={posts}
              expandedCommentsId={expandedCommentsId}
              onToggleComments={handleToggleComments}
              onViewComments={handleViewComments}
            />
          )}

          {/* Pagination */}
          {!isLoadingPosts && !isPostsError && posts.length > 0 && (
            <div
              className="flex flex-col items-center justify-center border-t pt-5"
              aria-live="polite"
              aria-busy={isFetchingNextPage}
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

              {hasNextPage ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleLoadMore()}
                  disabled={
                    isFetchingNextPage ||
                    isSyncingPosts ||
                    isRefreshing
                  }
                  className="min-w-40 gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading posts...</span>
                    </>
                  ) : (
                    <span>Load more posts</span>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <span className="h-px w-8 bg-border" />
                  <span>All posts loaded</span>
                  <span className="h-px w-8 bg-border" />
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingPosts &&
            !isPostsError &&
            posts.length === 0 && (
              <div className="rounded-xl border bg-background px-6 py-10 text-center">
                <p className="text-sm font-medium">
                  {debouncedSearch
                    ? "No posts match your search."
                    : "No Facebook posts found."}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {debouncedSearch
                    ? "Try a different search term."
                    : "Try refreshing or synchronizing posts from Facebook."}
                </p>

                {search && (
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

          {/* Initial loading */}
          {isLoadingPosts && (
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

        {/* Backend aggregate insights */}
        <aside className="min-w-0 xl:sticky xl:top-6">
          {/* <FacebookInsightsRail
            executiveSummary={analytics.executiveSummary}
            topics={analytics.topics}
            mostDiscussedPost={analytics.mostDiscussedPost}
            onViewComments={handleViewComments}
          /> */}
        </aside>
      </div>

      {/* Back to top */}
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