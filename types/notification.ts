export type NotificationStatus =
  | "published"
  | "scheduled"
  | "draft"
  | "archived"

export type NotificationPriority =
  | "normal"
  | "important"
  | "urgent"

export type NotificationType =
  | "announcement"
  | "maintenance"
  | "security"
  | "policy"
  | "system"

export type NotificationAudienceType =
  | "all_users"
  | "role"
  | "selected_users"

export type NotificationAudienceData =
  | null
  | {
      roles: string[]
    }
  | {
      user_ids: string[]
    }

export type NotificationAudience = {
  type: NotificationAudienceType
  data: NotificationAudienceData
}

export type NotificationCreator = {
  id: string
  name: string
}

export type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus

  audience: NotificationAudience

  recipient_count?: number
  created_by: string
  creator?: NotificationCreator | null

  published_at: string | null
  scheduled_at: string | null
  expires_at: string | null

  created_at: string
  updated_at: string

  is_expired: boolean
  is_scheduled_for_future: boolean
  is_publishable: boolean
}

export type NotificationFilters = {
  search?: string
  status?: NotificationStatus | "all"
  type?: NotificationType | "all"
  priority?: NotificationPriority | "all"
  audience_type?: NotificationAudienceType | "all"
  page?: number
  per_page?: number
}

export type CreateNotificationPayload = {
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
  audience_type: NotificationAudienceType
  audience_data?: NotificationAudienceData
  expires_at?: string | null
}

export type UpdateNotificationPayload = {
  title?: string
  message?: string
  type?: NotificationType
  priority?: NotificationPriority
  audience_type?: NotificationAudienceType
  audience_data?: NotificationAudienceData
  expires_at?: string | null
}

export type ScheduleNotificationPayload = {
  scheduled_at: string
}

export type NotificationStatistics = {
  total: number
  published: number
  scheduled: number
  drafts: number
  archived: number
}

export type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

export type PaginationMeta = {
  current_page: number
  from: number | null
  last_page: number
  links: PaginationLink[]
  path: string
  per_page: number
  to: number | null
  total: number
}

export type PaginatedNotifications = {
  data: Notification[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: PaginationMeta
}

export type NotificationResponse = {
  data: Notification
}

export type NotificationStatisticsResponse = {
  data: NotificationStatistics
}

export type NotificationDeleteResponse = {
  message: string
}