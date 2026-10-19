// "use client"

// import { ArrowLeft, ArrowUp, Loader2, RefreshCw, Sparkles } from "lucide-react"
// import { useParams, useRouter } from "next/navigation"
// import { useCallback, useEffect, useMemo, useState } from "react"
// import { toast } from "sonner"

// import {
//   useFacebookCommentTopics,
//   useFacebookPostComments,
//   useFacebookPostCommentsAnalytics,
//   useSyncFacebookComments,
// } from "@/hooks/facebook/use-facebook-comments"
// import { useFacebook } from "@/hooks/useFacebookConnect"

// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"

// import {
//   CommentsSection,
//   LanguageFilter,
// } from "@/components/facebook/comments-section"


// import { PostContextCard } from "./post-context-card"
// import { SentimentOverview } from "./sentiment-overview"
// import { TopicsSheet } from "./topics-sheet"
// import { SentimentFilter } from "@/types/facebook/common"
// import { ApiFacebookComment, DateRange, PostTopic, Sentiment, SortMode, TimelinePoint, UiComment } from "@/types/facebook/post-comments-analytics"
// import { MOCK_COMMENTS, MOCK_NOW, MOCK_POST, MOCK_POST_TOPICS, USE_MOCK_DATA } from "@/data/mock-facebook-posts"
// import { extractList, formatDate, formatNumber, formatSentiment, getSentimentScore, mapComment, mapTopics, toFacebookComment } from "@/utils/post-comments-helpers"



// function PostComments() {
//   const router = useRouter()
  

//   const params = useParams<{ id: string; postId: string }>()
//   const facebookPageId = params.id
//   const facebookPostId = params.postId

//   const { posts, isLoadingPosts } = useFacebook()

//   /* ------------------------------------------------------------------------ */
//   /* Data hooks                                                               */
//   /* ------------------------------------------------------------------------ */

//   const commentsQuery = useFacebookPostComments(facebookPostId, {
//     page: 1,
//     perPage: 100,
//     sortBy: "newest",
//   })

//   // Server-side analytics: available for when you move aggregation off the client.
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const _analyticsQuery = useFacebookPostCommentsAnalytics(facebookPostId)

//   const topicsQuery = useFacebookCommentTopics(facebookPostId)
//   const syncMutation = useSyncFacebookComments(facebookPostId)

//   const isSyncingComments = syncMutation.isPending

//   /* ------------------------------------------------------------------------ */
//   /* Local UI state                                                           */
//   /* ------------------------------------------------------------------------ */

//   const [search, setSearch] = useState("")
//   const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all")
//   const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all")
//   const [sortMode, setSortMode] = useState<SortMode>("newest")
//   const [dateRange, setDateRange] = useState<DateRange>("30d")
//   const [customFrom, setCustomFrom] = useState("")
//   const [customTo, setCustomTo] = useState("")
//   const [showBackToTop, setShowBackToTop] = useState(false)

//   /* ------------------------------------------------------------------------ */
//   /* Back to top                                                              */
//   /* ------------------------------------------------------------------------ */

//   useEffect(() => {
//     const handleScroll = () => setShowBackToTop(window.scrollY > 500)

//     handleScroll()
//     window.addEventListener("scroll", handleScroll, { passive: true })

//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   const scrollToTop = useCallback(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" })
//   }, [])

//   /* ------------------------------------------------------------------------ */
//   /* Post + topics                                                            */
//   /* ------------------------------------------------------------------------ */

//   const realPost = useMemo(
//     () => posts.find((item) => item.id === facebookPostId) ?? null,
//     [posts, facebookPostId],
//   )

//   const post = USE_MOCK_DATA ? MOCK_POST : realPost

//   const postTopics = useMemo<PostTopic[]>(
//     () => (USE_MOCK_DATA ? MOCK_POST_TOPICS : mapTopics(topicsQuery.data)),
//     [topicsQuery.data],
//   )

//   /* ------------------------------------------------------------------------ */
//   /* Comments                                                                 */
//   /* ------------------------------------------------------------------------ */

//   const uiComments = useMemo<UiComment[]>(() => {
//     if (USE_MOCK_DATA) return MOCK_COMMENTS

