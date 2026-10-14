import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  notificationService,
} from "@/services/notification.service"

import type {
  CreateNotificationPayload,
  NotificationFilters,
  ScheduleNotificationPayload,
  UpdateNotificationPayload,
} from "@/types/notification"

/*
|--------------------------------------------------------------------------
| Query Keys
|--------------------------------------------------------------------------
*/

export const notificationKeys = {
  all: ["notifications"] as const,

  /*
  |--------------------------------------------------------------------------
  | Admin
  |--------------------------------------------------------------------------
  */

  lists: () =>
    [
      ...notificationKeys.all,
      "list",
    ] as const,

  list: (
    filters: NotificationFilters,
  ) =>
    [
      ...notificationKeys.lists(),
      filters,
    ] as const,

  details: () =>
    [
      ...notificationKeys.all,
      "detail",
    ] as const,

  detail: (
    id: string,
  ) =>
    [
      ...notificationKeys.details(),
      id,
    ] as const,

  statistics: () =>
    [
      ...notificationKeys.all,
      "statistics",
    ] as const,

  /*
  |--------------------------------------------------------------------------
  | Authenticated User
  |--------------------------------------------------------------------------
  */

  mine: () =>
    [
      ...notificationKeys.all,
      "mine",
    ] as const,

  myList: (
    filters: NotificationFilters = {},
  ) =>
    [
      ...notificationKeys.mine(),
      filters,
    ] as const,
}

/*
|--------------------------------------------------------------------------
| Admin — List
|--------------------------------------------------------------------------
*/

export function useNotifications(
  filters: NotificationFilters = {},
) {
  return useQuery({
    queryKey:
      notificationKeys.list(
        filters,
      ),

    queryFn: () =>
      notificationService.getNotifications(
        filters,
      ),

    placeholderData: (
      previousData,
    ) => previousData,

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| User — My Notifications
|--------------------------------------------------------------------------
|
| Returns only notifications applicable to the
| currently authenticated user.
|
| Examples:
|
| - Global announcements
| - Role-targeted announcements
| - Selected-user announcements
| - User-specific system notifications
|
*/

export function useMyNotifications(
  filters: NotificationFilters = {},
) {
  return useQuery({
    queryKey:
      notificationKeys.myList(
        filters,
      ),

    queryFn: () =>
      notificationService.getMyNotifications(
        filters,
      ),

    placeholderData: (
      previousData,
    ) => previousData,

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| Detail
|--------------------------------------------------------------------------
*/

export function useNotification(
  id?: string,
) {
  return useQuery({
    queryKey: id
      ? notificationKeys.detail(id)
      : notificationKeys.details(),

    queryFn: () => {
      if (!id) {
        throw new Error(
          "Notification ID is required.",
        )
      }

      return notificationService.getNotification(
        id,
      )
    },

    enabled: Boolean(id),

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

export function useNotificationStatistics() {
  return useQuery({
    queryKey:
      notificationKeys.statistics(),

    queryFn: () =>
      notificationService.getStatistics(),

    staleTime: 30_000,
  })
}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export function useCreateNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      payload: CreateNotificationPayload,
    ) =>
      notificationService.createNotification(
        payload,
      ),

    onSuccess: () => {
      /*
       * Refresh admin notification lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh admin statistics.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.statistics(),
      })

      /*
       * If the notification was created as
       * published, it may be applicable to
       * the current user.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export function useUpdateNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateNotificationPayload
    }) =>
      notificationService.updateNotification(
        id,
        payload,
      ),

    onSuccess: (
      notification,
    ) => {
      /*
       * Update cached detail.
       */
      queryClient.setQueryData(
        notificationKeys.detail(
          notification.id,
        ),
        notification,
      )

      /*
       * Refresh admin lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh current user's inbox
       * in case the notification is visible
       * to the authenticated user.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| Publish
|--------------------------------------------------------------------------
*/

export function usePublishNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string,
    ) =>
      notificationService.publishNotification(
        id,
      ),

    onSuccess: (
      notification,
    ) => {
      /*
       * Update cached detail.
       */
      queryClient.setQueryData(
        notificationKeys.detail(
          notification.id,
        ),
        notification,
      )

      /*
       * Refresh admin lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh statistics.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.statistics(),
      })

      /*
       * Publishing can make the notification
       * immediately available to users.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| Schedule
|--------------------------------------------------------------------------
*/

export function useScheduleNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ScheduleNotificationPayload
    }) =>
      notificationService.scheduleNotification(
        id,
        payload,
      ),

    onSuccess: (
      notification,
    ) => {
      /*
       * Update cached detail.
       */
      queryClient.setQueryData(
        notificationKeys.detail(
          notification.id,
        ),
        notification,
      )

      /*
       * Refresh admin lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh statistics.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.statistics(),
      })

      /*
       * Refresh user's inbox.
       *
       * The backend will determine whether the
       * notification is currently visible.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| Archive
|--------------------------------------------------------------------------
*/

export function useArchiveNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string,
    ) =>
      notificationService.archiveNotification(
        id,
      ),

    onSuccess: (
      notification,
    ) => {
      /*
       * Update cached detail.
       */
      queryClient.setQueryData(
        notificationKeys.detail(
          notification.id,
        ),
        notification,
      )

      /*
       * Refresh admin lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh statistics.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.statistics(),
      })

      /*
       * Archived notifications should no longer
       * appear in the user's active inbox.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| Admin — Delete
|--------------------------------------------------------------------------
*/

export function useDeleteNotification() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string,
    ) =>
      notificationService.deleteNotification(
        id,
      ),

    onSuccess: () => {
      /*
       * Refresh admin lists.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.lists(),
      })

      /*
       * Refresh statistics.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.statistics(),
      })

      /*
       * Refresh user's inbox.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| User — Mark Notification As Read
|--------------------------------------------------------------------------
|
| Marks one notification as read for the
| currently authenticated user.
|
*/

export function useMarkNotificationAsRead() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string,
    ) =>
      notificationService.markAsRead(
        id,
      ),

    onSuccess: (
      notification,
    ) => {
      /*
       * If the notification detail is cached,
       * update it immediately.
       */
      if (notification?.id) {
        queryClient.setQueryData(
          notificationKeys.detail(
            notification.id,
          ),
          notification,
        )
      }

      /*
       * Refresh the authenticated user's
       * notification list.
       *
       * This ensures:
       *
       * - read_at is updated
       * - unread count is updated
       * - UI stays synchronized with backend
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}

/*
|--------------------------------------------------------------------------
| User — Mark All Notifications As Read
|--------------------------------------------------------------------------
|
| Marks all currently available notifications
| for the authenticated user as read.
|
*/

export function useMarkAllNotificationsAsRead() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: () =>
      notificationService.markAllAsRead(),

    onSuccess: () => {
      /*
       * Refresh the authenticated user's
       * notification list.
       */
      queryClient.invalidateQueries({
        queryKey:
          notificationKeys.mine(),
      })
    },
  })
}