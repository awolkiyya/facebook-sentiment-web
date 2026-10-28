"use client"

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  History,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react"
import { FaFacebookF } from "react-icons/fa"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
]

const TYPE_OPTIONS: { value: SyncType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "full", label: "Full sync" },
  { value: "posts", label: "Posts" },
  { value: "comments", label: "Comments" },
  { value: "incremental", label: "Incremental" },
]

const TRIGGER_OPTIONS: { value: SyncTrigger | "all"; label: string }[] = [
  { value: "all", label: "All triggers" },
  { value: "manual", label: "Manual" },
  { value: "scheduler", label: "Scheduler" },
  { value: "system", label: "System" },
]

const STATUS_STYLE: Record<
  SyncStatus,
  { label: string; dot: string; text: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  running: {
    label: "Running",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
  },
  queued: {
    label: "Queued",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  failed: {
    label: "Failed",
    dot: "bg-destructive",
    text: "text-destructive",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-muted-foreground/50",
    text: "text-muted-foreground",
  },
}

/* -------------------------------------------------------------------------- */
/* Safe response access                                                       */
/* -------------------------------------------------------------------------- */

type UnknownRecord = Record<string, unknown>

type PipelineProgress = {
  expected: number
  completed: number
  failed: number
  finished: number
  progressPercent: number
  startedAt?: string | null
  completedAt?: string | null
}

type PipelineView = {
  initialized: boolean
  completed: boolean
  initializedAt: string | null
  completedAt: string | null
  commentJobs: PipelineProgress
  postAiJobs: PipelineProgress
  commentAiJobs: PipelineProgress
  overall: {
    expected: number
    completed: number
    failed: number
    finished: number
    remaining: number
    progressPercent: number
    isFinished: boolean
  }
}

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {}
}

function firstValue(source: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key]
    }
  }

  return undefined
}

function readNumber(source: UnknownRecord, ...keys: string[]): number {
  const value = firstValue(source, ...keys)

  if (typeof value === "number" && Number.isFinite(value)) return value

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return 0
}

function readBoolean(source: UnknownRecord, ...keys: string[]): boolean {
  const value = firstValue(source, ...keys)
  return value === true || value === 1 || value === "1"
}

function readString(source: UnknownRecord, ...keys: string[]): string | null {
  const value = firstValue(source, ...keys)
  return typeof value === "string" && value.trim() ? value : null
}

function resolvePercent(
  source: UnknownRecord,
  expected: number,
  finished: number,
): number {
  const raw = firstValue(
    source,
    "progressPercent",
    "progress_percent",
    "progress_percentage",
  )

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(100, Math.max(0, raw))
  }

  return expected > 0
    ? Math.min(100, Math.round((finished / expected) * 100))
    : 0
}

function normalizeProgress(value: unknown): PipelineProgress {
  const source = asRecord(value)

  const expected = Math.max(0, readNumber(source, "expected"))
  const completed = Math.max(0, readNumber(source, "completed"))
  const failed = Math.max(0, readNumber(source, "failed"))
  const finished = Math.max(0, readNumber(source, "finished", "total_finished"))

  return {
    expected,
    completed,
    failed,
    finished,
    progressPercent: resolvePercent(source, expected, finished),
    startedAt: readString(source, "startedAt", "started_at"),
    completedAt: readString(source, "completedAt", "completed_at"),
  }
}

function normalizePipeline(value: unknown): PipelineView {
  const source = asRecord(value)
  const overallSource = asRecord(source.overall)

  const commentJobs = normalizeProgress(
    firstValue(source, "commentJobs", "comment_jobs"),
  )
  const postAiJobs = normalizeProgress(
    firstValue(source, "postAiJobs", "post_ai_jobs"),
  )
  const commentAiJobs = normalizeProgress(
    firstValue(source, "commentAiJobs", "comment_ai_jobs"),
  )

  const expected = Math.max(
    0,
    readNumber(overallSource, "expected") ||
      commentJobs.expected + postAiJobs.expected + commentAiJobs.expected,
  )

  const completed = Math.max(0, readNumber(overallSource, "completed"))
  const failed = Math.max(0, readNumber(overallSource, "failed"))
  const finished = Math.max(
    0,
    readNumber(overallSource, "finished") || completed + failed,
  )

  return {
    initialized: readBoolean(source, "initialized"),
    completed: readBoolean(source, "completed"),
    initializedAt: readString(source, "initializedAt", "initialized_at"),
    completedAt: readString(source, "completedAt", "completed_at"),
    commentJobs,
    postAiJobs,
    commentAiJobs,
    overall: {
      expected,
      completed,
      failed,
      finished,
      remaining: Math.max(
        0,
        readNumber(overallSource, "remaining") || expected - finished,
      ),
      progressPercent: resolvePercent(overallSource, expected, finished),
      isFinished: readBoolean(overallSource, "isFinished", "is_finished"),
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
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
    timeStyle: "short",
  }).format(date)
}

