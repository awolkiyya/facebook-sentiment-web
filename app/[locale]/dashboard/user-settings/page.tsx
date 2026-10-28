"use client";

import { RootState } from "@/lib/store/store";
import {
  Bell,
  ChevronRight,
  KeyRound,
  LogOut,
  Monitor,
  ShieldCheck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";


interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}

function SettingItem({
  icon: Icon,
  title,
  description,
  value,
  onClick,
  danger = false,
}: SettingItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
          danger
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            danger
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {title}
        </p>

        {description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {value && (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {value}
        </span>
      )}

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="divide-y">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function UserSettingsPage() {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | AUTH STATE
  |--------------------------------------------------------------------------
  */

  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  const security = useSelector(
    (state: RootState) => state.auth.security
  );

  /*
  |--------------------------------------------------------------------------
  | MFA STATE
  |--------------------------------------------------------------------------
  */

  const mfaEnabled =
    user?.mfa_enabled ?? false;

  const mfaRequired =
    security?.require_two_factor ?? false;

  /*
  |--------------------------------------------------------------------------
  | MFA DISPLAY
  |--------------------------------------------------------------------------
  */

  const mfaStatus = mfaEnabled
    ? "Enabled"
    : mfaRequired
      ? "Required"
      : "Not configured";

  const mfaDescription = mfaEnabled
    ? "Two-factor authentication is enabled"
    : mfaRequired
      ? "Set up two-factor authentication to secure your account"
      : "Protect your account with an authenticator app";

  const goTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* =====================================================
          Header
      ===================================================== */}

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Account Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and security preferences.
        </p>
      </div>

      {/* =====================================================
          Profile Summary
      ===================================================== */}

      <section className="flex items-center gap-4 rounded-lg border bg-card px-4 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {user?.name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "U"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {user?.name ?? "Account User"}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {user?.email ?? "user@example.com"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            goTo("/or/settings/profile")
          }
          className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          Edit profile
        </button>
      </section>

      {/* =====================================================
          Profile
      ===================================================== */}

      <SettingsGroup title="Profile">
        <SettingItem
          icon={User}
          title="Personal information"
          description="Name, phone number, and profile details"
          onClick={() =>
            goTo("/or/settings/profile")
          }
        />
      </SettingsGroup>

      {/* =====================================================
          Security
      ===================================================== */}

      <SettingsGroup title="Security">
        <SettingItem
          icon={KeyRound}
          title="Password"
          description="Change your account password"
          onClick={() =>
            goTo("/or/settings/security/password")
          }
        />

        {(mfaRequired || mfaEnabled) && (
          <SettingItem
            icon={ShieldCheck}
            title="Two-factor authentication"
            description={mfaDescription}
            value={mfaStatus}
            onClick={() =>
              goTo("/or/dashboard/user-settings/mfa")
            }
          />
        )}

        <SettingItem
          icon={Monitor}
          title="Active sessions"
          description="Review devices signed in to your account"
          onClick={() =>
            goTo("/or/settings/security/sessions")
          }
        />
      </SettingsGroup>

      {/* =====================================================
          Preferences
      ===================================================== */}

      <SettingsGroup title="Preferences">
        <SettingItem
          icon={Bell}
          title="Notifications"
          description="Manage your notification preferences"
          onClick={() =>
            goTo("/or/settings/notifications")
          }
        />

        <SettingItem
          icon={Monitor}
          title="Appearance"
          description="Choose how the application looks"
          value="System"
          onClick={() =>
            goTo("/or/settings/preferences")
          }
        />
      </SettingsGroup>

      {/* =====================================================
    Legal & Privacy
===================================================== */}

<SettingsGroup title="Legal & Privacy">
  <SettingItem
    icon={ShieldCheck}
    title="Privacy Policy"
    description="Learn how CivicPulse handles your information"
    onClick={() => goTo("/privacy-policy")}
  />

  <SettingItem
    icon={ShieldCheck}
    title="Data Deletion"
    description="Learn how to request deletion of your data"
    onClick={() => goTo("/data-deletion")}
  />

  <SettingItem
    icon={ShieldCheck}
    title="Terms of Service"
    description="Review the rules for using CivicPulse"
    onClick={() => goTo("/terms")}
  />
</SettingsGroup>

      {/* =====================================================
          Sign out
      ===================================================== */}

      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            // Connect to Laravel logout endpoint.
            console.log("Sign out");
          }}
          className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-destructive/30 hover:bg-destructive/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <LogOut className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium text-destructive">
              Sign out
            </p>

            <p className="text-xs text-muted-foreground">
              Sign out of your current session
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
