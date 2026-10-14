"use client"

import React, {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

import {
  useArchiveNotification,
  useCreateNotification,
  useDeleteNotification,
  useNotificationStatistics,
  useNotifications,
  usePublishNotification,
  useScheduleNotification,
  useUpdateNotification,
} from "@/hooks/use-notifications"

import type {
  Notification,
  NotificationAudienceData,
  NotificationAudienceType,
  NotificationPriority,
  NotificationType,
} from "@/types/notification"

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_PAGE_SIZE = 10

/* =========================================================
   LABEL HELPERS
========================================================= */

function getTypeLabel(
  type: NotificationType,
): string {
  const labels: Record<
    NotificationType,
    string
  > = {
    announcement: "Announcement",
    maintenance: "Maintenance",
    security: "Security",
    policy: "Policy",
    system: "System",
  }

  return labels[type]
}

function getStatusLabel(
  status: Notification["status"],
): string {
  const labels: Record<
    Notification["status"],
    string
  > = {
    published: "Published",
    scheduled: "Scheduled",
    draft: "Draft",
    archived: "Archived",
  }

  return labels[status]
}

function getAudienceLabel(
  notification: Notification,
): string {
  const { audience } = notification

  switch (audience.type) {
    case "all_users":
      return "All users"

    case "role": {
      if (
        audience.data &&
        "roles" in audience.data &&
        audience.data.roles.length > 0
      ) {
        return audience.data.roles.join(", ")
      }

      return "Selected roles"
    }

    case "selected_users":
      return "Selected users"

    default:
      return "Unknown audience"
  }
}

function getAudienceDescription(
  notification: Notification,
): string {
  const { audience } = notification

  switch (audience.type) {
    case "all_users":
      return "All active users"

    case "role": {
      if (
        audience.data &&
        "roles" in audience.data &&
        audience.data.roles.length > 0
      ) {
        return `${audience.data.roles.length} role${
          audience.data.roles.length === 1
            ? ""
            : "s"
        }`
      }

      return "Selected roles"
    }

    case "selected_users": {
      if (
        audience.data &&
        "user_ids" in audience.data &&
        audience.data.user_ids.length > 0
      ) {
        return `${audience.data.user_ids.length} selected user${
          audience.data.user_ids.length === 1
            ? ""
            : "s"
        }`
      }

      return "Selected users"
    }

    default:
      return ""
  }
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date)
}

function formatShortDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date)
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: Notification["status"]
}) {
  const config: Record<
    Notification["status"],
    {
      icon: React.ElementType
      className: string
    }
  > = {
    published: {
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400",
    },

    scheduled: {
      icon: CalendarClock,
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400",
    },

    draft: {
      icon: FileText,
      className:
        "border-border bg-muted/60 text-muted-foreground",
    },

    archived: {
      icon: Archive,
      className:
        "border-border bg-muted/60 text-muted-foreground",
    },
  }

  const item = config[status]
  const Icon = item.icon

  return (
    <Badge
      variant="outline"
      className={`h-6 gap-1 whitespace-nowrap px-2 text-[10px] font-medium ${item.className}`}
    >
      <Icon className="size-3" />
      {getStatusLabel(status)}
    </Badge>
  )
}

/* =========================================================
   PRIORITY BADGE
========================================================= */

