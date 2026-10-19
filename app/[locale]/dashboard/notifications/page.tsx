"use client"

import {
  Bell,
  CheckCheck,
  FileBarChart,
  MessageSquare,
  ShieldAlert,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useMyNotifications,
} from "@/hooks/use-notifications"

import type { Notification } from "@/types/notification"

/* =========================================================
 * TYPES
 * ======================================================= */

type NotificationType =
  | "facebook"
  | "ai"
  | "security"
  | "report"
  | "system"

type UserNotification = Notification & {
  type: NotificationType
  details?: string | null
  read?: boolean
  read_at?: string | null
}

/* =========================================================
 * HELPERS
 * ======================================================= */

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "facebook":
      return <MessageSquare className="h-4 w-4" />

    case "ai":
      return <Zap className="h-4 w-4" />

    case "security":
      return <ShieldAlert className="h-4 w-4" />

    case "report":
      return <FileBarChart className="h-4 w-4" />

    default:
      return <Bell className="h-4 w-4" />
  }
}

function getNotificationTypeLabel(
  type: NotificationType,
) {
  switch (type) {
    case "facebook":
      return "Facebook"

    case "ai":
      return "AI Analytics"

    case "security":
      return "Security"

    case "report":
      return "Report"

    default:
      return "System"
  }
}




function formatNotificationTime(
  value?: string | null,
) {
  if (!value) {
    return "Recently"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const now = Date.now()
  const diff = now - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return "Just now"
  }

  if (diff < hour) {
    const minutes = Math.floor(
      diff / minute,
    )

    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`
  }

  if (diff < day) {
    const hours = Math.floor(
      diff / hour,
    )

    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`
  }

  if (diff < 2 * day) {
    return "Yesterday"
  }

  if (diff < 7 * day) {
    const days = Math.floor(
      diff / day,
    )

    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  )
}

/* =========================================================
 * NOTIFICATION ITEM
 * ======================================================= */