//     return (extractList(commentsQuery.data) as ApiFacebookComment[]).map(
//       mapComment,
//     )
//   }, [commentsQuery.data])

//   const totalComments = uiComments.length

//   /* ------------------------------------------------------------------------ */
//   /* Date range                                                               */
//   /* ------------------------------------------------------------------------ */

//   // Stable "now" so memoized values don't recompute on every render.
//   const now = useMemo(
//     () => (USE_MOCK_DATA ? new Date(MOCK_NOW) : new Date()),
//     [],
//   )

//   const dateBounds = useMemo(() => {
//     if (dateRange === "all") {
//       return { from: null as Date | null, to: null as Date | null }
//     }

//     if (dateRange === "custom") {
//       return {
//         from: customFrom ? new Date(`${customFrom}T00:00:00`) : null,
//         to: customTo ? new Date(`${customTo}T23:59:59`) : null,
//       }
//     }

//     const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90

//     const from = new Date(now)
//     from.setDate(from.getDate() - (days - 1))
//     from.setHours(0, 0, 0, 0)

//     return { from, to: now }
//   }, [dateRange, customFrom, customTo, now])

//   const filterByBounds = useCallback(
//     (list: UiComment[], from: Date | null, to: Date | null) => {
//       if (!from && !to) return list

//       return list.filter((comment) => {
//         if (!comment.analyzedAt) return false

//         const analyzed = new Date(comment.analyzedAt)
//         if (Number.isNaN(analyzed.getTime())) return false
//         if (from && analyzed < from) return false
//         if (to && analyzed > to) return false

//         return true
//       })
//     },
//     [],
//   )

//   const periodComments = useMemo(
//     () => filterByBounds(uiComments, dateBounds.from, dateBounds.to),
//     [uiComments, dateBounds, filterByBounds],
//   )

//   const previousPeriodComments = useMemo(() => {
//     const { from, to } = dateBounds
//     if (!from || !to) return null

//     const spanMs = to.getTime() - from.getTime()
//     const prevTo = new Date(from.getTime() - 1)
//     const prevFrom = new Date(prevTo.getTime() - spanMs)

//     return filterByBounds(uiComments, prevFrom, prevTo)
//   }, [uiComments, dateBounds, filterByBounds])

//   /* ------------------------------------------------------------------------ */
//   /* Analysis                                                                 */
//   /* ------------------------------------------------------------------------ */

//   const analyzedComments = useMemo(
//     () =>
//       periodComments.filter((comment) =>
//         Boolean(comment.sentiment && comment.analyzedAt),
//       ),
//     [periodComments],
//   )

//   const analyzedCount = analyzedComments.length
//   const hasData = analyzedCount > 0

//   const sentimentCounts = useMemo(
//     () => ({
//       positive: analyzedComments.filter((c) => c.sentiment === "positive")
//         .length,
//       neutral: analyzedComments.filter((c) => c.sentiment === "neutral")
//         .length,
//       negative: analyzedComments.filter((c) => c.sentiment === "negative")
//         .length,
//     }),
//     [analyzedComments],
//   )

//   const sentimentPercentages = useMemo(() => {
//     if (analyzedCount === 0) return { positive: 0, neutral: 0, negative: 0 }

//     return {
//       positive: Math.round((sentimentCounts.positive / analyzedCount) * 100),
//       neutral: Math.round((sentimentCounts.neutral / analyzedCount) * 100),
//       negative: Math.round((sentimentCounts.negative / analyzedCount) * 100),
//     }
//   }, [analyzedCount, sentimentCounts])

//   const overallScore =
//     analyzedCount > 0
//       ? analyzedComments.reduce(
//           (total, comment) => total + getSentimentScore(comment.sentiment!),
//           0,
//         ) / analyzedCount
//       : 0

//   const overallLabel =
//     analyzedCount === 0
//       ? "No analysis yet"
//       : overallScore >= 4
//         ? "Very positive"
//         : overallScore >= 3.2
//           ? "Positive"
//           : overallScore >= 2.2
//             ? "Mixed response"
//             : "Negative"

