"use client"

import React, {
  useEffect,
  useState,
} from "react"
import {
  Bell,
  BrainCircuit,
  CheckCircle2,
  FileBarChart,
  Save,
  Settings,
  Shield,
  SlidersHorizontal,
  Wrench,
} from "lucide-react"
import { FaFacebookF } from "react-icons/fa"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"



import type {
  SystemSetting,
  UpdateSystemSettingRequest,
} from "@/types/system-setting"
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/systemSetting/use-system-settings"
import AIModelManagement from "@/components/settings/ai-models/ai-model-management"

type SettingsSection =
  | "general"
  | "facebook"
  | "ai"
  | "notifications"
  | "security"
  | "reports"
  | "maintenance"

interface SystemSettingsForm {
  // General
  applicationName: string
  municipalityName: string
  applicationDescription: string
  supportEmail: string
  supportPhone: string

  // Facebook
  facebookGraphVersion: string
  facebookSyncEnabled: boolean
  facebookAutoSync: boolean
  facebookSyncInterval: string
  facebookPostsEnabled: boolean
  facebookCommentsEnabled: boolean


  // AI Service
  aiEnabled: boolean
  aiServiceUrl: string
  aiBatchSize: string
  aiAutomaticAnalysis: boolean

  // Notifications
  emailNotifications: boolean
  failedSyncAlerts: boolean
  aiFailureAlerts: boolean
  securityAlerts: boolean
  notificationEmail: string

  // Security
  passwordMinLength: string
  maxLoginAttempts: string
  lockoutMinutes: string
  requireStrongPassword: boolean
  requireTwoFactor: boolean

  // Reports
  reportPdfEnabled: boolean
  reportExcelEnabled: boolean
  reportDefaultFormat: string
  reportLogoEnabled: boolean
  reportFooter: string

  // Maintenance
  maintenanceMode: boolean
  maintenanceMessage: string
  cacheEnabled: boolean
  scheduledTasksEnabled: boolean
}

const EMPTY_SETTINGS: SystemSettingsForm = {
  applicationName: "",
  municipalityName: "",
  applicationDescription: "",
  supportEmail: "",
  supportPhone: "",

  facebookGraphVersion: "v26.0",
  facebookSyncEnabled: true,
  facebookAutoSync: true,
  facebookSyncInterval: "15",
  facebookPostsEnabled: true,
  facebookCommentsEnabled: true,

  aiEnabled: true,
  aiServiceUrl: "",
  aiBatchSize: "32",
  aiAutomaticAnalysis: true,

  emailNotifications: true,
  failedSyncAlerts: true,
  aiFailureAlerts: true,
  securityAlerts: true,
  notificationEmail: "",

  passwordMinLength: "8",
  maxLoginAttempts: "5",
  lockoutMinutes: "15",
  requireStrongPassword: true,
  requireTwoFactor: false,

  reportPdfEnabled: true,
  reportExcelEnabled: true,
  reportDefaultFormat: "pdf",
  reportLogoEnabled: true,
  reportFooter: "",

  maintenanceMode: false,
  maintenanceMessage: "",
  cacheEnabled: true,
  scheduledTasksEnabled: true,
}

