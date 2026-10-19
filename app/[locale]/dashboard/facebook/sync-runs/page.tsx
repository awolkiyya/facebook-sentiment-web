"use client"

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  History,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  X,
  XCircle,
} from "lucide-react"
import { FaFacebookF } from "react-icons/fa"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type {
  FacebookSyncRun,
  SyncStatus,
  SyncTrigger,
  SyncType,
} from "@/types/facebook-sync.types"

import {
  useCancelFacebookSyncRun,
  useFacebookSyncRun,
  useFacebookSyncRuns,
  useRetryFacebookSyncRun,
} from "@/hooks/facebook/use-facebook-sync-runs"

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

const ACTIVE_SYNC_STATUSES: readonly SyncStatus[] = ["queued", "running"]

const STATUS_OPTIONS: { value: SyncStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
]

const TYPE_OPTIONS: { value: SyncType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "full", label: "Full" },
  { value: "posts", label: "Posts" },
  { value: "comments", label: "Comments" },
  { value: "incremental", label: "Incremental" },
]

const TRIGGER_OPTIONS: { value: SyncTrigger | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "manual", label: "Manual" },
  { value: "scheduler", label: "Scheduler" },
  { value: "system", label: "System" },
]

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0)
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—"

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date)
}

function formatRelativeTime(
  dateString: string | null | undefined,
  now: number,
): string {
  if (!dateString) return "—"

  const then = new Date(dateString).getTime()
  if (Number.isNaN(then)) return dateString

  // Clamp: small clock differences can produce future timestamps.
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000))

  if (diffSeconds < 60) return "just now"

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    const rest = diffMinutes % 60
    return rest > 0 ? `${diffHours}h ${rest}m ago` : `${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDateTime(dateString)
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—"
  return formatSeconds(seconds)
}

function formatElapsed(
  startedAt: string | null | undefined,
  now: number,
): string {
  if (!startedAt) return "—"

  const start = new Date(startedAt).getTime()
  if (Number.isNaN(start)) return "—"

  return formatSeconds((now - start) / 1000)
}

/* -------------------------------------------------------------------------- */
/* Status helpers                                                             */
/* -------------------------------------------------------------------------- */

function isActiveStatus(status: SyncStatus): boolean {
  return ACTIVE_SYNC_STATUSES.includes(status)
}

function canRetry(status: SyncStatus): boolean {
  return status === "failed" || status === "cancelled"
}

function getStatusBadge(status: SyncStatus) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      )
    case "running":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Running
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    case "cancelled":
      return (
        <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      )
    case "queued":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock3 className="h-3 w-3" />
          Queued
        </Badge>
      )
    default:
      return null
  }
}

function getTypeLabel(type: SyncType): string {
  switch (type) {
    case "full":
      return "Full"
    case "posts":
      return "Posts"
    case "comments":
      return "Comments"
    case "incremental":
      return "Incremental"
    default:
      return type
  }
}

function getTriggerLabel(trigger: SyncTrigger): string {
  switch (trigger) {
    case "manual":
      return "Manual"
    case "scheduler":
      return "Scheduler"
    case "system":
      return "System"
    default:
      return trigger
  }
}

function getRunErrorMessage(run: FacebookSyncRun): string | null {
  if (
    typeof run.error_message === "string" &&
    run.error_message.trim().length > 0
  ) {
    return run.error_message.trim()
  }
  return null
}

type SafePipelineProgress = {
  expected?: number | null
  completed?: number | null
  failed?: number | null
  finished?: number | null
  progressPercent?: number | null
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function FacebookSyncRunsPage() {
  /* Filters */
  const [statusFilter, setStatusFilter] = useState<SyncStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<SyncType | "all">("all")
  const [triggerFilter, setTriggerFilter] = useState<SyncTrigger | "all">(
    "all",
  )
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])

  /* Selected run */
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  /* Browser clock (only for elapsed labels) */
  const [now, setNow] = useState<number>(() => Date.now())

  /* List query */
  const listFilters = useMemo(
    () => ({
      status: statusFilter,
      type: typeFilter,
      trigger: triggerFilter,
      page,
      perPage: pageSize,
    }),
    [statusFilter, typeFilter, triggerFilter, page, pageSize],
  )

  const {
    data: runsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFacebookSyncRuns(listFilters)

  const retryMutation = useRetryFacebookSyncRun()
  const cancelMutation = useCancelFacebookSyncRun()

  const runs: FacebookSyncRun[] = runsResponse?.data ?? []

  /* Pagination */
  const pagination = runsResponse?.meta?.pagination
  const totalRuns = pagination?.total ?? 0
  const currentPage = pagination?.current_page ?? page
  const totalPages = Math.max(1, pagination?.last_page ?? 1)

  /* Detail query */
  const {
    data: selectedRun,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useFacebookSyncRun(selectedRunId)

  /* Live status */
  const hasActiveRun = runs.some((run) => isActiveStatus(run.status))
  const selectedRunIsActive =
    selectedRun != null && isActiveStatus(selectedRun.status)

    useEffect(() => {
      if (!hasActiveRun && !selectedRunIsActive) return
    
      const intervalId = window.setInterval(() => {
        setNow(Date.now())
      }, 1000)
    
      return () => window.clearInterval(intervalId)
    }, [hasActiveRun, selectedRunIsActive])

  /* Keep pagination valid */
  // useEffect(() => {
  //   if (runsResponse && page > totalPages) {
  //     setPage(totalPages)
  //   }
  // }, [page, totalPages, runsResponse])

  /* Keep pagination valid */
  // setPage(Math.min(page, totalPages))
// const currentPage = Math.min(page, totalPages)

  /* Derived */
  const failedCount = runs.filter((run) => run.status === "failed").length
  const runningCount = runs.filter((run) => run.status === "running").length
  const completedCount = runs.filter(
    (run) => run.status === "completed",
  ).length
  const totalPosts = runs.reduce(
    (sum, run) => sum + (run.statistics?.posts_fetched ?? 0),
    0,
  )

  const activeFilterCount =
    Number(statusFilter !== "all") +
    Number(typeFilter !== "all") +
    Number(triggerFilter !== "all")

  const hasActiveFilters = activeFilterCount > 0

  /* Mutation state */
  const retryingRunId = retryMutation.isPending
    ? (retryMutation.variables ?? null)
    : null

  const cancellingRunId = cancelMutation.isPending
    ? (cancelMutation.variables ?? null)
    : null

  const isBusy = retryMutation.isPending || cancelMutation.isPending

  const retryErrorMessage =
    retryMutation.error instanceof Error
      ? retryMutation.error.message
      : retryMutation.error
        ? "Unable to retry the synchronization run."
        : null

  const cancelErrorMessage =
    cancelMutation.error instanceof Error
      ? cancelMutation.error.message
      : cancelMutation.error
        ? "Unable to cancel the synchronization run."
        : null

  /* Handlers */
  function clearFilters(): void {
    setStatusFilter("all")
    setTypeFilter("all")
    setTriggerFilter("all")
    setPage(1)
  }

  function applyStatus(value: SyncStatus | "all"): void {
    setStatusFilter(value)
    setPage(1)
  }

  function applyType(value: SyncType | "all"): void {
    setTypeFilter(value)
    setPage(1)
  }

  function applyTrigger(value: SyncTrigger | "all"): void {
    setTriggerFilter(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string): void {
    const next = Number(value)
    if (!Number.isInteger(next) || next <= 0) return

    setPageSize(next)
    setPage(1)
  }

  async function handleRefresh(): Promise<void> {
    await refetch()
    if (selectedRunId !== null) {
      await refetchDetail()
    }
  }

  function resetMutationErrors(): void {
    if (retryMutation.isError) retryMutation.reset()
    if (cancelMutation.isError) cancelMutation.reset()
  }

  function openRun(runId: string): void {
    const id = runId.trim()
    if (!id) return

    resetMutationErrors()
    setSelectedRunId(id)
  }

  function closeRun(): void {
    setSelectedRunId(null)
    resetMutationErrors()
  }

  function handleRetry(runId: string): void {
    const id = runId.trim()
    if (!id || isBusy) return

    const currentRun = runs.find((run) => run.id === id)
    if (currentRun && !canRetry(currentRun.status)) return

    retryMutation.reset()
    retryMutation.mutate(id, {
      onSuccess: (retriedRun) => {
        setSelectedRunId(retriedRun.id)
      },
    })
  }

  function handleCancel(runId: string): void {
    const id = runId.trim()
    if (!id || isBusy) return

    // Frontend guard only. The backend remains the final authority.
    const currentRun = runs.find((run) => run.id === id)
    if (currentRun && !isActiveStatus(currentRun.status)) return

    const confirmed = window.confirm(
      "Cancel this synchronization run?\n\nThe run will be marked as cancelled and will not continue processing new work.",
    )
    if (!confirmed) return

    cancelMutation.reset()
    cancelMutation.mutate(id, {
      onSuccess: (cancelledRun) => {
        // Keep the run open so the final state is visible immediately.
        if (cancelledRun?.id) {
          setSelectedRunId(cancelledRun.id)
        }
      },
    })
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sync runs
              </h1>

              {hasActiveRun && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Track Facebook syncs, their progress, and what they imported.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh()}
              disabled={isFetching}
              aria-label="Refresh"
            >
              <RefreshCw
                className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
            </Button>
          </div>
        </header>

        {/* List error */}
        {isError && (
          <Card className="border-destructive/30">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

              <div className="space-y-1">
                <p className="font-medium text-destructive">
                  Couldn’t load sync runs
                </p>

                <p className="text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "An unexpected error occurred."}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRefresh()}
                  className="mt-2"
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryTile
            label="Total runs"
            value={formatNumber(totalRuns)}
            hint="Matching filters"
            onClick={clearFilters}
          />
          <SummaryTile
            label="Completed"
            value={formatNumber(completedCount)}
            hint="On this page"
            onClick={() => applyStatus("completed")}
          />
          <SummaryTile
            label="Running"
            value={formatNumber(runningCount)}
            hint="On this page"
            onClick={() => applyStatus("running")}
          />
          <SummaryTile
            label="Failed"
            value={formatNumber(failedCount)}
            hint="On this page"
            tone={failedCount > 0 ? "danger" : "default"}
            onClick={() => applyStatus("failed")}
          />
        </div>

        {/* Table card */}
        <Card className="overflow-hidden py-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-2 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatNumber(totalRuns)}
                </span>{" "}
                {totalRuns === 1 ? "run" : "runs"} ·{" "}
                {formatNumber(totalPosts)} posts fetched on this page
              </p>

              {hasActiveFilters && (
                <>
                  <Separator orientation="vertical" className="mx-1 h-4" />

                  {statusFilter !== "all" && (
                    <FilterChip
                      label={getLabel(STATUS_OPTIONS, statusFilter)}
                      onRemove={() => applyStatus("all")}
                    />
                  )}
                  {typeFilter !== "all" && (
                    <FilterChip
                      label={`${getLabel(TYPE_OPTIONS, typeFilter)} type`}
                      onRemove={() => applyType("all")}
                    />
                  )}
                  {triggerFilter !== "all" && (
                    <FilterChip
                      label={getLabel(TRIGGER_OPTIONS, triggerFilter)}
                      onRemove={() => applyTrigger("all")}
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-2 text-muted-foreground"
                  >
                    Clear all
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Page</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Posts</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        AI
                      </TooltipTrigger>
                      <TooltipContent>
                        AI analysis jobs completed and failed
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="w-10 pr-6" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`sync-run-skeleton-${index}`}>
                      <TableCell colSpan={8} className="h-16 px-6">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : runs.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="h-8 w-8 text-muted-foreground/50" />

                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? "No runs match these filters."
                            : "No sync runs yet."}
                        </p>

                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.map((run) => {
                    const errorMessage = getRunErrorMessage(run)
                    const stats = run.statistics

                    const postsFetched = stats?.posts_fetched ?? 0
                    const commentsFetched = stats?.comments_fetched ?? 0
                    const aiCompleted = stats?.ai_completed ?? 0
                    const aiFailed = stats?.ai_failed ?? 0

                    const startedOrQueuedAt = run.started_at ?? run.queued_at
                    const isRunning = run.status === "running"
                    const isActive = isActiveStatus(run.status)
                    const isRetrying = retryingRunId === run.id
                    const isCancelling = cancellingRunId === run.id

                    return (
                      <TableRow
                        key={run.id}
                        className="cursor-pointer"
                        onClick={() => openRun(run.id)}
                      >
                        {/* Page */}
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
                              <FaFacebookF className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-48 truncate font-medium">
                                {run.page?.name ?? "Unknown Facebook Page"}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {getTypeLabel(run.type)} ·{" "}
                                {getTriggerLabel(run.trigger)}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            {getStatusBadge(run.status)}

                            {run.status === "failed" && errorMessage && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex max-w-56 items-center gap-1 text-xs text-destructive">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    <span className="truncate">
                                      {errorMessage}
                                    </span>
                                  </span>
                                </TooltipTrigger>

                                <TooltipContent className="max-w-xs break-words font-mono text-xs">
                                  {errorMessage}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        {/* Started */}
                        <TableCell>
                          <div className="whitespace-nowrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm">
                                  {formatRelativeTime(startedOrQueuedAt, now)}
                                </p>
                              </TooltipTrigger>

                              <TooltipContent>
                                {formatDateTime(startedOrQueuedAt)}
                              </TooltipContent>
                            </Tooltip>

                            <p className="text-xs text-muted-foreground">
                              {run.triggered_by?.name ?? "System"}
                            </p>
                          </div>
                        </TableCell>

                        {/* Duration */}
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {isRunning && run.started_at
                            ? formatElapsed(run.started_at, now)
                            : run.status === "queued"
                              ? "Queued"
                              : formatDuration(run.duration_seconds)}
                        </TableCell>

                        {/* Posts */}
                        <TableCell className="text-right">
                          <p className="font-medium">
                            {formatNumber(postsFetched)}
                          </p>
                        </TableCell>

                        {/* Comments */}
                        <TableCell className="text-right">
                          <p className="font-medium">
                            {formatNumber(commentsFetched)}
                          </p>
                        </TableCell>

                        {/* AI */}
                        <TableCell className="text-right">
                          <p className="font-medium">
                            {formatNumber(aiCompleted)}
                          </p>

                          {aiFailed > 0 && (
                            <p className="text-xs text-destructive">
                              {formatNumber(aiFailed)} failed
                            </p>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          className="pr-6"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isRetrying || isCancelling}
                              >
                                {isRetrying || isCancelling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                                <span className="sr-only">Open actions</span>
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRun(run.id)}>
                                View details
                              </DropdownMenuItem>

                              {isActive && (
                                <DropdownMenuItem
                                  disabled={isBusy}
                                  onClick={() => handleCancel(run.id)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              )}

                              {canRetry(run.status) && (
                                <DropdownMenuItem
                                  disabled={isBusy}
                                  onClick={() => handleRetry(run.id)}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Retry
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalRuns > 0 && (
            <div className="flex flex-col gap-3 border-t px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Filters sheet                                                      */}
        {/* ------------------------------------------------------------------ */}

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent className="flex w-full flex-col gap-0 sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow the list by status, type, or trigger. Changes apply
                right away.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
              <FilterGroup
                title="Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={applyStatus}
              />

              <Separator />

              <FilterGroup
                title="Type"
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={applyType}
              />

              <Separator />

              <FilterGroup
                title="Trigger"
                options={TRIGGER_OPTIONS}
                value={triggerFilter}
                onChange={applyTrigger}
              />
            </div>

            <SheetFooter className="gap-2 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>

              <Button className="w-full" onClick={() => setFiltersOpen(false)}>
                Show {formatNumber(totalRuns)}{" "}
                {totalRuns === 1 ? "run" : "runs"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* ------------------------------------------------------------------ */}
        {/* Detail sheet                                                       */}
        {/* ------------------------------------------------------------------ */}

        <Sheet
          open={selectedRunId !== null}
          onOpenChange={(open: boolean) => {
            if (!open) closeRun()
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            {isLoadingDetail ? (
              <>
                <SheetHeader>
                  <SheetTitle>Sync run</SheetTitle>
                  <SheetDescription>Loading details…</SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-6">
                  <div className="h-20 animate-pulse rounded-lg bg-muted" />
                  <div className="h-24 animate-pulse rounded-lg bg-muted" />
                  <div className="h-32 animate-pulse rounded-lg bg-muted" />
                </div>
              </>
            ) : isDetailError ? (
              <>
                <SheetHeader>
                  <SheetTitle>Couldn’t load run</SheetTitle>
                  <SheetDescription>
                    The details for this run could not be loaded.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-6">
                  <InlineError
                    title="Request failed"
                    message={
                      detailError instanceof Error
                        ? detailError.message
                        : "An unexpected error occurred."
                    }
                  />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => void refetchDetail()}
                    disabled={isFetchingDetail}
                  >
                    <RefreshCw
                      className={
                        isFetchingDetail
                          ? "mr-2 h-4 w-4 animate-spin"
                          : "mr-2 h-4 w-4"
                      }
                    />
                    Try again
                  </Button>
                </div>
              </>
            ) : selectedRun ? (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {getStatusBadge(selectedRun.status)}

                    <span className="truncate font-mono text-sm text-muted-foreground">
                      {selectedRun.id}
                    </span>
                  </SheetTitle>

                  <SheetDescription>
                    {getTypeLabel(selectedRun.type)} sync ·{" "}
                    {getTriggerLabel(selectedRun.trigger)} ·{" "}
                    {selectedRun.triggered_by?.name ?? "System"}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6">
                  {/* Active */}
                  {selectedRun.is_active && (
                    <div className="rounded-lg bg-muted/40 p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                          Sync in progress
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedRun.started_at
                          ? `Running for ${formatElapsed(selectedRun.started_at, now)}`
                          : "Waiting for the queue worker to start this job."}
                      </p>

                      {isFetchingDetail && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Updating status…
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mutation errors */}
                  {cancelErrorMessage && (
                    <InlineError
                      title="Cancellation failed"
                      message={cancelErrorMessage}
                      onDismiss={() => cancelMutation.reset()}
                    />
                  )}

                  {retryErrorMessage && (
                    <InlineError
                      title="Retry failed"
                      message={retryErrorMessage}
                      onDismiss={() => retryMutation.reset()}
                    />
                  )}

                  {/* Run error */}
                  {selectedRun.has_error && selectedRun.error?.message && (
                    <InlineError
                      title="Sync failed"
                      message={selectedRun.error.message}
                      mono
                    />
                  )}

                  {/* Page */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
                      <FaFacebookF className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {selectedRun.page?.name ?? "Unknown Facebook Page"}
                      </p>

                      <p className="font-mono text-xs text-muted-foreground">
                        {selectedRun.page?.facebook_page_id ??
                          selectedRun.meta_page_id}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <DetailItem label="Queued">
                      {formatDateTime(selectedRun.queued_at)}
                    </DetailItem>

                    <DetailItem label="Started">
                      {formatDateTime(selectedRun.started_at)}
                    </DetailItem>

                    <DetailItem label="Completed">
                      {formatDateTime(selectedRun.completed_at)}
                    </DetailItem>

                    <DetailItem label="Duration">
                      {selectedRun.is_active && selectedRun.started_at
                        ? formatElapsed(selectedRun.started_at, now)
                        : selectedRun.status === "queued"
                          ? "Queued"
                          : formatDuration(selectedRun.duration_seconds)}
                    </DetailItem>
                  </dl>

                  <Separator />

                  {/* Progress */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Progress</p>

                        <span className="text-sm font-semibold">
                          {formatNumber(
                            selectedRun.pipeline?.overall?.progressPercent ?? 0,
                          )}
                          %
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNumber(
                          selectedRun.pipeline?.overall?.completed ?? 0,
                        )}{" "}
                        completed ·{" "}
                        {formatNumber(
                          selectedRun.pipeline?.overall?.failed ?? 0,
                        )}{" "}
                        failed ·{" "}
                        {formatNumber(
                          selectedRun.pipeline?.overall?.remaining ?? 0,
                        )}{" "}
                        remaining
                      </p>
                    </div>

                    <ProgressBar
                      percent={
                        selectedRun.pipeline?.overall?.progressPercent ?? 0
                      }
                      className="h-2"
                    />

                    <div className="space-y-4 pt-1">
                      <PipelineProgressRow
                        label="Comment sync"
                        progress={selectedRun.pipeline?.commentJobs}
                      />
                      <PipelineProgressRow
                        label="Post AI analysis"
                        progress={selectedRun.pipeline?.postAiJobs}
                      />
                      <PipelineProgressRow
                        label="Comment AI analysis"
                        progress={selectedRun.pipeline?.commentAiJobs}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Results */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Results</p>

                    <ResultRow
                      label="Posts"
                      main={`${formatNumber(selectedRun.statistics?.posts_fetched)} fetched`}
                      sub={`+${formatNumber(selectedRun.statistics?.posts_created)} new · ${formatNumber(selectedRun.statistics?.posts_updated)} updated`}
                    />

                    <ResultRow
                      label="Comments"
                      main={`${formatNumber(selectedRun.statistics?.comments_fetched)} fetched`}
                      sub={`+${formatNumber(selectedRun.statistics?.comments_created)} new · ${formatNumber(selectedRun.statistics?.comments_updated)} updated`}
                    />

                    {(selectedRun.statistics?.comments_failed ?? 0) > 0 && (
                      <ResultRow
                        label="Comment failures"
                        main={formatNumber(
                          selectedRun.statistics?.comments_failed,
                        )}
                        danger
                      />
                    )}

                    <ResultRow
                      label="AI analysis jobs"
                      main={`${formatNumber(selectedRun.statistics?.ai_completed)} completed`}
                      sub={
                        (selectedRun.statistics?.ai_failed ?? 0) > 0
                          ? `${formatNumber(selectedRun.statistics?.ai_failed)} failed`
                          : undefined
                      }
                      subDanger
                    />
                  </div>

                  <Separator />

                  {/* Technical */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Technical details</p>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <DetailItem label="Queue" mono>
                        {selectedRun.queue}
                      </DetailItem>

                      <DetailItem label="Attempts">
                        {selectedRun.attempts}
                      </DetailItem>

                      {selectedRun.job_id && (
                        <DetailItem label="Queue job ID" mono wide>
                          {selectedRun.job_id}
                        </DetailItem>
                      )}

                      <DetailItem label="Internal page ID" mono wide>
                        {selectedRun.facebook_page_id}
                      </DetailItem>

                      <DetailItem label="Meta page ID" mono wide>
                        {selectedRun.meta_page_id}
                      </DetailItem>
                    </dl>
                  </div>
                </div>

                <SheetFooter className="gap-2">
                  {selectedRunIsActive && (
                    <Button
                      variant="destructive"
                      className="w-full gap-1.5"
                      onClick={() => handleCancel(selectedRun.id)}
                      disabled={isBusy}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Cancelling…
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel sync
                        </>
                      )}
                    </Button>
                  )}

                  {canRetry(selectedRun.status) && (
                    <Button
                      className="w-full gap-1.5"
                      onClick={() => handleRetry(selectedRun.id)}
                      disabled={isBusy}
                    >
                      {retryMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Retrying…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry sync
                        </>
                      )}
                    </Button>
                  )}

                  {selectedRun.page?.facebook_page_id ? (
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() =>
                        window.open(
                          `https://facebook.com/${encodeURIComponent(
                            selectedRun.page!.facebook_page_id,
                          )}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open page on Facebook
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Facebook page unavailable
                    </Button>
                  )}
                </SheetFooter>
              </>
            ) : (
              <>
                <SheetHeader>
                  <SheetTitle>Sync run</SheetTitle>
                  <SheetDescription>
                    This run could not be found.
                  </SheetDescription>
                </SheetHeader>

                <div className="px-4 py-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={closeRun}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function getLabel<T extends string>(
  options: { value: T | "all"; label: string }[],
  value: T | "all",
): string {
  return options.find((option) => option.value === value)?.label ?? value
}

function SummaryTile({
  label,
  value,
  hint,
  tone = "default",
  onClick,
}: {
  label: string
  value: string
  hint: string
  tone?: "default" | "danger"
  onClick: () => void
}) {
  const danger = tone === "danger"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-card p-4 text-left transition-colors ${
        danger ? "hover:bg-destructive/5" : "hover:bg-muted/40"
      }`}
    >
      <p
        className={`text-sm ${
          danger ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          danger ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>

      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </button>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/70"
    >
      {label}
      <X className="h-3 w-3 text-muted-foreground" />
      <span className="sr-only">Remove filter</span>
    </button>
  )
}

function FilterGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: { value: T | "all"; label: string }[]
  value: T | "all"
  onChange: (value: T | "all") => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{title}</p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InlineError({
  title,
  message,
  mono = false,
  onDismiss,
}: {
  title: string
  message: string
  mono?: boolean
  onDismiss?: () => void
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">{title}</p>

          <p
            className={`mt-1 break-words text-xs text-muted-foreground ${
              mono ? "font-mono" : ""
            }`}
          >
            {message}
          </p>
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onDismiss}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  )
}

function DetailItem({
  label,
  children,
  mono = false,
  wide = false,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
  wide?: boolean
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>

      <dd
        className={`mt-1 break-all text-sm ${mono ? "font-mono text-xs" : ""}`}
      >
        {children}
      </dd>
    </div>
  )
}

function ResultRow({
  label,
  main,
  sub,
  danger = false,
  subDanger = false,
}: {
  label: string
  main: string
  sub?: string
  danger?: boolean
  subDanger?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>

      <span className="text-right">
        <span className={`font-medium ${danger ? "text-destructive" : ""}`}>
          {main}
        </span>

        {sub && (
          <span
            className={`block text-xs ${
              subDanger ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {sub}
          </span>
        )}
      </span>
    </div>
  )
}

function ProgressBar({
  percent,
  className = "h-1.5",
}: {
  percent: number
  className?: string
}) {
  const safe = Math.min(100, Math.max(0, percent))

  return (
    <div className={`overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}

function PipelineProgressRow({
  label,
  progress,
}: {
  label: string
  progress?: SafePipelineProgress | null
}) {
  const expected = Math.max(0, progress?.expected ?? 0)
  const completed = Math.max(0, progress?.completed ?? 0)
  const failed = Math.max(0, progress?.failed ?? 0)
  const finished = Math.max(0, progress?.finished ?? 0)
  const percent = Math.min(100, Math.max(0, progress?.progressPercent ?? 0))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>

        <span className="font-medium tabular-nums">
          {formatNumber(finished)}/{formatNumber(expected)}
        </span>
      </div>

      <ProgressBar percent={percent} />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{expected === 0 ? "No jobs" : `${percent}% complete`}</span>

        {expected > 0 && (
          <span>
            {formatNumber(completed)} completed
            {failed > 0 && (
              <>
                {" · "}
                <span className="text-destructive">
                  {formatNumber(failed)} failed
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  )
}