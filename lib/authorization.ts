import { PermissionAction } from "@/types/user";

export interface AppPermission {
  resource: string;
  action: PermissionAction;
}

/**
 * ============================================================================
 * APPLICATION PERMISSIONS
 * ============================================================================
 *
 * These values MUST match the backend authorization model.
 *
 * Backend canonical permission format:
 *
 *     resource.action
 *
 * Examples:
 *
 *     dashboard.view
 *     analytics.view
 *     analytics_sentiment.view
 *     facebook_pages.view
 *     facebook_connections.manage
 *     ai_sentiment.view
 *     ai_settings.manage
 *     users.create
 *     roles.update
 *     permissions.manage
 *     system_settings.view
 *     audit.view
 *
 * Frontend permissions are used for:
 *
 * - navigation visibility
 * - route guards
 * - action/button visibility
 * - permission-aware UI
 *
 * IMPORTANT:
 * ----------------------------------------------------------------------------
 * Frontend authorization is NOT the security boundary.
 *
 * Every protected API endpoint/action MUST be authorized by the backend.
 * ============================================================================
 */

export const APP_PERMISSIONS = {

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  DASHBOARD_VIEW: {
    resource: "dashboard",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | ANALYTICS
  |--------------------------------------------------------------------------
  */

  ANALYTICS_VIEW: {
    resource: "analytics",
    action: "view",
  },

  ANALYTICS_SENTIMENT_VIEW: {
    resource: "analytics_sentiment",
    action: "view",
  },

  ANALYTICS_ENGAGEMENT_VIEW: {
    resource: "analytics_engagement",
    action: "view",
  },

  ANALYTICS_TOPICS_VIEW: {
    resource: "analytics_topics",
    action: "view",
  },

  ANALYTICS_TRENDS_VIEW: {
    resource: "analytics_trends",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK PAGES
  |--------------------------------------------------------------------------
  */

  FACEBOOK_PAGES_VIEW: {
    resource: "facebook_pages",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK POSTS
  |--------------------------------------------------------------------------
  */

  FACEBOOK_POSTS_VIEW: {
    resource: "facebook_posts",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK COMMENTS
  |--------------------------------------------------------------------------
  */

  FACEBOOK_COMMENTS_VIEW: {
    resource: "facebook_comments",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK REACTIONS
  |--------------------------------------------------------------------------
  */

  FACEBOOK_REACTIONS_VIEW: {
    resource: "facebook_reactions",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK INSIGHTS
  |--------------------------------------------------------------------------
  */

  FACEBOOK_INSIGHTS_VIEW: {
    resource: "facebook_insights",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | FACEBOOK CONNECTIONS
  |--------------------------------------------------------------------------
  */

  FACEBOOK_CONNECTIONS_VIEW: {
    resource: "facebook_connections",
    action: "view",
  },

  FACEBOOK_CONNECTIONS_MANAGE: {
    resource: "facebook_connections",
    action: "manage",
  },


  /*
  |--------------------------------------------------------------------------
  | AI
  |--------------------------------------------------------------------------
  */

  AI_SENTIMENT_VIEW: {
    resource: "ai_sentiment",
    action: "view",
  },

  AI_TOPICS_VIEW: {
    resource: "ai_topics",
    action: "view",
  },

  AI_INSIGHTS_VIEW: {
    resource: "ai_insights",
    action: "view",
  },


  /*
  |--------------------------------------------------------------------------
  | AI SETTINGS
  |--------------------------------------------------------------------------
  */

  AI_SETTINGS_VIEW: {
    resource: "ai_settings",
    action: "view",
  },

  AI_SETTINGS_MANAGE: {
    resource: "ai_settings",
    action: "manage",
  },


  /*
  |--------------------------------------------------------------------------
  | REPORTS
  |--------------------------------------------------------------------------
  */

  REPORTS_VIEW: {
    resource: "reports",
    action: "view",
  },

  REPORTS_CREATE: {
    resource: "reports",
    action: "create",
  },

  REPORTS_EXPORT: {
    resource: "reports",
    action: "export",
  },


  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */

  USERS_VIEW: {
    resource: "users",
    action: "view",
  },

  USERS_CREATE: {
    resource: "users",
    action: "create",
  },

  USERS_UPDATE: {
    resource: "users",
    action: "update",
  },

  USERS_DELETE: {
    resource: "users",
    action: "delete",
  },


  /*
  |--------------------------------------------------------------------------
  | ROLES
  |--------------------------------------------------------------------------
  */

  ROLES_VIEW: {
    resource: "roles",
    action: "view",
  },

  ROLES_CREATE: {
    resource: "roles",
    action: "create",
  },

  ROLES_UPDATE: {
    resource: "roles",
    action: "update",
  },

  ROLES_DELETE: {
    resource: "roles",
    action: "delete",
  },


  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS
  |--------------------------------------------------------------------------
  */

  PERMISSIONS_VIEW: {
    resource: "permissions",
    action: "view",
  },

  PERMISSIONS_MANAGE: {
    resource: "permissions",
    action: "manage",
  },


  /*
  |--------------------------------------------------------------------------
  | SYSTEM SETTINGS
  |--------------------------------------------------------------------------
  */

  SYSTEM_SETTINGS_VIEW: {
    resource: "system_settings",
    action: "view",
  },

  SYSTEM_SETTINGS_MANAGE: {
    resource: "system_settings",
    action: "manage",
  },


  /*
  |--------------------------------------------------------------------------
  | AUDIT
  |--------------------------------------------------------------------------
  */

  AUDIT_VIEW: {
    resource: "audit",
    action: "view",
  },


    /*
  |--------------------------------------------------------------------------
  | NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  NOTIFICATIONS_VIEW: {
    resource: "notifications",
    action: "view",
  },

  // NOTIFICATIONS_READ: {
  //   resource: "notifications",
  //   action: "read",
  // },

  // NOTIFICATIONS_ARCHIVE: {
  //   resource: "notifications",
  //   action: "archive",
  // },

  NOTIFICATIONS_DELETE: {
    resource: "notifications",
    action: "delete",
  },

  NOTIFICATIONS_MANAGE: {
    resource: "notifications",
    action: "manage",
  },

} satisfies Record<string, AppPermission>;