const SETTINGS_NAV = [
  {
    id: "general" as SettingsSection,
    label: "General",
    description:
      "Application identity and contact information",
    icon: Settings,
  },
  {
    id: "facebook" as SettingsSection,
    label: "Facebook",
    description:
      "Facebook page and synchronization settings",
    icon: FaFacebookF,
  },
  {
    id: "ai" as SettingsSection,
    label: "AI Service",
    description:
      "AI service connection and analysis settings",
    icon: BrainCircuit,
  },
  {
    id: "notifications" as SettingsSection,
    label: "Notifications",
    description:
      "Important system notifications",
    icon: Bell,
  },
  {
    id: "security" as SettingsSection,
    label: "Security",
    description:
      "Password and access security",
    icon: Shield,
  },
  {
    id: "reports" as SettingsSection,
    label: "Reports",
    description:
      "Report generation and branding",
    icon: FileBarChart,
  },
  {
    id: "maintenance" as SettingsSection,
    label: "Maintenance",
    description:
      "Application maintenance controls",
    icon: Wrench,
  },
]

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {title}
        </p>

        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <p className="text-sm font-medium">
      {children}
    </p>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="size-5" />
        </div>

        <div>
          <CardTitle>{title}</CardTitle>

          <CardDescription className="mt-1">
            {description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

function mapApiSettingsToForm(
  settings: SystemSetting,
): SystemSettingsForm {
  return {
    applicationName:
      settings.general.application_name,

    municipalityName:
      settings.general.municipality_name,

    applicationDescription:
      settings.general.application_description ??
      "",

    supportEmail:
      settings.general.support_email ?? "",

    supportPhone:
      settings.general.support_phone ?? "",

    facebookGraphVersion:
      settings.facebook.graph_version,

    facebookSyncEnabled:
      settings.facebook.sync_enabled,

    facebookAutoSync:
      settings.facebook.auto_sync,

    facebookSyncInterval:
      String(
        settings.facebook.sync_interval,
      ),

    facebookPostsEnabled:
      settings.facebook.posts_enabled,

    facebookCommentsEnabled:
      settings.facebook.comments_enabled,


    aiEnabled:
      settings.ai.enabled,

    aiServiceUrl:
      settings.ai.service_url ?? "",

    aiBatchSize:
      String(settings.ai.batch_size),

    aiAutomaticAnalysis:
      settings.ai.automatic_analysis,

    emailNotifications:
      settings.notifications.email_notifications,

    failedSyncAlerts:
      settings.notifications.failed_sync_alerts,

    aiFailureAlerts:
      settings.notifications.ai_failure_alerts,

    securityAlerts:
      settings.notifications.security_alerts,

    notificationEmail:
      settings.notifications.notification_email ??
      "",

    passwordMinLength:
      String(
        settings.security.password_min_length,
      ),

    maxLoginAttempts:
      String(
        settings.security.max_login_attempts,
      ),

    lockoutMinutes:
      String(
        settings.security.lockout_minutes,
      ),

    requireStrongPassword:
      settings.security.require_strong_password,

    requireTwoFactor:
      settings.security.require_two_factor,

    reportPdfEnabled:
      settings.reports.pdf_enabled,

    reportExcelEnabled:
      settings.reports.excel_enabled,

    reportDefaultFormat:
      settings.reports.default_format,

    reportLogoEnabled:
      settings.reports.logo_enabled,

    reportFooter:
      settings.reports.footer ?? "",

    maintenanceMode:
      settings.maintenance.mode,

    maintenanceMessage:
      settings.maintenance.message ?? "",

    cacheEnabled:
      settings.maintenance.cache_enabled,

    scheduledTasksEnabled:
      settings.maintenance
        .scheduled_tasks_enabled,
  }
}

function mapFormToApiSettings(
  settings: SystemSettingsForm,
): UpdateSystemSettingRequest {
  return {
    application_name:
      settings.applicationName,

    municipality_name:
      settings.municipalityName,

    application_description:
      settings.applicationDescription.trim()
        ? settings.applicationDescription
        : null,

    support_email:
      settings.supportEmail.trim()
        ? settings.supportEmail
        : null,

    support_phone:
      settings.supportPhone.trim()
        ? settings.supportPhone
        : null,

    facebook_graph_version:
      settings.facebookGraphVersion,

    facebook_sync_enabled:
      settings.facebookSyncEnabled,

    facebook_auto_sync:
      settings.facebookAutoSync,

    facebook_sync_interval:
      Number(
        settings.facebookSyncInterval,
      ),

    facebook_posts_enabled:
      settings.facebookPostsEnabled,

    facebook_comments_enabled:
      settings.facebookCommentsEnabled,


    ai_enabled:
      settings.aiEnabled,

    ai_service_url:
      settings.aiServiceUrl.trim()
        ? settings.aiServiceUrl
        : null,

    ai_batch_size:
      Number(settings.aiBatchSize),

    ai_automatic_analysis:
      settings.aiAutomaticAnalysis,

    email_notifications:
      settings.emailNotifications,

    failed_sync_alerts:
      settings.failedSyncAlerts,

    ai_failure_alerts:
      settings.aiFailureAlerts,

    security_alerts:
      settings.securityAlerts,

    notification_email:
      settings.notificationEmail.trim()
        ? settings.notificationEmail
        : null,

    password_min_length:
      Number(settings.passwordMinLength),

    max_login_attempts:
      Number(settings.maxLoginAttempts),

    lockout_minutes:
      Number(settings.lockoutMinutes),

    require_strong_password:
      settings.requireStrongPassword,

    require_two_factor:
      settings.requireTwoFactor,

    report_pdf_enabled:
      settings.reportPdfEnabled,

    report_excel_enabled:
      settings.reportExcelEnabled,

    report_default_format:
      settings.reportDefaultFormat as
        | "pdf"
        | "excel",

    report_logo_enabled:
      settings.reportLogoEnabled,

    report_footer:
      settings.reportFooter.trim()
        ? settings.reportFooter
        : null,

    maintenance_mode:
      settings.maintenanceMode,

    maintenance_message:
      settings.maintenanceMessage.trim()
        ? settings.maintenanceMessage
        : null,

    cache_enabled:
      settings.cacheEnabled,

    scheduled_tasks_enabled:
      settings.scheduledTasksEnabled,
  }
}

function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>(
      "general",
    )

  const [settings, setSettings] =
    useState<SystemSettingsForm>(
      EMPTY_SETTINGS,
    )

  const [hasChanges, setHasChanges] =
    useState(false)

  const {
    data: serverSettings,
    isLoading,
    isError,
    error,
    refetch,
  } = useSystemSettings()

  const updateMutation =
    useUpdateSystemSettings()

  useEffect(() => {
    if (!serverSettings) {
      return
    }

    setSettings(
      mapApiSettingsToForm(
        serverSettings,
      ),
    )

    setHasChanges(false)
  }, [serverSettings])

  const updateSetting = <
    K extends keyof SystemSettingsForm,
  >(
    key: K,
    value: SystemSettingsForm[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))

    setHasChanges(true)
  }

  const saveSettings = () => {
    const payload =
      mapFormToApiSettings(
        settings,
      )

    updateMutation.mutate(
      payload,
      {
        onSuccess: (
          updatedSettings,
        ) => {
          setSettings(
            mapApiSettingsToForm(
              updatedSettings,
            ),
          )

          setHasChanges(false)
        },
      },
    )
  }

  const resetSettings = () => {
    if (!serverSettings) {
      return
    }

    setSettings(
      mapApiSettingsToForm(
        serverSettings,
      ),
    )

    setHasChanges(false)
  }

  // -------------------------------------------------------------------------
  // General
  // -------------------------------------------------------------------------

  const renderGeneral = () => (
    <Card>
      <SectionHeader
        icon={Settings}
        title="General Settings"
        description="Configure the basic identity and contact information of the platform."
      />

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>
              Application Name
            </FieldLabel>

            <Input
              value={
                settings.applicationName
              }
              onChange={(event) =>
                updateSetting(
                  "applicationName",
                  event.target.value,
                )
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>
              Municipality Name
            </FieldLabel>

            <Input
              value={
                settings.municipalityName
              }
              onChange={(event) =>
                updateSetting(
                  "municipalityName",
                  event.target.value,
                )
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <FieldLabel>
              Application Description
            </FieldLabel>

            <Textarea
              value={
                settings.applicationDescription
              }
              onChange={(event) =>
                updateSetting(
                  "applicationDescription",
                  event.target.value,
                )
              }
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>
              Support Email
            </FieldLabel>

            <Input
              type="email"
              value={
                settings.supportEmail
              }
              onChange={(event) =>
                updateSetting(
                  "supportEmail",
                  event.target.value,
                )
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>
              Support Phone
            </FieldLabel>

            <Input
              value={
                settings.supportPhone
              }
              onChange={(event) =>
                updateSetting(
                  "supportPhone",
                  event.target.value,
                )
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Facebook
  // -------------------------------------------------------------------------

  const renderFacebook = () => (
    <Card>
      <SectionHeader
        icon={FaFacebookF}
        title="Facebook Integration"
        description="Manage the Facebook page connection and data synchronization."
      />

      <CardContent>
        <div className="space-y-1">
          <SettingRow
            title="Facebook Integration"
            description="Enable Facebook data integration."
          >
            <Switch
              checked={
                settings.facebookSyncEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "facebookSyncEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <div className="grid gap-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>
                Graph API Version
              </FieldLabel>

              <Input
                value={
                  settings.facebookGraphVersion
                }
                onChange={(event) =>
                  updateSetting(
                    "facebookGraphVersion",
                    event.target.value,
                  )
                }
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                Meta Graph API version used by the backend.
              </p>
            </div>

            <div className="space-y-2">
              <FieldLabel>
                Sync Interval
              </FieldLabel>

              <Select
                value={
                  settings.facebookSyncInterval
                }
                onValueChange={(value) =>
                  updateSetting(
                    "facebookSyncInterval",
                    value,
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="5">
                    Every 5 minutes
                  </SelectItem>

                  <SelectItem value="15">
                    Every 15 minutes
                  </SelectItem>

                  <SelectItem value="30">
                    Every 30 minutes
                  </SelectItem>

                  <SelectItem value="60">
                    Every hour
                  </SelectItem>

                  <SelectItem value="120">
                    Every 2 hours
                  </SelectItem>

                  <SelectItem value="1440">
                    Once a day
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <SettingRow
            title="Automatic Synchronization"
            description="Automatically synchronize new Facebook data."
          >
            <Switch
              checked={
                settings.facebookAutoSync
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "facebookAutoSync",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.facebookSyncEnabled
              }
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Posts"
            description="Synchronize Facebook posts."
          >
            <Switch
              checked={
                settings.facebookPostsEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "facebookPostsEnabled",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.facebookSyncEnabled
              }
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Comments"
            description="Synchronize comments for AI analysis."
          >
            <Switch
              checked={
                settings.facebookCommentsEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "facebookCommentsEnabled",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.facebookSyncEnabled
              }
            />
          </SettingRow>

        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // AI Service
  // -------------------------------------------------------------------------

  const renderAI = () => (
    <Card>
      <SectionHeader
        icon={BrainCircuit}
        title="AI Service"
        description="Configure the connection and runtime behavior of the municipal AI service."
      />

      <CardContent>
        <div className="space-y-1">
          <SettingRow
            title="AI Analysis"
            description="Enable AI-powered analysis of synchronized municipal comments."
          >
            <Switch
              checked={
                settings.aiEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "aiEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <div className="grid gap-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>
                AI Service URL
              </FieldLabel>

              <Input
                value={
                  settings.aiServiceUrl
                }
                onChange={(event) =>
                  updateSetting(
                    "aiServiceUrl",
                    event.target.value,
                  )
                }
                placeholder="http://localhost:8000"
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                FastAPI inference service used by the Laravel backend.
              </p>
            </div>

            <div className="space-y-2">
              <FieldLabel>
                Batch Size
              </FieldLabel>

              <Input
                type="number"
                min="1"
                max="512"
                value={
                  settings.aiBatchSize
                }
                onChange={(event) =>
                  updateSetting(
                    "aiBatchSize",
                    event.target.value,
                  )
                }
                disabled={
                  isLoading ||
                  !settings.aiEnabled
                }
              />

              <p className="text-xs text-muted-foreground">
                Number of comments processed in one AI batch.
              </p>
            </div>
          </div>

          <Separator />

          <SettingRow
            title="Automatic Analysis"
            description="Automatically analyze newly synchronized comments."
          >
            <Switch
              checked={
                settings.aiAutomaticAnalysis
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "aiAutomaticAnalysis",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.aiEnabled
              }
            />
          </SettingRow>

          <Separator />


              <AIModelManagement/>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  const renderNotifications = () => (
    <Card>
      <SectionHeader
        icon={Bell}
        title="Notifications"
        description="Configure important operational notifications."
      />

      <CardContent>
        <div className="space-y-1">
          <div className="space-y-2 py-5">
            <FieldLabel>
              Notification Email
            </FieldLabel>

            <Input
              type="email"
              value={
                settings.notificationEmail
              }
              onChange={(event) =>
                updateSetting(
                  "notificationEmail",
                  event.target.value,
                )
              }
              disabled={isLoading}
              placeholder="admin@adama.gov.et"
            />
          </div>

          <Separator />

          <SettingRow
            title="Email Notifications"
            description="Enable system email notifications."
          >
            <Switch
              checked={
                settings.emailNotifications
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "emailNotifications",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Failed Sync Alerts"
            description="Notify administrators when Facebook synchronization fails."
          >
            <Switch
              checked={
                settings.failedSyncAlerts
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "failedSyncAlerts",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.emailNotifications
              }
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="AI Failure Alerts"
            description="Notify administrators when the AI service fails."
          >
            <Switch
              checked={
                settings.aiFailureAlerts
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "aiFailureAlerts",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.emailNotifications
              }
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Security Alerts"
            description="Notify administrators about important security events."
          >
            <Switch
              checked={
                settings.securityAlerts
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "securityAlerts",
                  value,
                )
              }
              disabled={
                isLoading ||
                !settings.emailNotifications
              }
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Security
  // -------------------------------------------------------------------------

  const renderSecurity = () => (
    <Card>
      <SectionHeader
        icon={Shield}
        title="Security"
        description="Configure the basic security policies for application users."
      />

      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel>
                Minimum Password Length
              </FieldLabel>

              <Input
                type="number"
                min="6"
                max="72"
                value={
                  settings.passwordMinLength
                }
                onChange={(event) =>
                  updateSetting(
                    "passwordMinLength",
                    event.target.value,
                  )
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>
                Maximum Login Attempts
              </FieldLabel>

              <Input
                type="number"
                min="1"
                max="20"
                value={
                  settings.maxLoginAttempts
                }
                onChange={(event) =>
                  updateSetting(
                    "maxLoginAttempts",
                    event.target.value,
                  )
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <FieldLabel>
                Lockout Duration
              </FieldLabel>

              <Input
                type="number"
                min="1"
                max="1440"
                value={
                  settings.lockoutMinutes
                }
                onChange={(event) =>
                  updateSetting(
                    "lockoutMinutes",
                    event.target.value,
                  )
                }
                disabled={isLoading}
              />

              <p className="text-xs text-muted-foreground">
                Minutes
              </p>
            </div>
          </div>

          <Separator />

          <SettingRow
            title="Strong Password Policy"
            description="Require users to use stronger passwords."
          >
            <Switch
              checked={
                settings.requireStrongPassword
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "requireStrongPassword",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Two-Factor Authentication"
            description="Require additional authentication for users."
          >
            <Switch
              checked={
                settings.requireTwoFactor
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "requireTwoFactor",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Reports
  // -------------------------------------------------------------------------

  const renderReports = () => (
    <Card>
      <SectionHeader
        icon={FileBarChart}
        title="Reports"
        description="Configure analytics report generation and presentation."
      />

      <CardContent>
        <div className="space-y-1">
          <SettingRow
            title="PDF Reports"
            description="Allow users to generate PDF reports."
          >
            <Switch
              checked={
                settings.reportPdfEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "reportPdfEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Excel Reports"
            description="Allow users to export reports to Excel."
          >
            <Switch
              checked={
                settings.reportExcelEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "reportExcelEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <div className="grid gap-6 py-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>
                Default Report Format
              </FieldLabel>

              <Select
                value={
                  settings.reportDefaultFormat
                }
                onValueChange={(value) =>
                  updateSetting(
                    "reportDefaultFormat",
                    value,
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="pdf">
                    PDF
                  </SelectItem>

                  <SelectItem value="excel">
                    Excel
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FieldLabel>
                Report Footer
              </FieldLabel>

              <Input
                value={
                  settings.reportFooter
                }
                onChange={(event) =>
                  updateSetting(
                    "reportFooter",
                    event.target.value,
                  )
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <Separator />

          <SettingRow
            title="Municipality Logo"
            description="Include the municipality logo in reports."
          >
            <Switch
              checked={
                settings.reportLogoEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "reportLogoEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Maintenance
  // -------------------------------------------------------------------------

  const renderMaintenance = () => (
    <Card>
      <SectionHeader
        icon={Wrench}
        title="Maintenance"
        description="Manage essential application maintenance controls."
      />

      <CardContent>
        <div className="space-y-1">
          <SettingRow
            title="Maintenance Mode"
            description="Temporarily restrict normal application access."
          >
            <Switch
              checked={
                settings.maintenanceMode
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "maintenanceMode",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <div className="space-y-2 py-5">
            <FieldLabel>
              Maintenance Message
            </FieldLabel>

            <Textarea
              value={
                settings.maintenanceMessage
              }
              onChange={(event) =>
                updateSetting(
                  "maintenanceMessage",
                  event.target.value,
                )
              }
              rows={3}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <SettingRow
            title="Application Cache"
            description="Enable application caching for better performance."
          >
            <Switch
              checked={
                settings.cacheEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "cacheEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>

          <Separator />

          <SettingRow
            title="Scheduled Tasks"
            description="Enable scheduled synchronization and maintenance jobs."
          >
            <Switch
              checked={
                settings.scheduledTasksEnabled
              }
              onCheckedChange={(value) =>
                updateSetting(
                  "scheduledTasksEnabled",
                  value,
                )
              }
              disabled={isLoading}
            />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  )

  // -------------------------------------------------------------------------
  // Section Renderer
  // -------------------------------------------------------------------------

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return renderGeneral()

      case "facebook":
        return renderFacebook()

      case "ai":
        return renderAI()

      case "notifications":
        return renderNotifications()

      case "security":
        return renderSecurity()

      case "reports":
        return renderReports()

      case "maintenance":
        return renderMaintenance()

      default:
        return renderGeneral()
    }
  }

  const activeNavItem =
    SETTINGS_NAV.find(
      (item) =>
        item.id === activeSection,
    )

  const isSaving =
    updateMutation.isPending

  const pageBusy =
    isLoading || isSaving

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6 md:p-12">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Settings
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Loading system configuration...
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[240px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 size-7 animate-spin rounded-full border-2 border-muted border-t-foreground" />

              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------------

  if (isError) {
    return (
      <div className="space-y-6 md:p-12">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Settings
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the essential configuration of Mayor Social Analytics.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[240px] items-center justify-center">
            <div className="max-w-md text-center">
              <p className="text-sm font-medium">
                Unable to load system settings.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message ??
                  "An unexpected error occurred while loading system settings."}
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  refetch()
                }
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:p-12">
      {/* ------------------------------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------------------------------- */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              System Settings
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the essential configuration of Mayor Social Analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline">
              Unsaved changes
            </Badge>
          )}

          <Button
            variant="outline"
            onClick={
              resetSettings
            }
            disabled={
              !hasChanges ||
              pageBusy
            }
          >
            Reset
          </Button>

          <Button
            onClick={
              saveSettings
            }
            disabled={
              !hasChanges ||
              pageBusy
            }
          >
            <Save className="mr-2 size-4" />

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Status */}
      {/* ------------------------------------------------------------------- */}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  System Configuration
                </p>

                <p className="text-xs text-muted-foreground">
                  Essential application, integration and service configuration.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                AI{" "}
                {settings.aiEnabled
                  ? "Enabled"
                  : "Disabled"}
              </Badge>

              <Badge variant="outline">
                Facebook{" "}
                {settings.facebookSyncEnabled
                  ? "Enabled"
                  : "Disabled"}
              </Badge>

              {settings.maintenanceMode && (
                <Badge variant="destructive">
                  Maintenance Mode
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------- */}
      {/* Settings */}
      {/* ------------------------------------------------------------------- */}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Settings
            </CardTitle>

            <CardDescription>
              Select a category.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-2">
            <nav className="space-y-1">
              {SETTINGS_NAV.map(
                (item) => {
                  const Icon =
                    item.icon

                  const active =
                    activeSection ===
                    item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveSection(
                          item.id,
                        )
                      }
                      className={[
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-muted"
                          : "hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0" />

                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>

                        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                          {
                            item.description
                          }
                        </span>
                      </span>
                    </button>
                  )
                },
              )}
            </nav>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          {activeNavItem && (
            <div className="text-sm text-muted-foreground">
              Settings /{" "}
              <span className="font-medium text-foreground">
                {
                  activeNavItem.label
                }
              </span>
            </div>
          )}

          {renderSection()}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Save Bar */}
      {/* ------------------------------------------------------------------- */}

      <Card className="sticky bottom-4 z-10">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              System settings
            </p>

            <p className="text-xs text-muted-foreground">
              Save your changes to apply the new configuration.
            </p>
          </div>

          <Button
            onClick={
              saveSettings
            }
            disabled={
              !hasChanges ||
              pageBusy
            }
          >
            <Save className="mr-2 size-4" />

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage