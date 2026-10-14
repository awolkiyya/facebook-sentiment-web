"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldAlert,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DotField } from "@/components/design/DotField";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason");

  const getContent = () => {
    switch (reason) {
      case "not_authenticated":
        return {
          icon: Lock,
          title: "Sign in required",
          message:
            "Please sign in to your account to access this page.",
        };

      case "invalid_role":
        return {
          icon: UserX,
          title: "Access unavailable",
          message:
            "Your account is not configured to access this system.",
        };

      case "access_denied":
        return {
          icon: ShieldAlert,
          title: "Access restricted",
          message:
            "You do not have permission to access this resource.",
        };

      default:
        return {
          icon: ShieldAlert,
          title: "Access restricted",
          message:
            "You do not have permission to access this page.",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <DotField />

      <div className="relative z-10 w-full max-w-md">
        

        {/* Card */}
        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>

          {/* Message */}
          <h1 className="text-xl font-semibold tracking-tight">
            {content.title}
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {content.message}
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {reason === "not_authenticated" ? (
              <Link href="/auth/login">
                <Button className="w-full gap-2 sm:w-auto">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button className="w-full gap-2 sm:w-auto">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Adama City Administration
        </p>
      </div>
    </main>
  );
}