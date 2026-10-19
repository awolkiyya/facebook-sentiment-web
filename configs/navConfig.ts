import {
  PieChart,
  Users,
  Settings,
  ShieldCheck,
  Globe2,
  ScrollText,
  Lightbulb,
  Bell,
  History,
} from "lucide-react"

import { FaFacebookF } from "react-icons/fa"

import { NavItem } from "@/types/commen"
import { APP_PERMISSIONS } from "@/lib/authorization"

/**
 * =========================================================
 * APPLICATION NAVIGATION
 * =========================================================
 *
 * Navigation is PERMISSION-DRIVEN, NOT ROLE-DRIVEN.
 *
 * User
 *   ↓
 * Roles
 *   ↓
 * Permissions
 *   ↓
 * Navigation
 *
 * The frontend only controls visibility.
 * Backend authorization remains the real security boundary.
 * =========================================================
 */

export const NAV_ITEMS: NavItem[] = [
  // =========================================================
  // DASHBOARD
  // =========================================================

  {
    title: "dashboard",
    url: "/dashboard",
    icon: PieChart,
    permission: APP_PERMISSIONS.DASHBOARD_VIEW,
  },

  // =========================================================
  // FACEBOOK
  // =========================================================

  {
    title: "facebook",
    url: "/or/dashboard/facebook/pages",
    icon: FaFacebookF,

    items: [
      // -------------------------------------------------------
      // Facebook Pages
      // -------------------------------------------------------

      {
        title: "facebook_pages",
        url: "/or/dashboard/facebook/pages",
        icon: Globe2,
        permission:
          APP_PERMISSIONS.FACEBOOK_PAGES_VIEW,
      },

      // -------------------------------------------------------
      // Facebook Sync Runs
      // -------------------------------------------------------

      {
        title: "facebook_sync_runs",
        url: "/or/dashboard/facebook/sync-runs",
        icon: History,
        permission:
          APP_PERMISSIONS.FACEBOOK_SYNC_RUNS_VIEW,
      },
      // -------------------------------------------------------
      // AI Insights
      // -------------------------------------------------------

      {
        title: "facebook_insights",
        url: "/or/dashboard/facebook/insights",
        icon: Lightbulb,
        permission: APP_PERMISSIONS.FACEBOOK_INSIGHTS_VIEW,
      },
    ],
  },


  // =========================================================
  // REPORTS
  // =========================================================

  // {
  //   title: "reports",
  //   url: "/or/dashboard/reports",
  //   icon: FileBarChart,
  //   permission:
  //     APP_PERMISSIONS.REPORTS_VIEW,
  // },

  // =========================================================
  // ADMINISTRATION
  // =========================================================

  {
    title: "administration",
    url: "/or/dashboard/administration",
    icon: Settings,

    items: [
      // -------------------------------------------------------
      // Users
      // -------------------------------------------------------

      {
        title: "users",
        url: "/or/dashboard/administration/users",
        icon: Users,
        permission:
          APP_PERMISSIONS.USERS_VIEW,
      },

      // -------------------------------------------------------
      // Roles
      // -------------------------------------------------------

      {
        title: "roles",
        url: "/or/dashboard/administration/roles",
        icon: ShieldCheck,
        permission:
          APP_PERMISSIONS.ROLES_VIEW,
      },

      // -------------------------------------------------------
      // Notification Management
      // -------------------------------------------------------

      {
        title: "announcements",
        url: "/or/dashboard/administration/announcements",
        icon: Bell,
        permission:
          APP_PERMISSIONS.NOTIFICATIONS_MANAGE,
      },
    ],
  },

  // =========================================================
  // SYSTEM SETTINGS
  // =========================================================

  {
    title: "system_settings",
    url: "/or/dashboard/settings",
    icon: Settings,
    permission:
      APP_PERMISSIONS.SYSTEM_SETTINGS_VIEW,
  },

  // =========================================================
  // SYSTEM LOGS
  // =========================================================

  {
    title: "system_logs",
    url: "/or/dashboard/system-logs",
    icon: ScrollText,
    permission:
      APP_PERMISSIONS.AUDIT_VIEW,
  },
]