function NotificationItem({
  notification,
  onOpen,
  onRead,
  onDelete,
  isReading,
  isDeleting,
}: {
  notification: UserNotification
  onOpen: (
    notification: UserNotification,
  ) => void
  onRead: (id: string) => void
  onDelete: (id: string) => void
  isReading: boolean
  isDeleting: boolean
}) {
  

  const isRead =
    notification.read ??
    Boolean(notification.read_at)

  const handleOpen = () => {
    if (!isRead) {
      onRead(notification.id)
    }

    onOpen(notification)
  }

  return (
    <div
      className={[
        "group flex items-start gap-3 px-4 py-4",
        "transition-colors hover:bg-muted/40",
        !isRead
          ? "bg-primary/[0.03]"
          : "",
      ].join(" ")}
    >
      {/* =================================================
          ICON
      ================================================= */}
     <div
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
        isRead
          ? "bg-muted text-muted-foreground"
          : "bg-primary/10 text-primary",
      ].join(" ")}
    >
      {getNotificationIcon(notification.type)}
    </div>

      {/* =================================================
          CONTENT
      ================================================= */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={isReading}
        className="min-w-0 flex-1 text-left disabled:cursor-wait"
      >
        <div className="flex items-start gap-2">
          <p
            className={[
              "text-sm",
              isRead
                ? "font-medium"
                : "font-semibold",
            ].join(" ")}
          >
            {notification.title}
          </p>

          {!isRead && (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {notification.message}
        </p>

        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {formatNotificationTime(
            notification.created_at ??
              notification.published_at,
          )}
        </p>
      </button>

      {/* =================================================
          ACTIONS
      ================================================= */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!isRead && (
          <button
            type="button"
            onClick={() =>
              onRead(notification.id)
            }
            disabled={isReading}
            aria-label="Mark as read"
            title="Mark as read"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-wait disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onDelete(notification.id)
          }
          disabled={isDeleting}
          aria-label="Delete notification"
          title="Delete notification"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-wait disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* =========================================================
 * NOTIFICATION DETAIL
 * ======================================================= */

function NotificationDetail({
  notification,
  onClose,
}: {
  notification: UserNotification
  onClose: () => void
}) {


  const details =
    notification.details?.trim() ||
    notification.message

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card shadow-lg">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex shrink-0 items-start gap-3 border-b px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {getNotificationTypeLabel(
                notification.type,
              )}
            </p>

            <h2 className="mt-0.5 text-base font-semibold">
              {notification.title}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {formatNotificationTime(
                notification.created_at ??
                  notification.published_at,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {details}
          </p>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <div className="flex shrink-0 justify-end border-t bg-background px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
 * LOADING STATE
 * ======================================================= */

function NotificationsLoading() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="divide-y">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 px-4 py-4"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />

              <Skeleton className="h-3 w-full max-w-md" />

              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================
 * PAGE
 * ======================================================= */

export default function NotificationsPage() {
  /*
   * =======================================================
   * FETCH USER NOTIFICATIONS
   * =======================================================
   */

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useMyNotifications({
    page: 1,
    per_page: 50,
  })

  /*
   * =======================================================
   * MUTATIONS
   * =======================================================
   */

  const markAsReadMutation =
    useMarkNotificationAsRead()

  const markAllAsReadMutation =
    useMarkAllNotificationsAsRead()

  const deleteNotificationMutation =
    useDeleteNotification()

  /*
   * =======================================================
   * LOCAL UI STATE
   * =======================================================
   */

  const [
    selectedNotification,
    setSelectedNotification,
  ] =
    useState<UserNotification | null>(
      null,
    )

  /*
   * =======================================================
   * API DATA
   * =======================================================
   *
   * Laravel pagination normally returns:
   *
   * {
   *   data: [...]
   * }
   */

  const notifications =
    (data?.data ??
      []) as UserNotification[]

  /*
   * =======================================================
   * UNREAD COUNT
   * =======================================================
   */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !(
          notification.read ??
          Boolean(
            notification.read_at,
          )
        ),
    ).length

  /*
   * =======================================================
   * READING STATE
   * =======================================================
   */

  const readingNotificationId =
    markAsReadMutation.isPending
      ? markAsReadMutation.variables
      : undefined

  /*
   * =======================================================
   * DELETE STATE
   * =======================================================
   */

  const deletingNotificationId =
    deleteNotificationMutation.isPending
      ? deleteNotificationMutation.variables
      : undefined

  /*
   * =======================================================
   * ACTIONS
   * =======================================================
   */

  const handleMarkAsRead = (
    id: string,
  ) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    if (
      markAllAsReadMutation.isPending ||
      unreadCount === 0
    ) {
      return
    }

    markAllAsReadMutation.mutate()
  }

  const handleDelete = (
    id: string,
  ) => {
    deleteNotificationMutation.mutate(
      id,
      {
        onSuccess: () => {
          if (
            selectedNotification?.id ===
            id
          ) {
            setSelectedNotification(
              null,
            )
          }
        },
      },
    )
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Stay up to date with
              activity in your account.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={
                handleMarkAllAsRead
              }
              disabled={
                markAllAsReadMutation.isPending
              }
              className="shrink-0 text-xs text-primary hover:text-primary disabled:opacity-50"
            >
              <CheckCheck className="mr-1.5 size-3.5" />

              {markAllAsReadMutation.isPending
                ? "Marking..."
                : "Mark all as read"}
            </Button>
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {isError && (
          <Card className="border-destructive/30 shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <ShieldAlert className="size-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Unable to load
                  notifications
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Please try again
                  later.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =================================================
            LOADING
        ================================================= */}
        {isLoading ? (
          <NotificationsLoading />
        ) : (
          <section>
            <div className="overflow-hidden rounded-lg border bg-card">
              {notifications.length >
              0 ? (
                <div className="divide-y">
                  {notifications.map(
                    (
                      notification,
                    ) => (
                      <NotificationItem
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                        onOpen={
                          setSelectedNotification
                        }
                        onRead={
                          handleMarkAsRead
                        }
                        onDelete={
                          handleDelete
                        }
                        isReading={
                          readingNotificationId ===
                          notification.id
                        }
                        isDeleting={
                          deletingNotificationId ===
                          notification.id
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bell className="h-5 w-5" />
                  </div>

                  <h2 className="mt-4 text-sm font-semibold">
                    No notifications
                  </h2>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    You&apos;re all
                    caught up. New
                    activity and
                    important
                    updates will
                    appear here.
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                REFRESH INDICATOR
            ================================================= */}
            {isFetching &&
              !isLoading && (
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Updating
                  notifications...
                </p>
              )}
          </section>
        )}
      </div>

      {/* ===================================================
          DETAIL
      =================================================== */}
      {selectedNotification && (
        <NotificationDetail
          notification={
            selectedNotification
          }
          onClose={() =>
            setSelectedNotification(
              null,
            )
          }
        />
      )}
    </>
  )
}