//   const overallTone: Sentiment =
//     overallScore >= 3.6
//       ? "positive"
//       : overallScore >= 2.2
//         ? "neutral"
//         : "negative"

//   /* ------------------------------------------------------------------------ */
//   /* KPIs                                                                     */
//   /* ------------------------------------------------------------------------ */

//   const uniqueAuthors = useCallback(
//     (list: UiComment[]) => new Set(list.map((c) => c.author)).size,
//     [],
//   )

//   const commentsGrowth = useMemo(() => {
//     if (!previousPeriodComments) return null

//     const previous = previousPeriodComments.length
//     if (previous === 0) return periodComments.length > 0 ? 100 : 0

//     return Math.round(((periodComments.length - previous) / previous) * 100)
//   }, [previousPeriodComments, periodComments])

//   const commentersGrowth = useMemo(() => {
//     if (!previousPeriodComments) return null

//     const currentUsers = uniqueAuthors(periodComments)
//     const previousUsers = uniqueAuthors(previousPeriodComments)

//     if (previousUsers === 0) return currentUsers > 0 ? 100 : 0

//     return Math.round(((currentUsers - previousUsers) / previousUsers) * 100)
//   }, [previousPeriodComments, periodComments, uniqueAuthors])

//   const commentersCount = useMemo(
//     () => uniqueAuthors(periodComments),
//     [periodComments, uniqueAuthors],
//   )

//   /* ------------------------------------------------------------------------ */
//   /* Timeline                                                                 */
//   /* ------------------------------------------------------------------------ */

//   const timeline = useMemo<TimelinePoint[]>(() => {
//     const map = new Map<string, TimelinePoint>()

//     analyzedComments.forEach((comment) => {
//       if (!comment.analyzedAt || !comment.sentiment) return

//       const date = new Date(comment.analyzedAt)
//       if (Number.isNaN(date.getTime())) return

//       const key = [
//         date.getFullYear(),
//         String(date.getMonth() + 1).padStart(2, "0"),
//         String(date.getDate()).padStart(2, "0"),
//       ].join("-")

//       const item = map.get(key) ?? {
//         date: key,
//         positive: 0,
//         neutral: 0,
//         negative: 0,
//         average: 0,
//         total: 0,
//       }

//       item[comment.sentiment] += 1
//       item.total += 1
//       map.set(key, item)
//     })

//     return Array.from(map.values())
//       .map((item) => {
//         const score = item.positive * 5 + item.neutral * 3 + item.negative * 1

//         return {
//           ...item,
//           average:
//             item.total > 0 ? Number((score / item.total).toFixed(2)) : 0,
//         }
//       })
//       .sort((a, b) => a.date.localeCompare(b.date))
//   }, [analyzedComments])

//   /* ------------------------------------------------------------------------ */
//   /* Highlights                                                               */
//   /* ------------------------------------------------------------------------ */

//   const topPositive = useMemo(
//     () =>
//       [...analyzedComments]
//         .filter((c) => c.sentiment === "positive")
//         .sort((a, b) => b.likes - a.likes)[0] ?? null,
//     [analyzedComments],
//   )

//   const topNegative = useMemo(
//     () =>
//       [...analyzedComments]
//         .filter((c) => c.sentiment === "negative")
//         .sort((a, b) => b.likes - a.likes)[0] ?? null,
//     [analyzedComments],
//   )

//   /* ------------------------------------------------------------------------ */
//   /* Filtered comments                                                        */
//   /* ------------------------------------------------------------------------ */

//   const filteredComments = useMemo(() => {
//     const query = search.trim().toLowerCase()

//     const result = periodComments.filter((comment) => {
//       const matchesSearch =
//         !query ||
//         comment.author.toLowerCase().includes(query) ||
//         comment.message.toLowerCase().includes(query)

//       const matchesSentiment =
//         sentimentFilter === "all" || comment.sentiment === sentimentFilter

//       const matchesLanguage =
//         languageFilter === "all" || comment.language === languageFilter

//       return matchesSearch && matchesSentiment && matchesLanguage
//     })

//     return [...result].sort((a, b) => {
//       if (sortMode === "most_liked") return b.likes - a.likes

//       const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
//       const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0