function PriorityBadge({
  priority,
}: {
  priority: NotificationPriority
}) {
  if (priority === "normal") {
    return (
      <span className="text-[11px] text-muted-foreground">
        Normal
      </span>
    )
  }

  if (priority === "important") {
    return (
      <Badge
        variant="outline"
        className="h-6 border-amber-500/30 bg-amber-500/5 px-2 text-[10px] font-medium text-amber-700 dark:text-amber-400"
      >
        Important
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="h-6 border-destructive/30 bg-destructive/5 px-2 text-[10px] font-medium text-destructive"
    >
      <ShieldAlert className="mr-1 size-3" />
      Urgent
    </Badge>
  )
}

/* =========================================================
   TYPE ICON
========================================================= */

function TypeIcon({
  type,
}: {
  type: NotificationType
}) {
  switch (type) {
    case "maintenance":
      return (
        <CalendarClock className="size-4" />
      )

    case "security":
      return (
        <ShieldAlert className="size-4" />
      )

    case "policy":
      return (
        <FileText className="size-4" />
      )

    case "system":
      return (
        <BellIcon className="size-4" />
      )

    default:
      return (
        <Megaphone className="size-4" />
      )
  }
}

/* =========================================================
   BELL ICON
========================================================= */

function BellIcon({
  className,
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function AnnouncementsPage() {
  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [search, setSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState<
      Notification["status"] | "all"
    >("all")

  const [typeFilter, setTypeFilter] =
    useState<
      NotificationType | "all"
    >("all")

  const [priorityFilter, setPriorityFilter] =
    useState<
      NotificationPriority | "all"
    >("all")

  const [page, setPage] =
    useState(1)

  const [pageSize, setPageSize] =
    useState(DEFAULT_PAGE_SIZE)

  /* =======================================================
     SHEET STATE
  ======================================================= */

  const [createOpen, setCreateOpen] =
    useState(false)

  const [previewOpen, setPreviewOpen] =
    useState(false)

  const [
    scheduleOpen,
    setScheduleOpen,
  ] = useState(false)

  const [
    editingNotification,
    setEditingNotification,
  ] = useState<Notification | null>(
    null,
  )

  const [
    previewNotification,
    setPreviewNotification,
  ] = useState<Notification | null>(
    null,
  )

  const [
    schedulingNotification,
    setSchedulingNotification,
  ] = useState<Notification | null>(
    null,
  )

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    title,
    setTitle,
  ] = useState("")

  const [
    message,
    setMessage,
  ] = useState("")

  const [
    type,
    setType,
  ] = useState<NotificationType>(
    "announcement",
  )

  const [
    priority,
    setPriority,
  ] = useState<NotificationPriority>(
    "normal",
  )

  const [
    audienceType,
    setAudienceType,
  ] = useState<NotificationAudienceType>(
    "all_users",
  )

  const [
    audienceValues,
    setAudienceValues,
  ] = useState("")

  const [
    expiresAt,
    setExpiresAt,
  ] = useState("")

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState("")

  /* =======================================================
     API
  ======================================================= */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useNotifications({
    search,
    status: statusFilter,
    type: typeFilter,
    priority: priorityFilter,
    page,
    per_page: pageSize,
  })

  const {
    data: statistics,
  } =
    useNotificationStatistics()

  const createMutation =
    useCreateNotification()

  const updateMutation =
    useUpdateNotification()

  const publishMutation =
    usePublishNotification()

  const scheduleMutation =
    useScheduleNotification()

  const archiveMutation =
    useArchiveNotification()

  const deleteMutation =
    useDeleteNotification()

  /* =======================================================
     SERVER PAGINATION
  ======================================================= */

  const notifications =
    data?.data ?? []

  const totalItems =
    data?.meta.total ?? 0

  const totalPages =
    Math.max(
      1,
      data?.meta.last_page ?? 1,
    )

  const currentPage =
    data?.meta.current_page ?? page

  const startItem =
    data?.meta.from ?? 0

  const endItem =
    data?.meta.to ?? 0

  /* =======================================================
     FORM RESET
  ======================================================= */

  function resetForm() {
    setTitle("")
    setMessage("")
    setType("announcement")
    setPriority("normal")
    setAudienceType("all_users")
    setAudienceValues("")
    setExpiresAt("")
  }

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  function handleCreate() {
    setEditingNotification(null)
    resetForm()
    setCreateOpen(true)
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  function handleEdit(
    notification: Notification,
  ) {
    if (
      notification.status ===
        "published" ||
      notification.status ===
        "archived"
    ) {
      return
    }

    setEditingNotification(
      notification,
    )

    setTitle(notification.title)
    setMessage(notification.message)
    setType(notification.type)
    setPriority(notification.priority)

    setAudienceType(
      notification.audience.type,
    )

    if (
      notification.audience.type ===
        "role" &&
      notification.audience.data &&
      "roles" in
        notification.audience.data
    ) {
      setAudienceValues(
        notification.audience.data.roles.join(
          ", ",
        ),
      )
    } else if (
      notification.audience.type ===
        "selected_users" &&
      notification.audience.data &&
      "user_ids" in
        notification.audience.data
    ) {
      setAudienceValues(
        notification.audience.data.user_ids.join(
          ", ",
        ),
      )
    } else {
      setAudienceValues("")
    }

    setExpiresAt(
      notification.expires_at
        ? notification.expires_at.slice(
            0,
            16,
          )
        : "",
    )

    setCreateOpen(true)
  }

  /* =======================================================
     OPEN PREVIEW
  ======================================================= */

  function handlePreview(
    notification: Notification,
  ) {
    setPreviewNotification(
      notification,
    )

    setPreviewOpen(true)
  }

  /* =======================================================
     AUDIENCE DATA
  ======================================================= */

  function buildAudienceData():
    NotificationAudienceData {
    const values =
      audienceValues
        .split(",")
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean)

    if (
      audienceType ===
      "all_users"
    ) {
      return null
    }

    if (
      audienceType ===
      "role"
    ) {
      return {
        roles: values,
      }
    }

    return {
      user_ids: values,
    }
  }

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !title.trim() ||
      !message.trim()
    ) {
      return
    }

    const audienceData =
      buildAudienceData()

    const payload = {
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      audience_type:
        audienceType,
      audience_data:
        audienceData,
      expires_at:
        expiresAt
          ? new Date(
              expiresAt,
            ).toISOString()
          : null,
    }

    try {
      if (editingNotification) {
        await updateMutation.mutateAsync(
          {
            id: editingNotification.id,
            payload,
          },
        )
      } else {
        await createMutation.mutateAsync(
          payload,
        )
      }

      setCreateOpen(false)
      setEditingNotification(null)
      resetForm()
    } catch {
      // Mutation error is displayed below.
    }
  }

  /* =======================================================
     PUBLISH
  ======================================================= */

  async function handlePublish(
    notification: Notification,
  ) {
    const confirmed =
      window.confirm(
        `Publish "${notification.title}" now?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await publishMutation.mutateAsync(
        notification.id,
      )
    } catch {
      // Mutation error handled by mutation state.
    }
  }

  /* =======================================================
     OPEN SCHEDULE
  ======================================================= */

  function handleOpenSchedule(
    notification: Notification,
  ) {
    setSchedulingNotification(
      notification,
    )

    setScheduledAt(
      notification.scheduled_at
        ? notification.scheduled_at.slice(
            0,
            16,
          )
        : "",
    )

    setScheduleOpen(true)
  }

  /* =======================================================
     SCHEDULE
  ======================================================= */

  async function handleSchedule(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !schedulingNotification ||
      !scheduledAt
    ) {
      return
    }

    try {
      await scheduleMutation.mutateAsync(
        {
          id: schedulingNotification.id,
          payload: {
            scheduled_at:
              new Date(
                scheduledAt,
              ).toISOString(),
          },
        },
      )

      setScheduleOpen(false)
      setSchedulingNotification(null)
      setScheduledAt("")
    } catch {
      // Mutation error handled by mutation state.
    }
  }

  /* =======================================================
     ARCHIVE
  ======================================================= */

  async function handleArchive(
    notification: Notification,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${notification.title}"?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await archiveMutation.mutateAsync(
        notification.id,
      )
    } catch {
      // Mutation error handled by mutation state.
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(
    notification: Notification,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${notification.title}"? This action cannot be undone.`,
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(
        notification.id,
      )
    } catch {
      // Mutation error handled by mutation state.
    }
  }

  /* =======================================================
     FILTER HANDLERS
  ======================================================= */

  function handleSearch(
    value: string,
  ) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(
    value: string,
  ) {
    setStatusFilter(
      value as
        | Notification["status"]
        | "all",
    )
    setPage(1)
  }

  function handleTypeChange(
    value: string,
  ) {
    setTypeFilter(
      value as
        | NotificationType
        | "all",
    )
    setPage(1)
  }

  function handlePriorityChange(
    value: string,
  ) {
    setPriorityFilter(
      value as
        | NotificationPriority
        | "all",
    )
    setPage(1)
  }

  function handlePageSizeChange(
    value: string,
  ) {
    setPageSize(
      Number(value),
    )
    setPage(1)
  }

  /* =======================================================
     MUTATION STATE
  ======================================================= */

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  const isPublishing =
    publishMutation.isPending

  const isScheduling =
    scheduleMutation.isPending

  const isArchiving =
    archiveMutation.isPending

  const isDeleting =
    deleteMutation.isPending

  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    publishMutation.error ||
    scheduleMutation.error ||
    archiveMutation.error ||
    deleteMutation.error

  /* =======================================================
     FORM AUDIENCE HELPER
  ======================================================= */

  const audienceInputLabel =
    useMemo(() => {
      if (
        audienceType ===
        "role"
      ) {
        return "Role names"
      }

      if (
        audienceType ===
        "selected_users"
      ) {
        return "User IDs"
      }

      return ""
    }, [audienceType])

  /* =======================================================
     RESET EDIT STATE WHEN SHEET CLOSES
  ======================================================= */

  useEffect(() => {
    if (!createOpen) {
      setEditingNotification(null)
    }
  }, [createOpen])

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full space-y-5 p-4 sm:p-6 lg:p-7 max-w-5xl m-auto">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Megaphone className="size-3.5" />
            Administration
            <span className="text-border">/</span>
            Communications
          </div>

          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Announcements
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
            Create and manage messages published
            to system users.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          size="sm"
          className="h-9 w-full shrink-0 px-3.5 sm:w-auto"
        >
          <Plus className="mr-1.5 size-4" />
          Create announcement
        </Button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      {statistics && (
        <Card className="overflow-hidden rounded-lg border shadow-none">
          <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-background px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Total
                </p>

                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              </div>

              <p className="mt-1.5 text-lg font-semibold tracking-tight">
                {statistics.total}
              </p>
            </div>

            <div className="bg-background px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Published
                </p>

                <span className="size-1.5 rounded-full bg-emerald-500" />
              </div>

              <p className="mt-1.5 text-lg font-semibold tracking-tight">
                {statistics.published}
              </p>
            </div>

            <div className="bg-background px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Scheduled
                </p>

                <span className="size-1.5 rounded-full bg-blue-500" />
              </div>

              <p className="mt-1.5 text-lg font-semibold tracking-tight">
                {statistics.scheduled}
              </p>
            </div>

            <div className="bg-background px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Drafts
                </p>

                <span className="size-1.5 rounded-full bg-muted-foreground/50" />
              </div>

              <p className="mt-1.5 text-lg font-semibold tracking-tight">
                {statistics.drafts}
              </p>
            </div>

            <div className="bg-background px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Archived
                </p>

                <span className="size-1.5 rounded-full bg-muted-foreground/30" />
              </div>

              <p className="mt-1.5 text-lg font-semibold tracking-tight">
                {statistics.archived}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {(isError || mutationError) && (
        <Alert
          variant="destructive"
          className="rounded-lg py-2.5"
        >
          <XCircle className="size-4" />

          <AlertDescription className="text-xs">
            {mutationError
              ? mutationError instanceof Error
                ? mutationError.message
                : "The requested operation could not be completed."
              : "Unable to load announcements. Please refresh the page and try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* =====================================================
          MAIN TABLE
      ===================================================== */}

      <Card className="overflow-hidden rounded-lg border shadow-none">
        <CardHeader className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                All announcements
              </CardTitle>

              <CardDescription className="mt-0.5 text-xs">
                Manage announcements, audiences, and publication lifecycle.
              </CardDescription>
            </div>

            {isFetching &&
              !isLoading && (
                <div
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  aria-live="polite"
                >
                  <Loader2 className="size-3 animate-spin" />
                  Updating
                </div>
              )}
          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  handleSearch(
                    event.target.value,
                  )
                }
                placeholder="Search announcements..."
                className="h-9 border-muted-foreground/20 bg-background pl-8 text-xs shadow-none focus-visible:ring-1"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={
                handleStatusChange
              }
            >
              <SelectTrigger className="h-9 w-full text-xs shadow-none lg:w-[145px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                <SelectItem value="published">
                  Published
                </SelectItem>

                <SelectItem value="scheduled">
                  Scheduled
                </SelectItem>

                <SelectItem value="draft">
                  Draft
                </SelectItem>

                <SelectItem value="archived">
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={
                handleTypeChange
              }
            >
              <SelectTrigger className="h-9 w-full text-xs shadow-none lg:w-[145px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All types
                </SelectItem>

                <SelectItem value="announcement">
                  Announcement
                </SelectItem>

                <SelectItem value="maintenance">
                  Maintenance
                </SelectItem>

                <SelectItem value="security">
                  Security
                </SelectItem>

                <SelectItem value="policy">
                  Policy
                </SelectItem>

                <SelectItem value="system">
                  System
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={
                handlePriorityChange
              }
            >
              <SelectTrigger className="h-9 w-full text-xs shadow-none lg:w-[145px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All priorities
                </SelectItem>

                <SelectItem value="normal">
                  Normal
                </SelectItem>

                <SelectItem value="important">
                  Important
                </SelectItem>

                <SelectItem value="urgent">
                  Urgent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-10 px-5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Announcement
                  </th>

                  <th className="h-10 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>

                  <th className="h-10 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Priority
                  </th>

                  <th className="h-10 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="h-10 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Audience
                  </th>

                  <th className="h-10 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>

                  <th className="h-10 w-[56px] px-3" />
                </tr>
              </thead>

              <tbody className="divide-y">
                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoading &&
                  Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <tr
                      key={`loading-${index}`}
                      className="h-[68px]"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 shrink-0 animate-pulse rounded-md bg-muted" />

                          <div className="min-w-0 space-y-2">
                            <div className="h-3 w-48 animate-pulse rounded bg-muted" />

                            <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                          </div>
                        </div>
                      </td>

                      <td className="px-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      </td>

                      <td className="px-3">
                        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                      </td>

                      <td className="px-3">
                        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                      </td>

                      <td className="px-3">
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </td>

                      <td className="px-3">
                        <div className="space-y-1.5">
                          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </td>

                      <td className="px-3">
                        <div className="ml-auto size-8 animate-pulse rounded-md bg-muted" />
                      </td>
                    </tr>
                  ))}

                {/* =================================================
                    DATA
                ================================================= */}

                {!isLoading &&
                  notifications.map(
                    (
                      notification,
                    ) => (
                      <tr
                        key={
                          notification.id
                        }
                        className="group h-[68px] transition-colors hover:bg-muted/25"
                      >
                        <td className="px-5 py-3">
                          <div className="flex min-w-[300px] items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                              <TypeIcon
                                type={
                                  notification.type
                                }
                              />
                            </div>

                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handlePreview(
                                    notification,
                                  )
                                }
                                title={
                                  notification.title
                                }
                                className="block max-w-[350px] truncate text-left text-xs font-semibold tracking-tight hover:text-primary hover:underline"
                              >
                                {
                                  notification.title
                                }
                              </button>

                              <p
                                title={
                                  notification.id
                                }
                                className="mt-0.5 max-w-[300px] truncate font-mono text-[10px] text-muted-foreground"
                              >
                                {
                                  notification.id
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                            <TypeIcon
                              type={
                                notification.type
                              }
                            />

                            <span>
                              {getTypeLabel(
                                notification.type,
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <PriorityBadge
                            priority={
                              notification.priority
                            }
                          />
                        </td>

                        <td className="px-3 py-3">
                          <StatusBadge
                            status={
                              notification.status
                            }
                          />
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex max-w-[190px] items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50">
                              <Users className="size-3.5 text-muted-foreground" />
                            </div>

                            <div className="min-w-0">
                              <p
                                title={getAudienceLabel(
                                  notification,
                                )}
                                className="truncate text-xs font-medium"
                              >
                                {getAudienceLabel(
                                  notification,
                                )}
                              </p>

                              <p className="text-[10px] text-muted-foreground">
                                {notification.recipient_count ??
                                  0}{" "}
                                recipients
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="whitespace-nowrap">
                            <p className="text-xs font-medium">
                              {notification.status ===
                              "scheduled"
                                ? formatDate(
                                    notification.scheduled_at,
                                  )
                                : formatShortDate(
                                    notification.created_at,
                                  )}
                            </p>

                            {notification.status ===
                              "published" &&
                              notification.published_at && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  Published{" "}
                                  {formatDate(
                                    notification.published_at,
                                  )}
                                </p>
                              )}

                            {notification.status ===
                              "scheduled" &&
                              notification.scheduled_at && (
                                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock3 className="size-2.5" />
                                  Scheduled
                                </p>
                              )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground opacity-70 transition-opacity hover:text-foreground group-hover:opacity-100"
                              >
                                <MoreHorizontal className="size-4" />

                                <span className="sr-only">
                                  Open actions
                                </span>
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-44"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePreview(
                                    notification,
                                  )
                                }
                              >
                                <Eye className="mr-2 size-3.5" />
                                View details
                              </DropdownMenuItem>

                              {(notification.status ===
                                "draft" ||
                                notification.status ===
                                  "scheduled") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEdit(
                                      notification,
                                    )
                                  }
                                >
                                  <Pencil className="mr-2 size-3.5" />
                                  Edit
                                </DropdownMenuItem>
                              )}

                              {notification.status ===
                                "draft" && (
                                <DropdownMenuItem
                                  disabled={
                                    isPublishing
                                  }
                                  onClick={() =>
                                    handlePublish(
                                      notification,
                                    )
                                  }
                                >
                                  {isPublishing ? (
                                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 size-3.5" />
                                  )}

                                  Publish
                                </DropdownMenuItem>
                              )}

                              {(notification.status ===
                                "draft" ||
                                notification.status ===
                                  "scheduled") && (
                                <DropdownMenuItem
                                  disabled={
                                    isScheduling
                                  }
                                  onClick={() =>
                                    handleOpenSchedule(
                                      notification,
                                    )
                                  }
                                >
                                  <CalendarClock className="mr-2 size-3.5" />

                                  {notification.status ===
                                  "scheduled"
                                    ? "Reschedule"
                                    : "Schedule"}
                                </DropdownMenuItem>
                              )}

                              {notification.status ===
                                "published" && (
                                <DropdownMenuItem
                                  disabled={
                                    isArchiving
                                  }
                                  onClick={() =>
                                    handleArchive(
                                      notification,
                                    )
                                  }
                                >
                                  <Archive className="mr-2 size-3.5" />
                                  Archive
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                disabled={
                                  isDeleting
                                }
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  handleDelete(
                                    notification,
                                  )
                                }
                              >
                                <Trash2 className="mr-2 size-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!isLoading &&
            notifications.length ===
              0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center border-t px-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/30">
                  <Megaphone className="size-4 text-muted-foreground" />
                </div>

                <h3 className="mt-3 text-sm font-semibold">
                  No announcements found
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Try changing your filters or create
                  a new announcement.
                </p>

                {!search &&
                  statusFilter ===
                    "all" &&
                  typeFilter ===
                    "all" &&
                  priorityFilter ===
                    "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 h-8 text-xs"
                      onClick={
                        handleCreate
                      }
                    >
                      <Plus className="mr-1.5 size-3.5" />
                      Create announcement
                    </Button>
                  )}
              </div>
            )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startItem}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {endItem}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalItems}
                </span>
              </span>

              <Separator
                orientation="vertical"
                className="hidden h-4 sm:block"
              />

              <div className="hidden items-center gap-1.5 sm:flex">
                <span>
                  Rows
                </span>

                <Select
                  value={String(
                    pageSize,
                  )}
                  onValueChange={
                    handlePageSizeChange
                  }
                >
                  <SelectTrigger className="h-7 w-[58px] text-[11px] shadow-none">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="5">
                      5
                    </SelectItem>

                    <SelectItem value="10">
                      10
                    </SelectItem>

                    <SelectItem value="25">
                      25
                    </SelectItem>

                    <SelectItem value="50">
                      50
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-[11px] text-muted-foreground">
                Page{" "}
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={
                    currentPage <=
                      1 ||
                    isFetching
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                >
                  <ChevronLeft className="size-3.5" />

                  <span className="sr-only">
                    Previous page
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={
                    currentPage >=
                      totalPages ||
                    isFetching
                  }
                  onClick={() =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.min(
                          totalPages,
                          current +
                            1,
                        ),
                    )
                  }
                >
                  <ChevronRight className="size-3.5" />

                  <span className="sr-only">
                    Next page
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          CREATE / EDIT SHEET
      ===================================================== */}

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)

          if (!open) {
            setEditingNotification(null)
            resetForm()
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden p-0 sm:max-w-[480px]"
        >
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="shrink-0 border-b px-5 py-4 text-left">
              <SheetTitle className="text-base">
                {editingNotification
                  ? "Edit announcement"
                  : "Create announcement"}
              </SheetTitle>

              <SheetDescription className="text-xs leading-5">
                {editingNotification
                  ? "Update this draft or scheduled announcement."
                  : "Create a message for system users. New announcements are saved as drafts."}
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleSave}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {/* Title */}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notification-title"
                      className="text-xs font-medium"
                    >
                      Title
                    </Label>

                    <Input
                      id="notification-title"
                      value={title}
                      onChange={(event) =>
                        setTitle(
                          event.target.value,
                        )
                      }
                      placeholder="Announcement title"
                      maxLength={255}
                      required
                      className="h-9 text-sm"
                    />

                    <div className="flex justify-end">
                      <span className="text-[10px] text-muted-foreground">
                        {title.length}/255
                      </span>
                    </div>
                  </div>

                  {/* Message */}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notification-message"
                      className="text-xs font-medium"
                    >
                      Message
                    </Label>

                    <Textarea
                      id="notification-message"
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value,
                        )
                      }
                      placeholder="Write your announcement..."
                      className="min-h-[130px] resize-none text-sm leading-5"
                      required
                    />

                    <p className="text-[10px] text-muted-foreground">
                      Keep the message concise and clear.
                    </p>
                  </div>

                  {/* Type + Priority */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Type
                      </Label>

                      <Select
                        value={type}
                        onValueChange={(value) =>
                          setType(
                            value as NotificationType,
                          )
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="announcement">
                            Announcement
                          </SelectItem>

                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>

                          <SelectItem value="security">
                            Security
                          </SelectItem>

                          <SelectItem value="policy">
                            Policy
                          </SelectItem>

                          <SelectItem value="system">
                            System
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Priority
                      </Label>

                      <Select
                        value={priority}
                        onValueChange={(value) =>
                          setPriority(
                            value as NotificationPriority,
                          )
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="normal">
                            Normal
                          </SelectItem>

                          <SelectItem value="important">
                            Important
                          </SelectItem>

                          <SelectItem value="urgent">
                            Urgent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Audience */}

                  <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                    <div>
                      <Label className="text-xs font-medium">
                        Audience
                      </Label>

                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        Define which users should receive this announcement.
                      </p>
                    </div>

                    <Select
                      value={audienceType}
                      onValueChange={(value) =>
                        setAudienceType(
                          value as NotificationAudienceType,
                        )
                      }
                    >
                      <SelectTrigger className="h-9 bg-background text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all_users">
                          All users
                        </SelectItem>

                        <SelectItem value="role">
                          Specific roles
                        </SelectItem>

                        <SelectItem value="selected_users">
                          Selected users
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {audienceType ===
                      "role" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="notification-roles"
                          className="text-xs font-medium"
                        >
                          {
                            audienceInputLabel
                          }
                        </Label>

                        <Input
                          id="notification-roles"
                          value={
                            audienceValues
                          }
                          onChange={(
                            event,
                          ) =>
                            setAudienceValues(
                              event.target
                                .value,
                            )
                          }
                          placeholder="SYSTEM_ADMIN, MAYOR"
                          className="h-9 bg-background text-sm"
                        />

                        <p className="text-[10px] leading-4 text-muted-foreground">
                          Enter role names separated by commas.
                        </p>
                      </div>
                    )}

                    {audienceType ===
                      "selected_users" && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="notification-users"
                          className="text-xs font-medium"
                        >
                          {
                            audienceInputLabel
                          }
                        </Label>

                        <Textarea
                          id="notification-users"
                          value={
                            audienceValues
                          }
                          onChange={(
                            event,
                          ) =>
                            setAudienceValues(
                              event.target
                                .value,
                            )
                          }
                          placeholder="user-uuid-1, user-uuid-2"
                          className="min-h-[80px] resize-none bg-background text-sm"
                        />

                        <p className="text-[10px] leading-4 text-muted-foreground">
                          Enter user UUIDs separated by commas.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expiration */}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notification-expires"
                      className="text-xs font-medium"
                    >
                      Expiration
                      <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>

                    <Input
                      id="notification-expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(event) =>
                        setExpiresAt(
                          event.target.value,
                        )
                      }
                      className="h-9 text-sm"
                    />

                    <p className="text-[10px] leading-4 text-muted-foreground">
                      The announcement will no longer be active after this time.
                    </p>
                  </div>

                  {/* Information */}

                  <Alert className="rounded-lg py-3">
                    <Megaphone className="size-3.5" />

                    <AlertDescription className="text-[11px] leading-4">
                      {editingNotification
                        ? "Changes can be saved while the announcement is a draft or scheduled. Published and archived announcements are immutable."
                        : "New announcements are always saved as drafts. You can publish them immediately or schedule them for later."}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Fixed-in-layout footer */}

              <SheetFooter className="shrink-0 border-t bg-background px-5 py-3">
                <div className="flex w-full items-center justify-end gap-2">
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      className="h-9"
                    >
                      Cancel
                    </Button>
                  </SheetClose>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isSaving ||
                      !title.trim() ||
                      !message.trim()
                    }
                    className="h-9"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <FileText className="mr-1.5 size-3.5" />
                    )}

                    {editingNotification
                      ? "Save changes"
                      : "Save draft"}
                  </Button>
                </div>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* =====================================================
          SCHEDULE SHEET
      ===================================================== */}

      <Sheet
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open)

          if (!open) {
            setSchedulingNotification(
              null,
            )
            setScheduledAt("")
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden p-0 sm:max-w-[400px]"
        >
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="shrink-0 border-b px-5 py-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
                  <CalendarClock className="size-4" />
                </div>

                <div className="min-w-0">
                  <SheetTitle className="text-sm font-semibold">
                    {schedulingNotification?.status ===
                    "scheduled"
                      ? "Reschedule announcement"
                      : "Schedule announcement"}
                  </SheetTitle>

                  <SheetDescription className="mt-0.5 text-[11px] leading-4">
                    Choose when this announcement should be published.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form
              onSubmit={handleSchedule}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {schedulingNotification && (
                    <div className="rounded-lg border bg-muted/20 p-3.5">
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {
                              schedulingNotification.title
                            }
                          </p>

                          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                            {
                              schedulingNotification.id
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="scheduled-at"
                      className="text-xs font-medium"
                    >
                      Publish date and time
                    </Label>

                    <Input
                      id="scheduled-at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) =>
                        setScheduledAt(
                          event.target.value,
                        )
                      }
                      required
                      className="h-9 text-xs shadow-none"
                    />

                    <p className="text-[10px] leading-4 text-muted-foreground">
                      The scheduled time must be in the future.
                    </p>
                  </div>

                  <Alert className="rounded-lg py-2.5">
                    <Clock3 className="size-3.5" />

                    <AlertDescription className="text-[11px] leading-4">
                      The system will automatically publish this announcement when the scheduled time is reached.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <SheetFooter className="shrink-0 border-t bg-background px-5 py-3">
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      isScheduling
                    }
                    onClick={() =>
                      setScheduleOpen(
                        false,
                      )
                    }
                    className="h-9"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isScheduling ||
                      !scheduledAt
                    }
                    className="h-9"
                  >
                    {isScheduling ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <CalendarClock className="mr-1.5 size-3.5" />
                    )}

                    Schedule
                  </Button>
                </div>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* =====================================================
          PREVIEW / DETAILS SHEET
      ===================================================== */}

      <Sheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      >
        <SheetContent
          side="right"
          className="w-full overflow-hidden p-0 sm:max-w-[460px]"
        >
          {previewNotification && (
            <div className="flex h-full min-h-0 flex-col">
              {/* Header */}

              <SheetHeader className="shrink-0 border-b px-5 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
                    <TypeIcon
                      type={
                        previewNotification.type
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <SheetTitle className="truncate text-sm font-semibold">
                      {
                        previewNotification.title
                      }
                    </SheetTitle>

                    <SheetDescription className="mt-0.5 truncate font-mono text-[10px]">
                      {
                        previewNotification.id
                      }
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable body */}

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {/* Status */}

                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      status={
                        previewNotification.status
                      }
                    />

                    <PriorityBadge
                      priority={
                        previewNotification.priority
                      }
                    />

                    <Badge
                      variant="outline"
                      className="h-6 px-2 text-[10px] font-medium"
                    >
                      {getTypeLabel(
                        previewNotification.type,
                      )}
                    </Badge>
                  </div>

                  {/* Message */}

                  <div className="rounded-lg border bg-muted/15 p-4">
                    <p className="whitespace-pre-wrap text-xs leading-5 text-foreground">
                      {
                        previewNotification.message
                      }
                    </p>
                  </div>

                  {/* Details */}

                  <div className="overflow-hidden rounded-lg border">
                    {/* Audience */}

                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50">
                        <Users className="size-3.5 text-muted-foreground" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Audience
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {getAudienceLabel(
                            previewNotification,
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {getAudienceDescription(
                            previewNotification,
                          )}

                          {previewNotification.recipient_count !==
                            undefined &&
                            ` · ${previewNotification.recipient_count} recipients`}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Created */}

                    <div className="grid grid-cols-2 divide-x">
                      <div className="px-4 py-3.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Created by
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold">
                          {previewNotification
                            .creator
                            ?.name ??
                            "—"}
                        </p>
                      </div>

                      <div className="px-4 py-3.5">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Created
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {formatDate(
                            previewNotification.created_at,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Scheduled */}

                    {previewNotification.scheduled_at && (
                      <>
                        <Separator />

                        <div className="flex items-start gap-3 px-4 py-3.5">
                          <Clock3 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Scheduled for
                            </p>

                            <p className="mt-1 text-xs font-semibold">
                              {formatDate(
                                previewNotification.scheduled_at,
                              )}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Published */}

                    {previewNotification.published_at && (
                      <>
                        <Separator />

                        <div className="flex items-start gap-3 px-4 py-3.5">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Published
                            </p>

                            <p className="mt-1 text-xs font-semibold">
                              {formatDate(
                                previewNotification.published_at,
                              )}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Expiration */}

                    {previewNotification.expires_at && (
                      <>
                        <Separator />

                        <div className="px-4 py-3.5">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Expires
                          </p>

                          <p className="mt-1 text-xs font-semibold">
                            {formatDate(
                              previewNotification.expires_at,
                            )}
                          </p>

                          {previewNotification.is_expired && (
                            <p className="mt-1 text-[10px] text-destructive">
                              This announcement has expired.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}

              <SheetFooter className="shrink-0 border-t bg-background px-5 py-3">
                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPreviewOpen(
                        false,
                      )
                    }
                    className="h-9"
                  >
                    Close
                  </Button>

                  {(previewNotification.status ===
                    "draft" ||
                    previewNotification.status ===
                      "scheduled") && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPreviewOpen(
                          false,
                        )

                        handleEdit(
                          previewNotification,
                        )
                      }}
                      className="h-9"
                    >
                      <Pencil className="mr-1.5 size-3.5" />
                      Edit
                    </Button>
                  )}

                  {previewNotification.status ===
                    "draft" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPreviewOpen(
                          false,
                        )

                        handlePublish(
                          previewNotification,
                        )
                      }}
                      className="h-9"
                    >
                      <Send className="mr-1.5 size-3.5" />
                      Publish
                    </Button>
                  )}
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}