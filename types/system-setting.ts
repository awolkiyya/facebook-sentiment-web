/*
|--------------------------------------------------------------------------
| General Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingGeneral {
  application_name: string
  municipality_name: string
  application_description: string | null
  support_email: string | null
  support_phone: string | null
}

/*
|--------------------------------------------------------------------------
| Facebook Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingFacebook {
  graph_version: string
  sync_enabled: boolean
  auto_sync: boolean
  sync_interval: number
  posts_enabled: boolean
  comments_enabled: boolean
  reactions_enabled: boolean
  insights_enabled: boolean
}

/*
|--------------------------------------------------------------------------
| AI & Analytics Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingAI {
  enabled: boolean
  service_url: string | null
  batch_size: number
  automatic_analysis: boolean
}

/*
|--------------------------------------------------------------------------
| Notification Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingNotifications {
  email_notifications: boolean
  failed_sync_alerts: boolean
  ai_failure_alerts: boolean
  security_alerts: boolean
  notification_email: string | null
}

/*
|--------------------------------------------------------------------------
| Security Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingSecurity {
  password_min_length: number
  max_login_attempts: number
  lockout_minutes: number
  require_strong_password: boolean
  require_two_factor: boolean
}

/*
|--------------------------------------------------------------------------
| Report Settings
|--------------------------------------------------------------------------
*/

export type SystemSettingReportFormat = "pdf" | "excel"

export interface SystemSettingReports {
  pdf_enabled: boolean
  excel_enabled: boolean
  default_format: SystemSettingReportFormat
  logo_enabled: boolean
  footer: string | null
}

/*
|--------------------------------------------------------------------------
| Maintenance Settings
|--------------------------------------------------------------------------
*/

export interface SystemSettingMaintenance {
  mode: boolean
  message: string | null
  cache_enabled: boolean
  scheduled_tasks_enabled: boolean
}

/*
|--------------------------------------------------------------------------
| Settings Metadata
|--------------------------------------------------------------------------
*/

export interface SystemSettingMetadata {
  id: number
  created_at: string | null
  updated_at: string | null
}

/*
|--------------------------------------------------------------------------
| Complete System Settings
|--------------------------------------------------------------------------
*/

export interface SystemSetting {
  general: SystemSettingGeneral
  facebook: SystemSettingFacebook
  ai: SystemSettingAI
  notifications: SystemSettingNotifications
  security: SystemSettingSecurity
  reports: SystemSettingReports
  maintenance: SystemSettingMaintenance
  metadata: SystemSettingMetadata
}

/*
|--------------------------------------------------------------------------
| API Response
|--------------------------------------------------------------------------
*/

export interface SystemSettingResponse {
  success: boolean
  message: string
  data: SystemSetting
  errors: null
  meta: SystemSettingResponseMeta
}

/*
|--------------------------------------------------------------------------
| API Response Metadata
|--------------------------------------------------------------------------
*/

export interface SystemSettingResponseMeta {
  timestamp: string
  request_id: string
  version: string
}

/*
|--------------------------------------------------------------------------
| Update Request
|--------------------------------------------------------------------------
|
| The backend uses "sometimes", so every field is optional.
| This allows PATCH requests to update only selected settings.
|
*/

export interface UpdateSystemSettingRequest {
  /*
  | General
  */
  application_name?: string
  municipality_name?: string
  application_description?: string | null
  support_email?: string | null
  support_phone?: string | null

  /*
  | Facebook
  */
  facebook_graph_version?: string
  facebook_sync_enabled?: boolean
  facebook_auto_sync?: boolean
  facebook_sync_interval?: number
  facebook_posts_enabled?: boolean
  facebook_comments_enabled?: boolean
  facebook_reactions_enabled?: boolean
  facebook_insights_enabled?: boolean

  /*
  | AI
  */
  ai_enabled?: boolean
  ai_service_url?: string | null
  ai_batch_size?: number
  ai_automatic_analysis?: boolean

  /*
  | Notifications
  */
  email_notifications?: boolean
  failed_sync_alerts?: boolean
  ai_failure_alerts?: boolean
  security_alerts?: boolean
  notification_email?: string | null

  /*
  | Security
  */
  password_min_length?: number
  max_login_attempts?: number
  lockout_minutes?: number
  require_strong_password?: boolean
  require_two_factor?: boolean

  /*
  | Reports
  */
  report_pdf_enabled?: boolean
  report_excel_enabled?: boolean
  report_default_format?: SystemSettingReportFormat
  report_logo_enabled?: boolean
  report_footer?: string | null

  /*
  | Maintenance
  */
  maintenance_mode?: boolean
  maintenance_message?: string | null
  cache_enabled?: boolean
  scheduled_tasks_enabled?: boolean
}