//       return sortMode === "newest" ? dateB - dateA : dateA - dateB
//     })
//   }, [periodComments, search, sentimentFilter, languageFilter, sortMode])

//   const commentsForSection = useMemo(
//     () => uiComments.map((c) => toFacebookComment(c, facebookPostId)),
//     [uiComments, facebookPostId],
//   )

//   const filteredCommentsForSection = useMemo(
//     () => filteredComments.map((c) => toFacebookComment(c, facebookPostId)),
//     [filteredComments, facebookPostId],
//   )

//   /* ------------------------------------------------------------------------ */
//   /* Navigation                                                               */
//   /* ------------------------------------------------------------------------ */

//   const scrollToComments = useCallback(() => {
//     setTimeout(() => {
//       document.getElementById("comments-section")?.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       })
//     }, 50)
//   }, [])

//   const viewSentiment = useCallback(
//     (sentiment: Sentiment) => {
//       setSentimentFilter(sentiment)
//       scrollToComments()
//     },
//     [scrollToComments],
//   )

//   const jumpToComment = useCallback((id: string) => {
//     setSentimentFilter("all")
//     setLanguageFilter("all")
//     setSearch("")

//     setTimeout(() => {
//       document.getElementById(`comment-${id}`)?.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       })
//     }, 60)
//   }, [])

//   /* ------------------------------------------------------------------------ */
//   /* Sync                                                                     */
//   /* ------------------------------------------------------------------------ */

//   const handleSync = useCallback(async () => {
//     if (!facebookPageId || !facebookPostId) {
//       toast.error("Unable to sync comments", {
//         description: "Facebook page or post information is missing.",
//       })
//       return
//     }

//     try {
//       await syncMutation.mutateAsync()
//       toast.success("Comments synced")
//       void commentsQuery.refetch()
//       void topicsQuery.refetch()
//     } catch (error) {
//       toast.error("Unable to sync comments", {
//         description:
//           error instanceof Error ? error.message : "Please try again.",
//       })
//     }
//   }, [facebookPageId, facebookPostId, syncMutation, commentsQuery, topicsQuery])

//   /* ------------------------------------------------------------------------ */
//   /* Labels                                                                   */
//   /* ------------------------------------------------------------------------ */

//   const dateLabel =
//     dateRange === "all"
//       ? "All time"
//       : dateRange === "7d"
//         ? "Past 7 days"
//         : dateRange === "30d"
//           ? "Past 30 days"
//           : dateRange === "90d"
//             ? "Past 3 months"
//             : customFrom || customTo
//               ? `${customFrom || "..."} – ${customTo || "..."}`
//               : "Custom range"

//   const isPostLoading = isLoadingPosts && !post && !USE_MOCK_DATA
//   const isCommentsLoading = !USE_MOCK_DATA && commentsQuery.isLoading

//   /* ------------------------------------------------------------------------ */
//   /* Render                                                                   */
//   /* ------------------------------------------------------------------------ */

//   return (
//     <TooltipProvider delayDuration={150}>
//       <div className="min-h-screen bg-muted/20 max-w-5xl m-auto">
//         <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
//           {/* Top bar */}
//           <header className="flex items-center justify-between gap-4">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => router.back()}
//               className="-ml-2 gap-2 text-muted-foreground hover:text-foreground"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span className="hidden sm:inline">Back to posts</span>
//               <span className="sm:hidden">Back</span>
//             </Button>

//             <div className="flex items-center gap-2">
//               {USE_MOCK_DATA && (
//                 <Badge
//                   variant="secondary"
//                   className="hidden gap-1.5 text-[10px] font-normal sm:flex"
//                 >
//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
//                   Preview data
//                 </Badge>
//               )}

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => void handleSync()}
//                 disabled={
//                   !facebookPageId || !facebookPostId || isSyncingComments
//                 }
//                 className="gap-2"
//               >
//                 {isSyncingComments ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <RefreshCw className="h-4 w-4" />
//                 )}

//                 <span className="hidden sm:inline">
//                   {isSyncingComments ? "Checking comments..." : "Sync comments"}
//                 </span>
//                 <span className="sm:hidden">
//                   {isSyncingComments ? "Checking..." : "Sync"}
//                 </span>
//               </Button>
//             </div>
//           </header>

