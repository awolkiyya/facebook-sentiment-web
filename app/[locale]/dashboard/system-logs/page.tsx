"use client"

import React, {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  X,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"



import type {
  AuditModule,
  AuditSeverity,
  AuditStatus,
  SystemLog,
  SystemLogQuery,
} from "@/types/auditLog"
import { useSystemLog, useSystemLogs } from "@/hooks/log/system-log.hook"

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function severityIcon(
  severity: AuditSeverity,
) {
  switch (severity) {
    case "INFO":
      return <Info className="size-4" />

    case "WARNING":
      return <AlertCircle className="size-4" />

    case "ERROR":
    case "CRITICAL":
      return <XCircle className="size-4" />

    default:
      return <Info className="size-4" />
  }
}

function severityBadge(
  severity: AuditSeverity,
) {
  const variants: Record<
    AuditSeverity,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    INFO: "secondary",
    WARNING: "outline",
    ERROR: "destructive",
    CRITICAL: "destructive",
  }

  return (
    <Badge
      variant={variants[severity]}
      className="gap-1"
    >
      {severityIcon(severity)}
      {severity}
    </Badge>
  )
}

function statusBadge(
  status: AuditStatus,
) {
  if (status === "SUCCESS") {
    return (
      <Badge variant="default">
        Success
      </Badge>
    )
  }

  if (status === "FAILED") {
    return (
      <Badge variant="destructive">
        Failed
      </Badge>
    )
  }

  return (
    <Badge variant="outline">
      Denied
    </Badge>
  )
}

function moduleBadge(
  module: AuditModule | null,
) {
  if (!module) {
    return (
      <Badge variant="secondary">
        Unknown
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      {module.replaceAll("_", " ")}
    </Badge>
  )
}

function formatAction(
  action: string,
) {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase(),
    )
}

function formatMetadataKey(
  key: string,
) {
  return key
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase(),
    )
}

function formatMetadataValue(
  value: unknown,
) {
  if (Array.isArray(value)) {
    return value.join(", ")
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return JSON.stringify(value)
  }

  return String(value)
}

function formatDate(
  value: string,
) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return {
      date: value,
      time: "",
    }
  }

  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
  }
}

