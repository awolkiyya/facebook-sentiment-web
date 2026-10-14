"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

interface MfaSecurityBannerProps {
  mfaRequired?: boolean;
  mfaEnabled?: boolean;
  onSetup?: () => void;
}

export default function MfaSecurityBanner({
  mfaRequired = true,
  mfaEnabled = false,
  onSetup,
}: MfaSecurityBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!mfaRequired || mfaEnabled || dismissed) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-visible rounded-lg border bg-card"
    >
      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Set up two-factor authentication
          </p>

          <p className="text-xs text-muted-foreground">
            Add extra security to your account.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={() =>
            onSetup
              ? onSetup()
              : (window.location.href = "/or/settings/security/mfa")
          }
          whileTap={{ scale: 0.98 }}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Set up MFA
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.section>
  );
}