//           {/* Page title */}
//           <div className="mt-7">
//             <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//               Public response
//             </h1>
//             <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
//               Understand how people are responding to this post through
//               sentiment, engagement, and comment activity.
//             </p>
//           </div>

//           {/* Post context */}
//           <PostContextCard
//             isLoading={isPostLoading}
//             postDate={post?.published_at ?? null}
//             postMessage={post?.message ?? "Post content unavailable."}
//             postLikes={post?.engagement?.likes ?? 0}
//             postShares={post?.engagement?.shares ?? 0}
//             totalComments={totalComments}
//           />

//           {/* Post tools */}
//           {!isPostLoading && (
//             <div className="mt-3 flex flex-wrap items-center gap-2">
//               {postTopics.length > 0 && <TopicsSheet topics={postTopics} />}

//               <Badge
//                 variant="outline"
//                 className="gap-1.5 text-[10px] font-normal"
//               >
//                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                 Analysis available
//               </Badge>
//             </div>
//           )}

//           {/* Sentiment overview */}
//           <SentimentOverview
//             hasData={hasData}
//             analyzedCount={analyzedCount}
//             periodCommentsCount={periodComments.length}
//             dateLabel={dateLabel}
//             dateRange={dateRange}
//             customFrom={customFrom}
//             customTo={customTo}
//             onDateRangeChange={setDateRange}
//             onCustomFromChange={setCustomFrom}
//             onCustomToChange={setCustomTo}
//             overallScore={overallScore}
//             overallLabel={overallLabel}
//             overallTone={overallTone}
//             sentimentCounts={sentimentCounts}
//             sentimentPercentages={sentimentPercentages}
//             commentersCount={commentersCount}
//             commentsGrowth={commentsGrowth}
//             commentersGrowth={commentersGrowth}
//             timeline={timeline}
//             topPositive={topPositive}
//             topNegative={topNegative}
//             onSelectSentiment={viewSentiment}
//             onJumpToComment={jumpToComment}
//           />

//           {/* Comments list */}
//           {/* <CommentsSection
//             comments={commentsForSection}
//             filteredComments={filteredCommentsForSection}
//             search={search}
//             sentimentFilter={sentimentFilter}
//             languageFilter={languageFilter}
//             sortMode={sortMode}
//             dateLabel={dateLabel}
//             isCommentsLoading={isCommentsLoading}
//             onSearchChange={setSearch}
//             onSentimentChange={setSentimentFilter}
//             onLanguageChange={setLanguageFilter}
//             onSortChange={setSortMode}
//             onClearFilters={() => {
//               setSearch("")
//               setSentimentFilter("all")
//               setLanguageFilter("all")
//               setSortMode("newest")
//             }}
//             formatDate={formatDate}
//             formatNumber={formatNumber}
//             formatSentiment={formatSentiment}
//           /> */}

//           <div className="h-10" />
//         </div>

//         {/* Floating action stack */}
//         <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 type="button"
//                 size="icon"
//                 onClick={() => toast("AI-generated post insight")}
//                 aria-label="View AI-generated post insight"
//                 className="h-10 w-10 rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
//               >
//                 <Sparkles className="h-4 w-4" aria-hidden="true" />
//               </Button>
//             </TooltipTrigger>

//             <TooltipContent side="left" className="text-xs">
//               View AI-generated post insight
//             </TooltipContent>
//           </Tooltip>

//           {showBackToTop && (
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   type="button"
//                   size="icon"
//                   onClick={scrollToTop}
//                   aria-label="Back to top"
//                   className="h-10 w-10 rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
//                 >
//                   <ArrowUp className="h-4 w-4" aria-hidden="true" />
//                 </Button>
//               </TooltipTrigger>

//               <TooltipContent side="left" className="text-xs">
//                 Back to top
//               </TooltipContent>
//             </Tooltip>
//           )}
//         </div>
//       </div>
//     </TooltipProvider>
//   )
// }

// export default PostComments


import React from 'react'

function postcomments() {
  return (
    <div>post-comments</div>
  )
}

export default postcomments