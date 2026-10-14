"use client";

import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileBarChart,
  Globe2,
  MessageSquareText,
} from "lucide-react";
import { useRouter } from "next/navigation";

import MayorFacebookAnalyticsBanner from "@/components/MayorFacebookAnalyticsBanner";
import MfaSecurityBanner from "@/components/MfaSecurityBanner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";



interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | AUTH STATE
  |--------------------------------------------------------------------------
  |
  | User information and security policy are stored separately.
  |
  */

  const user = useSelector(
    (state:RootState) => state.auth.user
  );

  const security = useSelector(
    (state:RootState) => state.auth.security
  );

  /*
  |--------------------------------------------------------------------------
  | MFA STATE
  |--------------------------------------------------------------------------
  |
  | user.mfa_enabled
  |     -> Whether the user has configured MFA.
  |
  | security.require_two_factor
  |     -> Whether the system requires MFA.
  |
  | security.mfa_setup_required
  |     -> Whether this user needs to configure MFA.
  |
  */

  const mfaEnabled =
    user?.mfa_enabled ?? false;

  const mfaRequired =
    security?.require_two_factor ?? false;

  const mfaSetupRequired =
    security?.mfa_setup_required ?? false;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* =====================================================
          Security and Facebook connection banners
      ===================================================== */}

      <div className="space-y-3">
        <MfaSecurityBanner
          mfaRequired={mfaRequired}
          mfaEnabled={mfaEnabled}
          onSetup={() =>
            router.push("/or/dashboard/user-settings/mfa")
          }
        />

        <MayorFacebookAnalyticsBanner
          onConnect={() =>
            router.push("/or/settings/facebook")
          }
        />
      </div>

      {/* =====================================================
          Quick actions
      ===================================================== */}

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">
            Quick actions
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Access the tools you use most often.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <QuickAction
            title="Facebook Pages"
            description="Manage connected pages"
            icon={Globe2}
            onClick={() =>
              router.push(
                "/or/dashboard/facebook/pages"
              )
            }
          />

          {/* <QuickAction
            title="Sentiment Analysis"
            description="Review public sentiment"
            icon={MessageSquareText}
            onClick={() =>
              router.push(
                "/or/dashboard/ai/sentiment"
              )
            }
          /> */}

          <QuickAction
            title="AI Insights"
            description="Explore key findings"
            icon={BrainCircuit}
            onClick={() =>
              router.push(
                "/or/dashboard/ai/insights"
              )
            }
          />

          <QuickAction
            title="Reports"
            description="View analytics reports"
            icon={FileBarChart}
            onClick={() =>
              router.push(
                "/or/dashboard/reports"
              )
            }
          />
        </div>
      </section>

      {/* =====================================================
          Optional dashboard overview placeholder
      ===================================================== */}

      <section className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>

        <h2 className="mt-3 text-sm font-semibold">
          Analytics overview
        </h2>

        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
          Your Facebook activity, sentiment trends, and
          public feedback summaries will appear here once
          a Page is connected.
        </p>
      </section>
    </div>
  );
}