function formatDuration(
  duration: number | null,
) {
  if (duration === null) {
    return "—"
  }

  return `${duration.toLocaleString()} ms`
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function LogsPage() {
  /* ---------------------------------------------------------------------- */
  /* Filters                                                                 */
  /* ---------------------------------------------------------------------- */

  const [search, setSearch] = useState("")

  const [severityFilter, setSeverityFilter] =
    useState<"ALL" | AuditSeverity>("ALL")

  const [moduleFilter, setModuleFilter] =
    useState<"ALL" | string>("ALL")

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | AuditStatus>("ALL")

  const [filterOpen, setFilterOpen] =
    useState(false)

  /* ---------------------------------------------------------------------- */
  /* Pagination                                                              */
  /* ---------------------------------------------------------------------- */

  const [currentPage, setCurrentPage] =
    useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  /* ---------------------------------------------------------------------- */
  /* Selected Log                                                            */
  /* ---------------------------------------------------------------------- */

  const [selectedLogId, setSelectedLogId] =
    useState<number | null>(null)

  const [dialogSection, setDialogSection] =
    useState<
      "details" | "request"
    >("details")

  /* ---------------------------------------------------------------------- */
  /* Search debounce                                                         */
  /* ---------------------------------------------------------------------- */

  const [searchInput, setSearchInput] =
    useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 400)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput])

  /* ---------------------------------------------------------------------- */
  /* Query                                                                   */
  /* ---------------------------------------------------------------------- */

  const queryParams = useMemo<SystemLogQuery>(
    () => ({
      page: currentPage,
      per_page: pageSize,

      ...(search.trim()
        ? {
            search: search.trim(),
          }
        : {}),

      ...(severityFilter !== "ALL"
        ? {
            severity: severityFilter,
          }
        : {}),

      ...(moduleFilter !== "ALL"
        ? {
            module: moduleFilter,
          }
        : {}),

      ...(statusFilter !== "ALL"
        ? {
            status: statusFilter,
          }
        : {}),

      sort_by: "created_at",
      sort_direction: "desc",
    }),
    [
      currentPage,
      pageSize,
      search,
      severityFilter,
      moduleFilter,
      statusFilter,
    ],
  )

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSystemLogs(queryParams)

  /* ---------------------------------------------------------------------- */
  /* Detail query                                                            */
  /* ---------------------------------------------------------------------- */

  const {
    data: selectedLog,
    isLoading: isLoadingSelectedLog,
  } = useSystemLog(
    selectedLogId ?? undefined,
  )

  /* ---------------------------------------------------------------------- */
  /* Server data                                                             */
  /* ---------------------------------------------------------------------- */

  const logs = data?.data ?? []

  const pagination = data?.meta.pagination

  const totalLogs =
    pagination?.total ?? 0

  const totalPages =
    pagination?.last_page ?? 1

  const startItem =
    pagination?.from ?? 0

  const endItem =
    pagination?.to ?? 0

  /* ---------------------------------------------------------------------- */
  /* Current page statistics                                                 */
  /* ---------------------------------------------------------------------- */

  const stats = useMemo(() => {
    return {
      total: totalLogs,

      success: logs.filter(
        (log) =>
          log.status === "SUCCESS",
      ).length,

      failed: logs.filter(
        (log) =>
          log.status === "FAILED",
      ).length,

      warnings: logs.filter(
        (log) =>
          log.severity === "WARNING",
      ).length,
    }
  }, [
    logs,
    totalLogs,
  ])

  /* ---------------------------------------------------------------------- */
  /* Pagination page numbers                                                 */
  /* ---------------------------------------------------------------------- */

  const pageNumbers = useMemo(() => {
    const pages: (
      | number
      | "ellipsis"
    )[] = []

    if (totalPages <= 5) {
      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pages.push(page)
      }

      return pages
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push("ellipsis")
    }

    const start = Math.max(
      2,
      currentPage - 1,
    )

    const end = Math.min(
      totalPages - 1,
      currentPage + 1,
    )

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page)
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      pages.push("ellipsis")
    }

    pages.push(totalPages)

    return pages
  }, [
    currentPage,
    totalPages,
  ])

  /* ---------------------------------------------------------------------- */
  /* Filters                                                                 */
  /* ---------------------------------------------------------------------- */

  const activeFilterCount = [
    severityFilter !== "ALL",
    moduleFilter !== "ALL",
    statusFilter !== "ALL",
  ].filter(Boolean).length

  const hasAnyFilter =
    search.trim() !== "" ||
    activeFilterCount > 0

  const clearFilters = () => {
    setSearchInput("")
    setSearch("")
    setSeverityFilter("ALL")
    setModuleFilter("ALL")
    setStatusFilter("ALL")
    setCurrentPage(1)
  }

  /* ---------------------------------------------------------------------- */
  /* Open dialogs                                                            */
  /* ---------------------------------------------------------------------- */

  const openDetails = (
    log: SystemLog,
  ) => {
    setSelectedLogId(log.id)
    setDialogSection("details")
  }

  const openRequest = (
    log: SystemLog,
  ) => {
    setSelectedLogId(log.id)
    setDialogSection("request")
  }

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    isLoading &&
    !data
  ) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Logs
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Loading system activity...
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="h-16 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-80 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ---------------------------------------------------------------------- */
  /* Error                                                                    */
  /* ---------------------------------------------------------------------- */

  if (
    isError &&
    !data
  ) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Logs
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor application audit activity.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="size-8 text-destructive" />
            </div>

            <div>
              <h2 className="font-semibold">
                Failed to load system logs
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message ??
                  "An unexpected error occurred while loading the audit logs."}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6 p-6">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Logs
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor authentication, Facebook, AI,
            user, report, and system activity.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              isFetching
                ? "animate-spin"
                : ""
            }`}
          />

          {isFetching
            ? "Refreshing..."
            : "Refresh"}
        </Button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Summary                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <Activity className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Logs
              </p>

              <p className="text-2xl font-semibold">
                {stats.total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <CheckCircle2 className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Successful
              </p>

              <p className="text-2xl font-semibold">
                {stats.success.toLocaleString()}
              </p>

              <p className="text-xs text-muted-foreground">
                Current page
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <XCircle className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Failed
              </p>

              <p className="text-2xl font-semibold">
                {stats.failed.toLocaleString()}
              </p>

              <p className="text-xs text-muted-foreground">
                Current page
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3">
              <ShieldAlert className="size-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Warnings
              </p>

              <p className="text-2xl font-semibold">
                {stats.warnings.toLocaleString()}
              </p>

              <p className="text-xs text-muted-foreground">
                Current page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Toolbar                                                          */}
      {/* ---------------------------------------------------------------- */}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search logs, actions, users, request IDs..."
                className="pl-9"
              />
            </div>

            {/* Filter */}

            <Sheet
              open={filterOpen}
              onOpenChange={setFilterOpen}
            >
              <Button
                variant="outline"
                onClick={() =>
                  setFilterOpen(true)
                }
                className="w-full lg:w-auto"
              >
                <Filter className="mr-2 size-4" />

                Filters

                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-full px-2"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <SheetContent
                side="right"
                className="flex w-full flex-col sm:max-w-md"
              >
                <SheetHeader>
                  <SheetTitle>
                    Filter Logs
                  </SheetTitle>

                  <SheetDescription>
                    Narrow the audit log by
                    severity, module, or
                    status.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
                  {/* Severity */}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Severity
                    </label>

                    <Select
                      value={
                        severityFilter
                      }
                      onValueChange={(
                        value,
                      ) => {
                        setSeverityFilter(
                          value as
                            | "ALL"
                            | AuditSeverity,
                        )

                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">
                          All Severities
                        </SelectItem>

                        <SelectItem value="INFO">
                          Info
                        </SelectItem>

                        <SelectItem value="WARNING">
                          Warning
                        </SelectItem>

                        <SelectItem value="ERROR">
                          Error
                        </SelectItem>

                        <SelectItem value="CRITICAL">
                          Critical
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module */}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Module
                    </label>

                    <Select
                      value={
                        moduleFilter
                      }
                      onValueChange={(
                        value,
                      ) => {
                        setModuleFilter(
                          value,
                        )

                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">
                          All Modules
                        </SelectItem>

                        <SelectItem value="AUTHENTICATION">
                          Authentication
                        </SelectItem>

                        <SelectItem value="USERS">
                          Users
                        </SelectItem>

                        <SelectItem value="ROLES">
                          Roles
                        </SelectItem>

                        <SelectItem value="PERMISSIONS">
                          Permissions
                        </SelectItem>

                        <SelectItem value="SECURITY">
                          Security
                        </SelectItem>

                        <SelectItem value="FACEBOOK">
                          Facebook
                        </SelectItem>

                        <SelectItem value="FACEBOOK_PAGES">
                          Facebook Pages
                        </SelectItem>

                        <SelectItem value="FACEBOOK_POSTS">
                          Facebook Posts
                        </SelectItem>

                        <SelectItem value="FACEBOOK_COMMENTS">
                          Facebook Comments
                        </SelectItem>

                        <SelectItem value="FACEBOOK_REACTIONS">
                          Facebook Reactions
                        </SelectItem>

                        <SelectItem value="FACEBOOK_INSIGHTS">
                          Facebook Insights
                        </SelectItem>

                        <SelectItem value="AI">
                          AI
                        </SelectItem>

                        <SelectItem value="SENTIMENT">
                          Sentiment
                        </SelectItem>

                        <SelectItem value="REPORTS">
                          Reports
                        </SelectItem>

                        <SelectItem value="API">
                          API
                        </SelectItem>

                        <SelectItem value="SYSTEM">
                          System
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Status
                    </label>

                    <Select
                      value={
                        statusFilter
                      }
                      onValueChange={(
                        value,
                      ) => {
                        setStatusFilter(
                          value as
                            | "ALL"
                            | AuditStatus,
                        )

                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">
                          All Statuses
                        </SelectItem>

                        <SelectItem value="SUCCESS">
                          Success
                        </SelectItem>

                        <SelectItem value="FAILED">
                          Failed
                        </SelectItem>

                        <SelectItem value="DENIED">
                          Denied
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Filters */}

                  {activeFilterCount > 0 && (
                    <div className="space-y-3 border-t pt-6">
                      <p className="text-sm font-medium">
                        Active Filters
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {severityFilter !==
                          "ALL" && (
                          <Badge variant="secondary">
                            Severity:{" "}
                            {
                              severityFilter
                            }
                          </Badge>
                        )}

                        {moduleFilter !==
                          "ALL" && (
                          <Badge variant="secondary">
                            Module:{" "}
                            {moduleFilter.replaceAll(
                              "_",
                              " ",
                            )}
                          </Badge>
                        )}

                        {statusFilter !==
                          "ALL" && (
                          <Badge variant="secondary">
                            Status:{" "}
                            {
                              statusFilter
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <SheetFooter className="border-t">
                  <Button
                    variant="outline"
                    onClick={
                      clearFilters
                    }
                    disabled={
                      activeFilterCount ===
                      0
                    }
                  >
                    Clear Filters
                  </Button>

                  <Button
                    onClick={() =>
                      setFilterOpen(
                        false,
                      )
                    }
                  >
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Clear */}

            {hasAnyFilter && (
              <Button
                variant="ghost"
                onClick={
                  clearFilters
                }
                className="w-full lg:w-auto"
              >
                <X className="mr-2 size-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active filter summary */}

          {hasAnyFilter && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">
                Active:
              </span>

              {search.trim() && (
                <Badge variant="outline">
                  Search: "{search.trim()}"
                </Badge>
              )}

              {severityFilter !==
                "ALL" && (
                <Badge variant="outline">
                  Severity:{" "}
                  {severityFilter}
                </Badge>
              )}

              {moduleFilter !==
                "ALL" && (
                <Badge variant="outline">
                  Module:{" "}
                  {moduleFilter.replaceAll(
                    "_",
                    " ",
                  )}
                </Badge>
              )}

              {statusFilter !==
                "ALL" && (
                <Badge variant="outline">
                  Status:{" "}
                  {statusFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Results                                                          */}
      {/* ---------------------------------------------------------------- */}

      <Card>
        <CardContent className="p-0">
          {/* Table Header */}

          <div className="flex flex-col gap-1 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Activity Logs
              </h2>

              <p className="text-sm text-muted-foreground">
                {totalLogs.toLocaleString()}{" "}
                {totalLogs === 1
                  ? "activity"
                  : "activities"}{" "}
                found
              </p>
            </div>

            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="size-3 animate-spin" />
                Updating...
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">
                    Timestamp
                  </TableHead>

                  <TableHead>
                    Severity
                  </TableHead>

                  <TableHead>
                    Module
                  </TableHead>

                  <TableHead>
                    Action
                  </TableHead>

                  <TableHead>
                    User
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Duration
                  </TableHead>

                  <TableHead className="pr-6 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-40 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="size-6 text-muted-foreground" />

                        <p className="font-medium">
                          No logs found
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Try changing your
                          search or filters.
                        </p>

                        {hasAnyFilter && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={
                              clearFilters
                            }
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const formattedDate =
                      formatDate(
                        log.created_at,
                      )

                    return (
                      <TableRow
                        key={log.id}
                      >
                        {/* Timestamp */}

                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Clock3 className="size-4 text-muted-foreground" />

                            <div>
                              <p className="font-medium">
                                {
                                  formattedDate.date
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {
                                  formattedDate.time
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Severity */}

                        <TableCell>
                          {severityBadge(
                            log.severity,
                          )}
                        </TableCell>

                        {/* Module */}

                        <TableCell>
                          {moduleBadge(
                            log.module,
                          )}
                        </TableCell>

                        {/* Action */}

                        <TableCell>
                          <div className="max-w-[280px]">
                            <p className="font-medium">
                              {formatAction(
                                log.action,
                              )}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {log.description ??
                                "No description available."}
                            </p>
                          </div>
                        </TableCell>

                        {/* User */}

                        <TableCell>
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <User className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {
                                    log
                                      .user
                                      .name
                                  }
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {
                                    log
                                      .user
                                      .email
                                  }
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              System
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}

                        <TableCell>
                          {statusBadge(
                            log.status,
                          )}
                        </TableCell>

                        {/* Duration */}

                        <TableCell>
                          <span className="text-sm">
                            {formatDuration(
                              log.duration_ms,
                            )}
                          </span>
                        </TableCell>

                        {/* Actions */}

                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for log ${log.id}`}
                              >
                                <ChevronDown className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  openDetails(
                                    log,
                                  )
                                }
                              >
                                <Eye className="mr-2 size-4" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  openRequest(
                                    log,
                                  )
                                }
                              >
                                <FileText className="mr-2 size-4" />
                                View Request
                              </DropdownMenuItem>
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

          {/* ---------------------------------------------------------------- */}
          {/* Pagination Footer                                                */}
          {/* ---------------------------------------------------------------- */}

          <div className="flex flex-col gap-4 border-t px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Result count */}

            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startItem}
                {endItem > startItem &&
                  `–${endItem}`}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {totalLogs.toLocaleString()}
              </span>{" "}
              {totalLogs === 1
                ? "log"
                : "logs"}
            </div>

            {/* Pagination Controls */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Rows Per Page */}

              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm text-muted-foreground">
                  Rows per page
                </span>

                <Select
                  value={String(
                    pageSize,
                  )}
                  onValueChange={(
                    value,
                  ) => {
                    setPageSize(
                      Number(value),
                    )

                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="10">
                      10
                    </SelectItem>

                    <SelectItem value="20">
                      20
                    </SelectItem>

                    <SelectItem value="50">
                      50
                    </SelectItem>

                    <SelectItem value="100">
                      100
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Navigation */}

              <div className="flex items-center gap-1">
                {/* Previous */}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                  disabled={
                    currentPage ===
                      1 ||
                    isFetching
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {/* Page Numbers */}

                {pageNumbers.map(
                  (
                    page,
                    index,
                  ) =>
                    page ===
                    "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex size-9 items-center justify-center text-sm text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={
                          currentPage ===
                          page
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() =>
                          setCurrentPage(
                            page,
                          )
                        }
                        disabled={
                          isFetching
                        }
                        aria-label={`Go to page ${page}`}
                        aria-current={
                          currentPage ===
                          page
                            ? "page"
                            : undefined
                        }
                      >
                        {page}
                      </Button>
                    ),
                )}

                {/* Next */}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  disabled={
                    currentPage ===
                      totalPages ||
                    logs.length === 0 ||
                    isFetching
                  }
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Session Information */}

          <div className="border-t px-6 py-3 text-xs text-muted-foreground">
            Audit activity retrieved from the
            application audit log.
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Log Details Dialog                                                */}
      {/* ---------------------------------------------------------------- */}

      <Dialog
        open={
          selectedLogId !== null
        }
        onOpenChange={(
          open,
        ) => {
          if (!open) {
            setSelectedLogId(null)
            setDialogSection(
              "details",
            )
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {isLoadingSelectedLog ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Loading Log
                </DialogTitle>

                <DialogDescription>
                  Loading the selected audit log.
                </DialogDescription>
              </DialogHeader>

              <div className="h-80 animate-pulse rounded-lg bg-muted" />
            </>
          ) : selectedLog ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Activity className="size-5" />

                  <DialogTitle>
                    {dialogSection ===
                    "request"
                      ? "Request Details"
                      : "Log Details"}
                  </DialogTitle>
                </div>

                <DialogDescription>
                  {dialogSection ===
                  "request"
                    ? "Technical request information associated with this activity."
                    : "Detailed information about this system activity."}
                </DialogDescription>
              </DialogHeader>

              {/* Dialog Navigation */}

              <div className="flex gap-2 border-b pb-3">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    dialogSection ===
                    "details"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setDialogSection(
                      "details",
                    )
                  }
                >
                  <Eye className="mr-2 size-4" />
                  Activity
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    dialogSection ===
                    "request"
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    setDialogSection(
                      "request",
                    )
                  }
                >
                  <FileText className="mr-2 size-4" />
                  Request
                </Button>
              </div>

              {/* -------------------------------------------------------- */}
              {/* Activity Details                                         */}
              {/* -------------------------------------------------------- */}

              {dialogSection ===
                "details" && (
                <div className="space-y-6">
                  {/* Summary */}

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Action
                        </p>

                        <h3 className="text-lg font-semibold">
                          {formatAction(
                            selectedLog.action,
                          )}
                        </h3>

                        <p className="text-sm leading-6 text-muted-foreground">
                          {selectedLog.description ??
                            "No description available."}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {severityBadge(
                          selectedLog.severity,
                        )}

                        {statusBadge(
                          selectedLog.status,
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity Information */}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      Activity Information
                    </h3>

                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Log ID
                        </p>

                        <p className="mt-1 font-mono text-sm">
                          {selectedLog.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Module
                        </p>

                        <div className="mt-1">
                          {moduleBadge(
                            selectedLog.module,
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Action
                        </p>

                        <p className="mt-1 text-sm">
                          {formatAction(
                            selectedLog.action,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Severity
                        </p>

                        <div className="mt-1">
                          {severityBadge(
                            selectedLog.severity,
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Status
                        </p>

                        <div className="mt-1">
                          {statusBadge(
                            selectedLog.status,
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Timestamp
                        </p>

                        <p className="mt-1 text-sm">
                          {formatDate(
                            selectedLog.created_at,
                          ).date}{" "}
                          {formatDate(
                            selectedLog.created_at,
                          ).time}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>

                        <p className="mt-1 text-sm">
                          {formatDuration(
                            selectedLog.duration_ms,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User */}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      User
                    </h3>

                    {selectedLog.user ? (
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="size-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium">
                              {
                                selectedLog
                                  .user
                                  .name
                              }
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {
                                selectedLog
                                  .user
                                  .email
                              }
                            </p>

                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              {
                                selectedLog
                                  .user
                                  .id
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                          This action was
                          performed by the
                          system or no
                          authenticated user
                          was associated with
                          the event.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resource */}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      Resource
                    </h3>

                    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Resource Type
                        </p>

                        <p className="mt-1 text-sm">
                          {
                            selectedLog.resource_type ??
                            "—"
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Resource ID
                        </p>

                        <p className="mt-1 break-all font-mono text-sm">
                          {
                            selectedLog.resource_id ??
                            "—"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Old Values */}

                  {selectedLog.old_values && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">
                        Previous Values
                      </h3>

                      <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/30 p-4 text-xs">
                        {JSON.stringify(
                          selectedLog.old_values,
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  )}

                  {/* New Values */}

                  {selectedLog.new_values && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">
                        New Values
                      </h3>

                      <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/30 p-4 text-xs">
                        {JSON.stringify(
                          selectedLog.new_values,
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  )}

                  {/* Metadata */}

                  {selectedLog.metadata &&
                    Object.keys(
                      selectedLog.metadata,
                    ).length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">
                          Additional Information
                        </h3>

                        <div className="overflow-hidden rounded-lg border">
                          {Object.entries(
                            selectedLog.metadata,
                          ).map(
                            ([
                              key,
                              value,
                            ]) => (
                              <div
                                key={key}
                                className="grid gap-2 border-b p-3 last:border-b-0 sm:grid-cols-[180px_1fr]"
                              >
                                <p className="text-sm font-medium text-muted-foreground">
                                  {formatMetadataKey(
                                    key,
                                  )}
                                </p>

                                <p className="break-words text-sm">
                                  {formatMetadataValue(
                                    value,
                                  )}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* Request Details                                           */}
              {/* -------------------------------------------------------- */}

              {dialogSection ===
                "request" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      Request Information
                    </h3>

                    <div className="overflow-hidden rounded-lg border">
                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Request ID
                        </p>

                        <p className="break-all font-mono text-sm">
                          {
                            selectedLog.request_id ??
                            "—"
                          }
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          HTTP Method
                        </p>

                        <p className="font-mono text-sm">
                          {
                            selectedLog.http_method ??
                            "—"
                          }
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Endpoint
                        </p>

                        <p className="break-all font-mono text-sm">
                          {
                            selectedLog.endpoint ??
                            "—"
                          }
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          IP Address
                        </p>

                        <p className="font-mono text-sm">
                          {
                            selectedLog.ip_address ??
                            "—"
                          }
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Timestamp
                        </p>

                        <p className="text-sm">
                          {formatDate(
                            selectedLog.created_at,
                          ).date}{" "}
                          {formatDate(
                            selectedLog.created_at,
                          ).time}
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Duration
                        </p>

                        <p className="text-sm">
                          {formatDuration(
                            selectedLog.duration_ms,
                          )}
                        </p>
                      </div>

                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Status
                        </p>

                        <div>
                          {statusBadge(
                            selectedLog.status,
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2 p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          User Agent
                        </p>

                        <p className="break-words text-sm">
                          {
                            selectedLog.user_agent ??
                            "—"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Resource */}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold">
                      Request Resource
                    </h3>

                    <div className="overflow-hidden rounded-lg border">
                      <div className="grid gap-2 border-b p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Resource Type
                        </p>

                        <p className="text-sm">
                          {
                            selectedLog.resource_type ??
                            "—"
                          }
                        </p>
                      </div>

                      <div className="grid gap-2 p-4 sm:grid-cols-[180px_1fr]">
                        <p className="text-sm font-medium text-muted-foreground">
                          Resource ID
                        </p>

                        <p className="break-all font-mono text-sm">
                          {
                            selectedLog.resource_id ??
                            "—"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Metadata */}

                  {selectedLog.metadata &&
                    Object.keys(
                      selectedLog.metadata,
                    ).length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">
                          Request Metadata
                        </h3>

                        <div className="overflow-hidden rounded-lg border">
                          {Object.entries(
                            selectedLog.metadata,
                          ).map(
                            ([
                              key,
                              value,
                            ]) => (
                              <div
                                key={key}
                                className="grid gap-2 border-b p-3 last:border-b-0 sm:grid-cols-[180px_1fr]"
                              >
                                <p className="text-sm font-medium text-muted-foreground">
                                  {formatMetadataKey(
                                    key,
                                  )}
                                </p>

                                <p className="break-words font-mono text-sm">
                                  {formatMetadataValue(
                                    value,
                                  )}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  Log Not Found
                </DialogTitle>

                <DialogDescription>
                  The selected audit log could not
                  be loaded.
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LogsPage