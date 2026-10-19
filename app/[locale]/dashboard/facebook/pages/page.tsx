"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Unplug,
  Users,
} from "lucide-react";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

import { FaFacebookF } from "react-icons/fa";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { useFacebookPages } from "@/hooks/facebook/use-facebook-pages";
import MfaSecurityBanner from "@/components/MfaSecurityBanner";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PageStatus =
  | "connected"
  | "syncing"
  | "error";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Format large numbers into compact values.
 *
 * Example:
 * 184500  → 184.5K
 * 1500000 → 1.5M
 */
function formatCompactNumber(
  value: number | null
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a full number.
 */
function formatNumber(
  value: number | null
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toLocaleString("en-US");
}

/**
 * Generate initials for Page avatar fallback.
 */
function getInitials(
  name: string
): string {
  const normalizedName =
    name.trim();

  if (!normalizedName) {
    return "FB";
  }

  return normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0)
    )
    .join("")
    .toUpperCase();
}

/**
 * Format timestamp.
 */
function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Never synced";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

/**
 * Format category.
 */
function formatCategory(
  category: string | null
): string {
  if (!category) {
    return "Facebook Page";
  }

  return category;
}

/**
 * Format sync status.
 */
function formatSyncStatus(
  status: string
): string {
  switch (status) {
    case "synced":
      return "Synced";

    case "stale":
      return "Stale";

    case "pending":
      return "Pending";

    default:
      return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
  }
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
  status,
}: {
  status: PageStatus;
}) {
  if (status === "syncing") {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400"
      >
        <RefreshCw className="h-3 w-3 animate-spin" />

        Syncing
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5 border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10"
      >
        <AlertCircle className="h-3 w-3" />

        Sync error
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />

      Connected
    </Badge>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  valueClassName,
}: {
  icon: typeof Link2;
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
}) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {label}
            </p>

            <p
              className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${
                valueClassName ?? ""
              }`}
            >
              {value}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/*
|--------------------------------------------------------------------------
| Skeleton
|--------------------------------------------------------------------------
*/

function PageSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({
        length: 2,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-4 py-5 sm:px-5"
        >
          <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />

          <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-muted" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />

            <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          </div>

          <div className="hidden space-y-2 sm:block">
            <div className="ml-auto h-3 w-20 animate-pulse rounded bg-muted" />

            <div className="ml-auto h-3 w-24 animate-pulse rounded bg-muted" />
          </div>

          <div className="h-6 w-10 animate-pulse rounded-full bg-muted" />

          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function FacebookPagesConnect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * Page-specific Facebook state.
   *
   * This hook owns:
   * - connected pages
   * - summary
   * - loading
   * - connecting
   * - monitoring update
   * - page synchronization
   * - disconnect
   */
  const {
    pages,
    summary,
    isLoading,
    isConnecting,
    updatingPageId,
    syncingPageId,
    disconnectingPageId,
    connect,
    getPages,
    updateMonitoring,
    syncPage,
    disconnect,
  } = useFacebookPages();

  /*
   * UI-only state.
   *
   * This does NOT belong inside the Facebook API hook.
   */
  const [
    expandedId,
    setExpandedId,
  ] = useState<string | null>(
    null
  );

  const user = useSelector(
    (state: RootState) =>
      state.auth.user
  );

  const security = useSelector(
    (state: RootState) =>
      state.auth.security
  );

  /*
  |--------------------------------------------------------------------------
  | MFA State
  |--------------------------------------------------------------------------
  */

  const mfaEnabled =
    user?.mfa_enabled ?? false;

  const mfaRequired =
    security?.require_two_factor ?? false;

  /*
  |--------------------------------------------------------------------------
  | Facebook OAuth Result
  |--------------------------------------------------------------------------
  |
  | Laravel redirects to:
  |
  | /{locale}/dashboard/facebook/pages
  |   ?facebook=success
  |   &message=...
  |
  | After displaying the notification,
  | remove the OAuth query parameters.
  |
  */

  useEffect(() => {
    const facebookStatus =
      searchParams.get("facebook");

    const message =
      searchParams.get("message");

    if (!facebookStatus) {
      return;
    }

    if (
      facebookStatus === "success" &&
      message
    ) {
      toast.success(message);
    } else if (
      facebookStatus === "error" &&
      message
    ) {
      toast.error(message);
    }

    router.replace(pathname);
  }, [
    searchParams,
    router,
    pathname,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load Pages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void getPages();
  }, [getPages]);

  /*
  |--------------------------------------------------------------------------
  | Derived Values
  |--------------------------------------------------------------------------
  */

  const totalReach = pages
    .filter(
      (page) =>
        page.is_active
    )
    .reduce(
      (total, page) =>
        total +
        (page.followers_count ?? 0),
      0
    );

  /*
  |--------------------------------------------------------------------------
  | Locale
  |--------------------------------------------------------------------------
  */

  const locale =
    pathname.split("/")[1] ||
    "or";

  /*
  |--------------------------------------------------------------------------
  | Manage Posts
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | page.facebook_page_id
  |     = external Meta Page ID
  |
  | page.id
  |     = internal Laravel UUID
  |
  | The posts route is intentionally using
  | facebook_page_id because that is the identifier
  | expected by the Facebook page API route.
  |
  */

  function handleManagePosts(
    facebookPageId: string
  ) {
    router.push(
      `/${locale}/dashboard/facebook/pages/${facebookPageId}/posts`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Monitoring
  |--------------------------------------------------------------------------
  */

  async function handleMonitoringChange(
    facebookPageId: string,
    checked: boolean
  ) {
    try {
      await updateMonitoring(
        facebookPageId,
        checked
      );
    } catch {
      /*
       * Notification is handled by the hook.
       */
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Sync
  |--------------------------------------------------------------------------
  */

  async function handleSync(
    facebookPageId: string
  ) {
    try {
      await syncPage(
        facebookPageId
      );
    } catch {
      /*
       * Notification is handled by the hook.
       */
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Disconnect
  |--------------------------------------------------------------------------
  */

  async function handleDisconnect(
    facebookPageId: string,
    localPageId: string
  ) {
    try {
      await disconnect(
        facebookPageId
      );

      /*
       * expandedId is UI state and uses
       * the local Laravel UUID.
       */
      setExpandedId(
        (currentId) =>
          currentId === localPageId
            ? null
            : currentId
      );
    } catch {
      /*
       * Notification is handled by the hook.
       */
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Toggle Details
  |--------------------------------------------------------------------------
  */

  function toggleDetails(
    localPageId: string
  ) {
    setExpandedId(
      (currentId) =>
        currentId === localPageId
          ? null
          : localPageId
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Initial Loading
  |--------------------------------------------------------------------------
  */

  if (
    isLoading &&
    pages.length === 0
  ) {
    return (
      <div className="container m-auto max-w-4xl py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-background shadow-sm">
                <FaFacebookF className="h-3.5 w-3.5 text-blue-600" />
              </div>

              Facebook Intelligence
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Connected Pages
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Connect Facebook Pages and select which
              Pages should be monitored for public
              sentiment intelligence.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div className="space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />

                    <div className="h-7 w-16 animate-pulse rounded bg-muted" />

                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  </div>

                  <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />

              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <PageSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="container m-auto max-w-4xl py-8 sm:py-10">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-background shadow-sm">
              <FaFacebookF className="h-3.5 w-3.5 text-blue-600" />
            </div>

            <span>
              Facebook Intelligence
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Connected Pages
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Connect Facebook Pages and select which
            Pages should be monitored for public
            sentiment intelligence.
          </p>
        </div>

        <Button
          type="button"
          onClick={connect}
          disabled={isConnecting}
          className="w-full shrink-0 sm:w-auto"
        >
          {isConnecting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          {isConnecting
            ? "Connecting..."
            : "Connect Page"}
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MFA                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="pt-5 md:pt-10">
        <MfaSecurityBanner
          mfaRequired={mfaRequired}
          mfaEnabled={mfaEnabled}
          onSetup={() =>
            router.push(
              `/${locale}/dashboard/user-settings/mfa`
            )
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Overview                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Link2}
          label="Connected Pages"
          value={summary.total}
          description={
            summary.total === 1
              ? "Facebook Page connected"
              : "Facebook Pages connected"
          }
        />

        <StatCard
          icon={Check}
          label="Monitoring"
          value={summary.monitoring}
          description={
            summary.monitoring === 1
              ? "Page currently monitored"
              : "Pages currently monitored"
          }
          valueClassName="text-primary"
        />

        <StatCard
          icon={Users}
          label="Monitored Reach"
          value={formatCompactNumber(
            totalReach
          )}
          description="Combined followers of monitored Pages"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pages Card                                                         */}
      {/* ------------------------------------------------------------------ */}

      <Card className="mt-6 overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base">
                Your Facebook Pages
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {summary.total}{" "}
                {summary.total === 1
                  ? "Page"
                  : "Pages"}{" "}
                connected
                {" · "}
                {summary.monitoring}{" "}
                monitoring
              </p>
            </div>

            {isLoading && (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* -------------------------------------------------------------- */}
          {/* Empty State                                                    */}
          {/* -------------------------------------------------------------- */}

          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-muted/40 shadow-sm">
                <FaFacebookF className="h-6 w-6 text-blue-600" />
              </div>

              <h3 className="mt-5 text-sm font-semibold">
                No Facebook Pages connected
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Connect a Facebook Page to begin collecting
                public sentiment intelligence.
              </p>

              <Button
                type="button"
                onClick={connect}
                disabled={isConnecting}
                className="mt-5"
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {isConnecting
                  ? "Connecting..."
                  : "Connect Page"}
              </Button>
            </div>
          ) : (
            <div>
              {pages.map(
                (page, index) => {
                  /*
                   * Local Laravel UUID.
                   *
                   * Used only for:
                   * - React key
                   * - expanded state
                   * - hook loading state
                   */
                  const localPageId =
                    page.id;

                  /*
                   * External Meta Page ID.
                   *
                   * Used for Facebook API operations.
                   */
                  const facebookPageId =
                    page.facebook_page_id;

                  const isUpdating =
                    updatingPageId ===
                    facebookPageId;

                  const isSyncing =
                    syncingPageId ===
                    facebookPageId;

                  const isDisconnecting =
                    disconnectingPageId ===
                    facebookPageId;

                  const isExpanded =
                    expandedId ===
                    localPageId;

                  const syncStatus =
                    page.sync.status;

                  const status: PageStatus =
                    isSyncing
                      ? "syncing"
                      : syncStatus ===
                          "stale"
                        ? "error"
                        : "connected";

                  return (
                    <div
                      key={localPageId}
                    >
                      {index > 0 && (
                        <Separator />
                      )}

                      {/* ------------------------------------------------ */}
                      {/* Page Row                                           */}
                      {/* ------------------------------------------------ */}

                      <div
                        className={`transition-colors ${
                          isExpanded
                            ? "bg-muted/20"
                            : "hover:bg-muted/10"
                        }`}
                      >
                        <div className="px-4 py-4 sm:px-5 sm:py-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            {/* ---------------------------------------- */}
                            {/* Page Information                           */}
                            {/* ---------------------------------------- */}

                            <button
                              type="button"
                              onClick={() =>
                                toggleDetails(
                                  localPageId
                                )
                              }
                              aria-expanded={
                                isExpanded
                              }
                              aria-controls={`facebook-page-details-${localPageId}`}
                              aria-label={
                                isExpanded
                                  ? `Hide details for ${page.name}`
                                  : `View details for ${page.name}`
                              }
                              className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {/* Expand */}

                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    isExpanded
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>

                              {/* Avatar */}

                              <Avatar className="h-11 w-11 shrink-0 rounded-lg">
                                <AvatarFallback
                                  className={`rounded-lg font-semibold ${
                                    page.is_active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {getInitials(
                                    page.name
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              {/* Information */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold">
                                    {page.name}
                                  </p>

                                  <StatusBadge
                                    status={
                                      status
                                    }
                                  />
                                </div>

                                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                                  <span className="truncate">
                                    {formatCategory(
                                      page.category
                                    )}
                                  </span>

                                  {page.followers_count !==
                                    null && (
                                    <>
                                      <span>
                                        ·
                                      </span>

                                      <span className="shrink-0">
                                        {formatCompactNumber(
                                          page.followers_count
                                        )}{" "}
                                        followers
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* ---------------------------------------- */}
                            {/* Controls                                   */}
                            {/* ---------------------------------------- */}

                            <div className="flex items-center justify-between gap-2 pl-10 lg:justify-end lg:pl-0">
                              {/* -------------------------------------- */}
                              {/* Manage Posts                             */}
                              {/* -------------------------------------- */}

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleManagePosts(
                                    facebookPageId
                                  )
                                }
                                disabled={
                                  isDisconnecting
                                }
                                className="hidden shrink-0 gap-2 sm:inline-flex"
                              >
                                <FileText className="h-4 w-4" />

                                Manage Posts
                              </Button>

                              {/* -------------------------------------- */}
                              {/* Mobile Manage Posts                     */}
                              {/* -------------------------------------- */}

                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleManagePosts(
                                    facebookPageId
                                  )
                                }
                                disabled={
                                  isDisconnecting
                                }
                                className="h-8 w-8 shrink-0 sm:hidden"
                                aria-label={`Manage posts for ${page.name}`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>

                              {/* -------------------------------------- */}
                              {/* Desktop Monitoring Status               */}
                              {/* -------------------------------------- */}

                              <div className="hidden text-right lg:block">
                                <p className="text-xs font-medium">
                                  {isUpdating
                                    ? "Updating..."
                                    : page.is_active
                                      ? "Monitoring"
                                      : "Not monitoring"}
                                </p>

                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  Sentiment analysis
                                </p>
                              </div>

                              {/* -------------------------------------- */}
                              {/* Mobile Status                           */}
                              {/* -------------------------------------- */}

                              <div className="sm:hidden">
                                <Badge
                                  variant="outline"
                                  className="gap-1.5 text-[11px]"
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      page.is_active
                                        ? "bg-primary"
                                        : "bg-muted-foreground"
                                    }`}
                                  />

                                  {page.is_active
                                    ? "Monitoring"
                                    : "Off"}
                                </Badge>
                              </div>

                              {/* -------------------------------------- */}
                              {/* Monitoring Switch                       */}
                              {/* -------------------------------------- */}

                              <Switch
                                checked={
                                  page.is_active
                                }
                                disabled={
                                  isUpdating ||
                                  isDisconnecting
                                }
                                onCheckedChange={(
                                  checked
                                ) =>
                                  void handleMonitoringChange(
                                    facebookPageId,
                                    checked
                                  )
                                }
                                aria-label={
                                  page.is_active
                                    ? `Stop monitoring ${page.name}`
                                    : `Start monitoring ${page.name}`
                                }
                              />

                              {/* -------------------------------------- */}
                              {/* Secondary Actions                        */}
                              {/* -------------------------------------- */}

                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    disabled={
                                      isDisconnecting
                                    }
                                    aria-label={`Actions for ${page.name}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  {/* View / Hide Details */}

                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleDetails(
                                        localPageId
                                      )
                                    }
                                  >
                                    {isExpanded ? (
                                      <EyeOff className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Eye className="mr-2 h-4 w-4" />
                                    )}

                                    {isExpanded
                                      ? "Hide details"
                                      : "View details"}
                                  </DropdownMenuItem>

                                  {/* Sync */}

                                  <DropdownMenuItem
                                    disabled={
                                      isSyncing ||
                                      isDisconnecting
                                    }
                                    onClick={() =>
                                      void handleSync(
                                        facebookPageId
                                      )
                                    }
                                  >
                                    <RefreshCw
                                      className={`mr-2 h-4 w-4 ${
                                        isSyncing
                                          ? "animate-spin"
                                          : ""
                                      }`}
                                    />

                                    {isSyncing
                                      ? "Synchronizing..."
                                      : "Sync now"}
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Disconnect */}

                                  <DropdownMenuItem
                                    disabled={
                                      isDisconnecting
                                    }
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() =>
                                      void handleDisconnect(
                                        facebookPageId,
                                        localPageId
                                      )
                                    }
                                  >
                                    <Unplug className="mr-2 h-4 w-4" />

                                    {isDisconnecting
                                      ? "Disconnecting..."
                                      : "Disconnect"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/* Expanded Details                               */}
                          {/* ------------------------------------------------ */}

                          {isExpanded && (
                            <div
                              id={`facebook-page-details-${localPageId}`}
                              className="mt-4 ml-0 overflow-hidden rounded-xl border bg-background shadow-sm lg:ml-10"
                            >
                              {/* Detail Header */}

                              <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                      <Eye className="h-3.5 w-3.5" />
                                    </div>

                                    <p className="text-sm font-semibold">
                                      Page details
                                    </p>
                                  </div>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Connection and synchronization
                                    information
                                  </p>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleDetails(
                                      localPageId
                                    )
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <EyeOff className="h-4 w-4" />

                                  Hide details
                                </Button>
                              </div>

                              {/* Details Grid */}

                              <div className="grid gap-px bg-border sm:grid-cols-2">
                                {/* Page ID */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Page ID
                                  </p>

                                  <p className="mt-1.5 break-all font-mono text-xs text-foreground">
                                    {
                                      page.facebook_page_id
                                    }
                                  </p>
                                </div>

                                {/* Category */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Category
                                  </p>

                                  <p className="mt-1.5 text-sm font-medium">
                                    {formatCategory(
                                      page.category
                                    )}
                                  </p>
                                </div>

                                {/* Followers */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Followers
                                  </p>

                                  <p className="mt-1.5 text-sm font-semibold tabular-nums">
                                    {formatNumber(
                                      page.followers_count
                                    )}
                                  </p>
                                </div>

                                {/* Monitoring */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Monitoring
                                  </p>

                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        page.is_active
                                          ? "bg-emerald-500"
                                          : "bg-muted-foreground"
                                      }`}
                                    />

                                    <p className="text-sm font-medium">
                                      {page.is_active
                                        ? "Enabled"
                                        : "Disabled"}
                                    </p>
                                  </div>
                                </div>

                                {/* Synchronization */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Synchronization
                                  </p>

                                  <div className="mt-1.5 flex items-center gap-2">
                                    {syncStatus ===
                                      "synced" && (
                                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    )}

                                    {syncStatus ===
                                      "stale" && (
                                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    )}

                                    {syncStatus ===
                                      "pending" && (
                                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                    )}

                                    <p className="text-sm font-medium">
                                      {formatSyncStatus(
                                        syncStatus
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Last Synced */}

                                <div className="bg-background p-4">
                                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    <Clock3 className="h-3 w-3" />

                                    Last synced
                                  </p>

                                  <p className="mt-1.5 text-sm font-medium">
                                    {formatDateTime(
                                      page.sync
                                        .last_synced_at
                                    )}
                                  </p>
                                </div>

                                {/* Connection */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Connection
                                  </p>

                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                    <p className="text-sm font-medium capitalize">
                                      {
                                        page
                                          .connection
                                          .status
                                      }
                                    </p>
                                  </div>
                                </div>

                                {/* Token */}

                                <div className="bg-background p-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Token expiration
                                  </p>

                                  <p className="mt-1.5 text-sm font-medium">
                                    {page
                                      .connection
                                      .page_access_token_expires_at
                                      ? formatDateTime(
                                          page
                                            .connection
                                            .page_access_token_expires_at
                                        )
                                      : "Not provided by Meta"}
                                  </p>
                                </div>
                              </div>

                              {/* Categories */}

                              {page.category_list
                                .length >
                                0 && (
                                <div className="border-t px-4 py-4">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Page categories
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {page.category_list.map(
                                      (
                                        category,
                                        categoryIndex
                                      ) => (
                                        <Badge
                                          key={
                                            category.id ??
                                            `${category.name ?? "category"}-${categoryIndex}`
                                          }
                                          variant="outline"
                                          className="font-normal"
                                        >
                                          {category.name ??
                                            "Category"}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Detail Footer */}

                              <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-2">
                                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                  <p className="max-w-xl text-xs leading-5 text-muted-foreground">
                                    Access tokens are managed
                                    securely on the server and
                                    are never exposed to the
                                    browser.
                                  </p>
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    isSyncing ||
                                    isDisconnecting
                                  }
                                  onClick={() =>
                                    void handleSync(
                                      facebookPageId
                                    )
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <RefreshCw
                                    className={`h-4 w-4 ${
                                      isSyncing
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />

                                  {isSyncing
                                    ? "Synchronizing..."
                                    : "Synchronize"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}

        {pages.length > 0 && (
          <CardFooter className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Page access is securely managed through Meta.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={connect}
              disabled={isConnecting}
              className="w-full sm:w-auto"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {isConnecting
                ? "Connecting..."
                : "Connect another page"}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Security Note                                                      */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-5 flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

        <div className="min-w-0">
          <p className="text-xs font-medium">
            Secure Facebook integration
          </p>

          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Facebook Page access tokens remain server-side.
            They are not returned by the API or exposed in
            the browser.
          </p>
        </div>
      </div>
    </div>
  );
}