function formatRelativeTime(
  dateString: string | null | undefined,
  now: number,
): string {
  if (!dateString) return "—"

  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return dateString

  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 60) return "Just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const remainingMinutes = minutes % 60
    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m ago`
      : `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDateTime(dateString)
}

function formatSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60

  if (hours > 0) return `${hours}h ${minutes}m ${remainder}s`
  if (minutes > 0) return `${minutes}m ${remainder}s`
  return `${remainder}s`
}

function formatDuration(seconds: number | null | undefined): string {
  return seconds == null ? "—" : formatSeconds(seconds)
}

function formatElapsed(
  startedAt: string | null | undefined,
  now: number,
): string {
  if (!startedAt) return "—"

  const timestamp = new Date(startedAt).getTime()
  if (Number.isNaN(timestamp)) return "—"

  return formatSeconds(Math.max(0, (now - timestamp) / 1000))
}

/* -------------------------------------------------------------------------- */
/* Status and label helpers                                                   */
/* -------------------------------------------------------------------------- */

function isActiveStatus(status: SyncStatus): boolean {
  return ACTIVE_SYNC_STATUSES.includes(status)
}

function canRetry(status: SyncStatus): boolean {
  return status === "failed" || status === "cancelled"
}

function getTypeLabel(type: SyncType): string {
  const labels: Record<SyncType, string> = {
    full: "Full sync",
    posts: "Posts",
    comments: "Comments",
    incremental: "Incremental",
  }

  return labels[type] ?? type
}

function getTriggerLabel(trigger: SyncTrigger): string {
  const labels: Record<SyncTrigger, string> = {
    manual: "Manual",
    scheduler: "Scheduler",
    system: "System",
  }

  return labels[trigger] ?? trigger
}

function getRunErrorMessage(run: FacebookSyncRun): string | null {
  return typeof run.error_message === "string" && run.error_message.trim()
    ? run.error_message.trim()
    : null
}

