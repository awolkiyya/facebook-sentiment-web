import { api } from "@/lib/api/api"

import type {
  CreateNotificationPayload,
  Notification,
  NotificationDeleteResponse,
  NotificationFilters,
  NotificationResponse,
  NotificationStatisticsResponse,
  NotificationStatistics,
  PaginatedNotifications,
  ScheduleNotificationPayload,
  UpdateNotificationPayload,
} from "@/types/notification"

/*
|--------------------------------------------------------------------------
| Base URL
|--------------------------------------------------------------------------
*/

const BASE_URL = "/v1/notifications"

/*
|--------------------------------------------------------------------------
| Query Parameters
|--------------------------------------------------------------------------
*/

function buildQueryParams(
  filters: NotificationFilters = {},
): URLSearchParams {
  const params = new URLSearchParams()

  /*
   * Search
   */
  if (filters.search?.trim()) {
    params.set(
      "search",
      filters.search.trim(),
    )
  }

  /*
   * Status
   */
  if (
    filters.status &&
    filters.status !== "all"
  ) {
    params.set(
      "status",
      filters.status,
    )
  }

  /*
   * Type
   */
  if (
    filters.type &&
    filters.type !== "all"
  ) {
    params.set(
      "type",
      filters.type,
    )
  }

  /*
   * Priority
   */
  if (
    filters.priority &&
    filters.priority !== "all"
  ) {
    params.set(
      "priority",
      filters.priority,
    )
  }

  /*
   * Audience Type
   */
  if (
    filters.audience_type &&
    filters.audience_type !== "all"
  ) {
    params.set(
      "audience_type",
      filters.audience_type,
    )
  }

  /*
   * Pagination
   */
  if (filters.page) {
    params.set(
      "page",
      String(filters.page),
    )
  }

  if (filters.per_page) {
    params.set(
      "per_page",
      String(filters.per_page),
    )
  }

  return params
}

/*
|--------------------------------------------------------------------------
| Notification Service
|--------------------------------------------------------------------------
*/

export const notificationService = {
  /*
  |--------------------------------------------------------------------------
  | Admin — List Notifications
  |--------------------------------------------------------------------------
  */

  async getNotifications(
    filters: NotificationFilters = {},
  ): Promise<PaginatedNotifications> {
    const params =
      buildQueryParams(filters)

    const queryString =
      params.toString()

    const response =
      await api.get<PaginatedNotifications>(
        queryString
          ? `${BASE_URL}?${queryString}`
          : BASE_URL,
      )

    return response.data
  },

  /*
  |--------------------------------------------------------------------------
  | User — My Notifications
  |--------------------------------------------------------------------------
  |
  | Returns notifications applicable to the
  | currently authenticated user.
  |
  */

  async getMyNotifications(
    filters: NotificationFilters = {},
  ): Promise<PaginatedNotifications> {
    const params =
      buildQueryParams(filters)

    const queryString =
      params.toString()

    const response =
      await api.get<PaginatedNotifications>(
        queryString
          ? `${BASE_URL}/mine?${queryString}`
          : `${BASE_URL}/mine`,
      )

    return response.data
  },

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  async getStatistics(): Promise<NotificationStatistics> {
    const response =
      await api.get<NotificationStatisticsResponse>(
        `${BASE_URL}/statistics`,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Show
  |--------------------------------------------------------------------------
  */

  async getNotification(
    id: string,
  ): Promise<Notification> {
    const response =
      await api.get<NotificationResponse>(
        `${BASE_URL}/${id}`,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  async createNotification(
    payload: CreateNotificationPayload,
  ): Promise<Notification> {
    const response =
      await api.post<NotificationResponse>(
        BASE_URL,
        payload,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  async updateNotification(
    id: string,
    payload: UpdateNotificationPayload,
  ): Promise<Notification> {
    const response =
      await api.put<NotificationResponse>(
        `${BASE_URL}/${id}`,
        payload,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Publish
  |--------------------------------------------------------------------------
  */

  async publishNotification(
    id: string,
  ): Promise<Notification> {
    const response =
      await api.post<NotificationResponse>(
        `${BASE_URL}/${id}/publish`,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Schedule
  |--------------------------------------------------------------------------
  */

  async scheduleNotification(
    id: string,
    payload: ScheduleNotificationPayload,
  ): Promise<Notification> {
    const response =
      await api.post<NotificationResponse>(
        `${BASE_URL}/${id}/schedule`,
        payload,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | Archive
  |--------------------------------------------------------------------------
  */

  async archiveNotification(
    id: string,
  ): Promise<Notification> {
    const response =
      await api.post<NotificationResponse>(
        `${BASE_URL}/${id}/archive`,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | User — Mark As Read
  |--------------------------------------------------------------------------
  |
  | Marks one notification as read for the
  | currently authenticated user.
  |
  */

  async markAsRead(
    id: string,
  ): Promise<Notification> {
    const response =
      await api.post<NotificationResponse>(
        `${BASE_URL}/${id}/read`,
      )

    return response.data.data
  },

  /*
  |--------------------------------------------------------------------------
  | User — Mark All As Read
  |--------------------------------------------------------------------------
  |
  | Marks all currently available notifications
  | as read for the authenticated user.
  |
  */

  async markAllAsRead(): Promise<void> {
    await api.post(
      `${BASE_URL}/read-all`,
    )
  },

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  async deleteNotification(
    id: string,
  ): Promise<NotificationDeleteResponse> {
    const response =
      await api.delete<NotificationDeleteResponse>(
        `${BASE_URL}/${id}`,
      )

    return response.data
  },
}