function durationLabel(run: FacebookSyncRun, now: number): string {
  if (run.status === "running" && run.started_at) {
    return formatElapsed(run.started_at, now)
  }

  if (run.status === "queued") return "Waiting"

  return formatDuration(run.duration_seconds)
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function FacebookSyncRunsPage() {
  const [statusFilter, setStatusFilter] = useState<SyncStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<SyncType | "all">("all")
  const [triggerFilter, setTriggerFilter] = useState<SyncTrigger | "all">(
    "all",
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

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
  const pagination = runsResponse?.meta?.pagination
  const totalRuns = pagination?.total ?? 0
  const currentPage = pagination?.current_page ?? page
  const totalPages = Math.max(1, pagination?.last_page ?? 1)

  const {
    data: selectedRun,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useFacebookSyncRun(selectedRunId)

  const hasActiveRun = runs.some((run) => isActiveStatus(run.status))
  const selectedRunIsActive =
    selectedRun != null && isActiveStatus(selectedRun.status)

  const activeFilterCount =
    Number(statusFilter !== "all") +
    Number(typeFilter !== "all") +
    Number(triggerFilter !== "all")

  const hasActiveFilters = activeFilterCount > 0

  const failedCount = runs.filter((run) => run.status === "failed").length
  const runningCount = runs.filter((run) => run.status === "running").length
  const completedCount = runs.filter((run) => run.status === "completed").length
  const queuedCount = runs.filter((run) => run.status === "queued").length

  const totalPosts = runs.reduce(
    (sum, run) => sum + (run.statistics?.posts_fetched ?? 0),
    0,
  )
  const totalComments = runs.reduce(
    (sum, run) => sum + (run.statistics?.comments_fetched ?? 0),
    0,
  )

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
        ? "Unable to retry this synchronization run."
        : null

  const cancelErrorMessage =
    cancelMutation.error instanceof Error
      ? cancelMutation.error.message
      : cancelMutation.error
        ? "Unable to cancel this synchronization run."
        : null

  const selectedPipeline = useMemo(
    () => normalizePipeline(selectedRun?.pipeline),
    [selectedRun],
  )

  useEffect(() => {
    if (!hasActiveRun && !selectedRunIsActive) return

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [hasActiveRun, selectedRunIsActive])

  // Correct the requested page if a filter change or deletion reduces totals.
  useEffect(() => {
    if (!runsResponse || isFetching) return

    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [runsResponse, isFetching, page, totalPages])

  function clearFilters() {
    setStatusFilter("all")
    setTypeFilter("all")
    setTriggerFilter("all")
    setPage(1)
  }

  function applyStatus(value: SyncStatus | "all") {
    setStatusFilter(value)
    setPage(1)
  }

  function applyType(value: SyncType | "all") {
    setTypeFilter(value)
    setPage(1)
  }

  function applyTrigger(value: SyncTrigger | "all") {
    setTriggerFilter(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    const next = Number(value)

    if (!PAGE_SIZE_OPTIONS.some((option) => option === next)) return

    setPageSize(next)
    setPage(1)
  }

  async function handleRefresh() {
    await refetch()

    if (selectedRunId) {
      await refetchDetail()
    }
  }

  function resetMutationErrors() {
    if (retryMutation.isError) retryMutation.reset()
    if (cancelMutation.isError) cancelMutation.reset()
  }

  function openRun(runId: string) {
    const id = runId.trim()
    if (!id) return

    resetMutationErrors()
    setSelectedRunId(id)
  }

  function closeRun() {
    setSelectedRunId(null)
    resetMutationErrors()
  }

  function handleRetry(runId: string) {
    const id = runId.trim()
    if (!id || isBusy) return

    const currentRun = runs.find((run) => run.id === id)

    if (currentRun && !canRetry(currentRun.status)) return

    retryMutation.reset()

    retryMutation.mutate(id, {
      onSuccess: (retriedRun) => {
        setSelectedRunId(retriedRun.id)
        void refetch()
      },
    })
  }

  function handleCancel(runId: string) {
    const id = runId.trim()
    if (!id || isBusy) return

    const currentRun = runs.find((run) => run.id === id)

    if (currentRun && !isActiveStatus(currentRun.status)) return

    const confirmed = window.confirm(
      "Cancel this synchronization run?\n\nThe server will determine whether the run can be cancelled.",
    )

    if (!confirmed) return

    cancelMutation.reset()

    cancelMutation.mutate(id, {
      onSuccess: (cancelledRun) => {
        if (cancelledRun?.id) {
          setSelectedRunId(cancelledRun.id)
        }

        void refetch()
      },
    })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1877F2] text-white">
              <FaFacebookF className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Facebook sync runs
                </h1>

                {hasActiveRun && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Track imports from your Facebook pages and the AI analysis that
                follows.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isFetching}
            className="shrink-0 gap-2"
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </header>

        {/* List request error */}
        {isError && (
          <InlineError
            title="Unable to load sync runs"
            message={
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while loading synchronization history."
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleRefresh()}
                disabled={isFetching}
              >
                Try again
              </Button>
            }
          />
        )}

        {/* Summary strip: one surface, four cells */}
        <section
          aria-label="Synchronization summary"
          className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card lg:grid-cols-4"
        >
          <StatCell
            label="Matching runs"
            value={formatNumber(totalRuns)}
            note={`${formatNumber(totalPosts)} posts, ${formatNumber(totalComments)} comments on this page`}
            onClick={clearFilters}
            className="border-b lg:border-b-0"
          />
          <StatCell
            label="Completed"
            value={formatNumber(completedCount)}
            dot="bg-emerald-500"
            note="On this page"
            onClick={() => applyStatus("completed")}
            className="border-b border-l lg:border-b-0"
          />
          <StatCell
            label="In progress"
            value={formatNumber(runningCount + queuedCount)}
            dot="bg-sky-500"
            note={`${formatNumber(runningCount)} running, ${formatNumber(queuedCount)} queued`}
            onClick={() => applyStatus("running")}
            className="lg:border-l"
          />
          <StatCell
            label="Failed"
            value={formatNumber(failedCount)}
            dot="bg-destructive"
            danger={failedCount > 0}
            note="On this page"
            onClick={() => applyStatus("failed")}
            className="border-l"
          />
        </section>

        {/* Toolbar: filters live inline instead of in a sheet */}
        <section
          aria-label="Filters"
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <FilterSelect
            ariaLabel="Filter by status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={applyStatus}
          />
          <FilterSelect
            ariaLabel="Filter by sync type"
            value={typeFilter}
            options={TYPE_OPTIONS}
            onChange={applyType}
          />
          <FilterSelect
            ariaLabel="Filter by trigger"
            value={triggerFilter}
            options={TRIGGER_OPTIONS}
            onChange={applyTrigger}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1.5 px-2 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear {activeFilterCount === 1 ? "filter" : "filters"}
            </Button>
          )}
        </section>

        {/* Runs */}
        <section className="overflow-hidden rounded-xl border bg-card">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">Page</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Posts</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="w-44">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        AI analysis
                      </TooltipTrigger>
                      <TooltipContent>
                        Completed and failed AI analysis jobs
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="w-12 pr-4" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={`sync-skeleton-${index}`}>
                      <TableCell colSpan={8} className="px-5 py-4">
                        <div className="h-5 animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : runs.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="h-60 text-center">
                      <EmptyState
                        filtered={hasActiveFilters}
                        onClear={clearFilters}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  runs.map((run) => {
                    const errorMessage = getRunErrorMessage(run)
                    const startedOrQueuedAt = run.started_at ?? run.queued_at

                    return (
                      <TableRow
                        key={run.id}
                        className="cursor-pointer"
                        onClick={() => openRun(run.id)}
                      >
                        <TableCell className="pl-5">
                          <div className="min-w-[180px]">
                            <p className="max-w-56 truncate font-medium">
                              {run.page?.name ?? "Unknown Facebook page"}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {getTypeLabel(run.type)} by{" "}
                              {getTriggerLabel(run.trigger).toLowerCase()}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <StatusPill status={run.status} />

                            {run.status === "failed" && errorMessage && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="max-w-48 truncate text-xs text-destructive">
                                    {errorMessage}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm break-words">
                                  {errorMessage}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="min-w-28">
                                <p className="whitespace-nowrap text-sm">
                                  {formatRelativeTime(startedOrQueuedAt, now)}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {run.triggered_by?.name ?? "System"}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {formatDateTime(startedOrQueuedAt)}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                          {durationLabel(run, now)}
                        </TableCell>

                        <TableCell className="text-right text-sm font-medium tabular-nums">
                          {formatNumber(run.statistics?.posts_fetched)}
                        </TableCell>

                        <TableCell className="text-right text-sm font-medium tabular-nums">
                          {formatNumber(run.statistics?.comments_fetched)}
                        </TableCell>

                        <TableCell>
                          <AiMiniProgress
                            completed={run.statistics?.ai_completed ?? 0}
                            failed={run.statistics?.ai_failed ?? 0}
                            queued={
                              (run.statistics?.posts_queued_for_ai ?? 0) +
                              (run.statistics?.comments_queued_for_ai ?? 0)
                            }
                          />
                        </TableCell>

                        <TableCell
                          className="pr-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <RunActions
                            run={run}
                            busy={isBusy}
                            pending={
                              retryingRunId === run.id ||
                              cancellingRunId === run.id
                            }
                            onView={openRun}
                            onRetry={handleRetry}
                            onCancel={handleCancel}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile list */}
          <div className="divide-y md:hidden">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`sync-card-skeleton-${index}`} className="p-4">
                  <div className="h-14 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : runs.length === 0 ? (
              <div className="py-12">
                <EmptyState filtered={hasActiveFilters} onClear={clearFilters} />
              </div>
            ) : (
              runs.map((run) => {
                const startedOrQueuedAt = run.started_at ?? run.queued_at
                const errorMessage = getRunErrorMessage(run)

                return (
                  <div
                    key={run.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openRun(run.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        openRun(run.id)
                      }
                    }}
                    className="space-y-3 p-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {run.page?.name ?? "Unknown Facebook page"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {getTypeLabel(run.type)} by{" "}
                          {getTriggerLabel(run.trigger).toLowerCase()},{" "}
                          {formatRelativeTime(startedOrQueuedAt, now)}
                        </p>
                      </div>

                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StatusPill status={run.status} />
                        <RunActions
                          run={run}
                          busy={isBusy}
                          pending={
                            retryingRunId === run.id ||
                            cancellingRunId === run.id
                          }
                          onView={openRun}
                          onRetry={handleRetry}
                          onCancel={handleCancel}
                        />
                      </div>
                    </div>

                    {run.status === "failed" && errorMessage && (
                      <p className="line-clamp-2 text-xs text-destructive">
                        {errorMessage}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Posts</p>
                        <p className="font-medium tabular-nums">
                          {formatNumber(run.statistics?.posts_fetched)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Comments
                        </p>
                        <p className="font-medium tabular-nums">
                          {formatNumber(run.statistics?.comments_fetched)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-medium tabular-nums">
                          {durationLabel(run, now)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalRuns > 0 && (
            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Rows per page
                </span>

                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-8 w-[76px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="text-xs tabular-nums text-muted-foreground">
                  {pagination?.from ?? 0} to {pagination?.to ?? 0} of{" "}
                  {formatNumber(totalRuns)}
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Previous page"
                    disabled={currentPage <= 1 || isFetching}
                    onClick={() =>
                      setPage((previous) => Math.max(1, previous - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="min-w-20 text-center text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Next page"
                    disabled={currentPage >= totalPages || isFetching}
                    onClick={() =>
                      setPage((previous) => Math.min(totalPages, previous + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Run details */}
        <Sheet
          open={selectedRunId !== null}
          onOpenChange={(open) => {
            if (!open) closeRun()
          }}
        >
          <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
            {isLoadingDetail ? (
              <>
                <SheetHeader className="border-b">
                  <SheetTitle>Run details</SheetTitle>
                  <SheetDescription>Loading run information…</SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 py-6">
                  <div className="h-20 animate-pulse rounded-xl bg-muted" />
                  <div className="h-28 animate-pulse rounded-xl bg-muted" />
                  <div className="h-36 animate-pulse rounded-xl bg-muted" />
                </div>
              </>
            ) : isDetailError ? (
              <>
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Unable to load run</SheetTitle>
                  <SheetDescription>
                    The server could not return the details for this run.
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
                <SheetHeader className="border-b pb-4">
                  <div className="flex items-start justify-between gap-3 pr-8">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1877F2] text-white">
                        <FaFacebookF className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <SheetTitle className="truncate text-left">
                          {selectedRun.page?.name ?? "Unknown Facebook page"}
                        </SheetTitle>
                        <SheetDescription className="text-left">
                          {getTypeLabel(selectedRun.type)} by{" "}
                          {getTriggerLabel(selectedRun.trigger).toLowerCase()}
                          {", started by "}
                          {selectedRun.triggered_by?.name ?? "System"}
                        </SheetDescription>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="Refresh run details"
                      disabled={isFetchingDetail}
                      onClick={() => void refetchDetail()}
                    >
                      <RefreshCw
                        className={
                          isFetchingDetail
                            ? "h-4 w-4 animate-spin"
                            : "h-4 w-4"
                        }
                      />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill status={selectedRun.status} />
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {selectedRun.is_active && selectedRun.started_at
                        ? `Running for ${formatElapsed(selectedRun.started_at, now)}`
                        : selectedRun.status === "queued"
                          ? "Waiting for a worker"
                          : formatDuration(selectedRun.duration_seconds)}
                    </span>
                    {selectedRun.last_heartbeat_at && selectedRun.is_active && (
                      <span className="text-xs text-muted-foreground">
                        Heartbeat{" "}
                        {formatRelativeTime(selectedRun.last_heartbeat_at, now)}
                      </span>
                    )}
                  </div>
                </SheetHeader>

                <div className="flex-1 space-y-7 px-4 py-6">
                  {/* Action errors */}
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

                  {/* Run failure */}
                  {selectedRun.has_error && (
                    <InlineError
                      title="Synchronization error"
                      message={
                        selectedRun.error?.message ??
                        selectedRun.error_message ??
                        "The run reported an error, but the server did not provide additional details."
                      }
                      mono
                    />
                  )}

                  {/* Pipeline: the one featured element */}
                  <section className="space-y-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <SectionHeading title="Pipeline progress" />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNumber(selectedPipeline.overall.finished)} of{" "}
                          {formatNumber(selectedPipeline.overall.expected)}{" "}
                          background jobs finished
                        </p>
                      </div>

                      <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums">
                        {formatNumber(selectedPipeline.overall.progressPercent)}
                        <span className="text-lg text-muted-foreground">%</span>
                      </span>
                    </div>

                    <SegmentedBar
                      completed={selectedPipeline.overall.completed}
                      failed={selectedPipeline.overall.failed}
                      expected={selectedPipeline.overall.expected}
                      className="h-3"
                    />

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      <Legend
                        dot="bg-primary"
                        label={`${formatNumber(selectedPipeline.overall.completed)} completed`}
                      />
                      <Legend
                        dot="bg-destructive"
                        label={`${formatNumber(selectedPipeline.overall.failed)} failed`}
                      />
                      <Legend
                        dot="bg-muted-foreground/30"
                        label={`${formatNumber(selectedPipeline.overall.remaining)} remaining`}
                      />
                    </div>

                    {!selectedPipeline.initialized &&
                    selectedPipeline.overall.expected === 0 ? (
                      <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                        The server has not reported job progress for this run
                        yet.
                      </p>
                    ) : (
                      <div className="space-y-4 rounded-xl border p-4">
                        <PipelineRow
                          label="Comment synchronization"
                          progress={selectedPipeline.commentJobs}
                        />
                        <PipelineRow
                          label="Post AI analysis"
                          progress={selectedPipeline.postAiJobs}
                        />
                        <PipelineRow
                          label="Comment AI analysis"
                          progress={selectedPipeline.commentAiJobs}
                        />
                      </div>
                    )}
                  </section>

                  <Separator />

                  {/* Import results */}
                  <section className="space-y-3">
                    <SectionHeading title="Import results" />

                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        title="Posts"
                        total={selectedRun.statistics?.posts_fetched}
                        lines={[
                          [
                            "New",
                            selectedRun.statistics?.posts_created,
                            false,
                          ],
                          [
                            "Updated",
                            selectedRun.statistics?.posts_updated,
                            false,
                          ],
                        ]}
                      />

                      <ResultCard
                        title="Comments"
                        total={selectedRun.statistics?.comments_fetched}
                        lines={[
                          [
                            "New",
                            selectedRun.statistics?.comments_created,
                            false,
                          ],
                          [
                            "Updated",
                            selectedRun.statistics?.comments_updated,
                            false,
                          ],
                          [
                            "Failed",
                            selectedRun.statistics?.comments_failed,
                            true,
                          ],
                        ]}
                      />

                      <ResultCard
                        title="Queued for AI"
                        total={
                          (selectedRun.statistics?.posts_queued_for_ai ?? 0) +
                          (selectedRun.statistics?.comments_queued_for_ai ?? 0)
                        }
                        lines={[
                          [
                            "Posts",
                            selectedRun.statistics?.posts_queued_for_ai,
                            false,
                          ],
                          [
                            "Comments",
                            selectedRun.statistics?.comments_queued_for_ai,
                            false,
                          ],
                        ]}
                      />

                      <ResultCard
                        title="AI analysis"
                        total={selectedRun.statistics?.ai_completed}
                        totalSuffix="done"
                        lines={[
                          [
                            "Failed",
                            selectedRun.statistics?.ai_failed,
                            true,
                          ],
                        ]}
                      />
                    </div>
                  </section>

                  <Separator />

                  {/* Timeline */}
                  <section className="space-y-3">
                    <SectionHeading title="Timeline" />

                    <ol className="relative space-y-4 border-l pl-5">
                      <TimelineStep
                        label="Queued"
                        value={selectedRun.queued_at}
                      />
                      <TimelineStep
                        label="Started"
                        value={selectedRun.started_at}
                      />
                      <TimelineStep
                        label="Pipeline initialized"
                        value={selectedPipeline.initializedAt}
                      />
                      <TimelineStep
                        label="Completed"
                        value={selectedRun.completed_at}
                      />
                      <TimelineStep
                        label="Pipeline completed"
                        value={selectedPipeline.completedAt}
                      />
                      <TimelineStep
                        label="Finished"
                        value={selectedRun.finished_at}
                      />
                    </ol>
                  </section>

                  <Separator />

                  {/* Technical details */}
                  <section className="space-y-3">
                    <SectionHeading title="Technical details" />

                    <dl className="divide-y rounded-xl border text-sm">
                      <KeyValue label="Run ID" value={selectedRun.id} copy />
                      <KeyValue
                        label="Meta page ID"
                        value={
                          selectedRun.meta_page_id ||
                          selectedRun.page?.facebook_page_id
                        }
                        copy
                      />
                      <KeyValue
                        label="Internal page UUID"
                        value={selectedRun.facebook_page_id}
                        copy
                      />
                      <KeyValue
                        label="Queue job ID"
                        value={selectedRun.job_id}
                        copy
                      />
                      <KeyValue label="Queue" value={selectedRun.queue} />
                      <KeyValue
                        label="Attempts"
                        value={formatNumber(selectedRun.attempts)}
                      />
                    </dl>
                  </section>
                </div>

                {/* Footer actions */}
                <SheetFooter className="sticky bottom-0 gap-2 border-t bg-background py-4 sm:flex-row">
                  {selectedRunIsActive && (
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => handleCancel(selectedRun.id)}
                      disabled={isBusy}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cancelling…
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Cancel run
                        </>
                      )}
                    </Button>
                  )}

                  {canRetry(selectedRun.status) && (
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleRetry(selectedRun.id)}
                      disabled={isBusy}
                    >
                      {retryMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Retrying…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Retry run
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    disabled={
                      !selectedRun.page?.facebook_page_id &&
                      !selectedRun.meta_page_id
                    }
                    onClick={() => {
                      const facebookPageId =
                        selectedRun.meta_page_id ||
                        selectedRun.page?.facebook_page_id

                      if (!facebookPageId) return

                      window.open(
                        `https://www.facebook.com/${encodeURIComponent(facebookPageId)}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open on Facebook
                  </Button>
                </SheetFooter>
              </>
            ) : (
              <>
                <SheetHeader>
                  <SheetTitle>Run not found</SheetTitle>
                  <SheetDescription>
                    This run may have been removed or is no longer available to
                    your account.
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
/* Reusable UI components                                                     */
/* -------------------------------------------------------------------------- */

function StatCell({
  label,
  value,
  note,
  dot,
  danger = false,
  onClick,
  className = "",
}: {
  label: string
  value: string
  note: string
  dot?: string
  danger?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 ${className}`}
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </span>

      <span
        className={`mt-2 block text-3xl font-semibold leading-none tracking-tight tabular-nums ${
          danger ? "text-destructive" : ""
        }`}
      >
        {value}
      </span>

      <span className="mt-2 block truncate text-xs text-muted-foreground">
        {note}
      </span>
    </button>
  )
}

function FilterSelect<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string
  value: T | "all"
  options: { value: T | "all"; label: string }[]
  onChange: (value: T | "all") => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T | "all")}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`h-9 w-full bg-card sm:w-44 ${
          value !== "all" ? "border-primary/50" : ""
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusPill({ status }: { status: SyncStatus }) {
  const style = STATUS_STYLE[status]
  if (!style) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.text}`}
    >
      {status === "running" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      )}
      {style.label}
    </span>
  )
}

function AiMiniProgress({
  completed,
  failed,
  queued,
}: {
  completed: number
  failed: number
  queued: number
}) {
  if (queued === 0 && completed === 0 && failed === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const total = Math.max(queued, completed + failed)

  return (
    <div className="w-36 space-y-1">
      <SegmentedBar
        completed={completed}
        failed={failed}
        expected={total}
        className="h-1.5"
      />
      <p className="flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>
          {formatNumber(completed)} / {formatNumber(total)}
        </span>
        {failed > 0 && (
          <span className="text-destructive">{formatNumber(failed)} failed</span>
        )}
      </p>
    </div>
  )
}

function RunActions({
  run,
  busy,
  pending,
  onView,
  onRetry,
  onCancel,
}: {
  run: FacebookSyncRun
  busy: boolean
  pending: boolean
  onView: (id: string) => void
  onRetry: (id: string) => void
  onCancel: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={pending}
          aria-label={`Actions for ${run.page?.name ?? "sync run"}`}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(run.id)}>
          <Search className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>

        {isActiveStatus(run.status) && (
          <DropdownMenuItem
            disabled={busy}
            onClick={() => onCancel(run.id)}
            className="text-destructive focus:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel run
          </DropdownMenuItem>
        )}

        {canRetry(run.status) && (
          <DropdownMenuItem disabled={busy} onClick={() => onRetry(run.id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry run
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmptyState({
  filtered,
  onClear,
}: {
  filtered: boolean
  onClear: () => void
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <History className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          {filtered ? "No runs match these filters" : "No sync runs yet"}
        </p>
        <p className="text-sm text-muted-foreground">
          {filtered
            ? "Change or clear the filters to see more runs."
            : "Runs show up here once a Facebook page starts syncing."}
        </p>
      </div>

      {filtered && (
        <Button variant="outline" size="sm" onClick={onClear} className="gap-2">
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

function InlineError({
  title,
  message,
  mono = false,
  onDismiss,
  action,
}: {
  title: string
  message: string
  mono?: boolean
  onDismiss?: () => void
  action?: React.ReactNode
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p
            className={`mt-1 break-words text-sm text-muted-foreground ${
              mono ? "font-mono text-xs" : ""
            }`}
          >
            {message}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
}

function SegmentedBar({
  completed,
  failed,
  expected,
  className = "h-2",
}: {
  completed: number
  failed: number
  expected: number
  className?: string
}) {
  const total = Math.max(expected, completed + failed, 1)
  const completedPct = Math.min(100, (completed / total) * 100)
  const failedPct = Math.min(100 - completedPct, (failed / total) * 100)

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(completedPct + failedPct)}
      className={`flex overflow-hidden rounded-full bg-muted ${className}`}
    >
      <div
        className="h-full bg-primary transition-[width] duration-300"
        style={{ width: `${completedPct}%` }}
      />
      <div
        className="h-full bg-destructive transition-[width] duration-300"
        style={{ width: `${failedPct}%` }}
      />
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function PipelineRow({
  label,
  progress,
}: {
  label: string
  progress: PipelineProgress
}) {
  const { expected, completed, failed, finished, progressPercent } = progress

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{label}</span>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {expected === 0
            ? "No jobs"
            : `${formatNumber(finished)} / ${formatNumber(expected)}`}
        </span>
      </div>

      <SegmentedBar
        completed={completed}
        failed={failed}
        expected={expected}
        className="h-1.5"
      />

      {expected > 0 && (
        <p className="flex justify-between text-xs text-muted-foreground">
          <span>{progressPercent}% finished</span>
          {failed > 0 && (
            <span className="text-destructive">
              {formatNumber(failed)} failed
            </span>
          )}
        </p>
      )}
    </div>
  )
}

function ResultCard({
  title,
  total,
  totalSuffix = "fetched",
  lines,
}: {
  title: string
  total: number | null | undefined
  totalSuffix?: string
  lines: [string, number | null | undefined, boolean][]
}) {
  return (
    <div className="rounded-xl border p-3.5">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {formatNumber(total)}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          {totalSuffix}
        </span>
      </p>

      <dl className="mt-3 space-y-1 text-xs">
        {lines.map(([label, value, danger]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
              className={`font-medium tabular-nums ${
                danger && (value ?? 0) > 0 ? "text-destructive" : ""
              }`}
            >
              {formatNumber(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function TimelineStep({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  const reached = Boolean(value)

  return (
    <li className="relative">
      <span
        className={`absolute -left-[25px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 bg-background ${
          reached ? "border-primary bg-primary" : "border-muted-foreground/30"
        }`}
      />
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`text-sm ${
            reached ? "font-medium" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatDateTime(value)}
        </span>
      </div>
    </li>
  )
}

function KeyValue({
  label,
  value,
  copy = false,
}: {
  label: string
  value: string | null | undefined
  copy?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>

      <dd className="flex min-w-0 items-center gap-1.5">
        <span className="min-w-0 break-all text-right font-mono text-xs">
          {value || "—"}
        </span>

        {copy && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            aria-label={`Copy ${label}`}
            onClick={() => void handleCopy()}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </dd>
    </div>
  )
}