"use client";

import { motion } from "framer-motion";
import { ArrowRight, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaFacebookF } from "react-icons/fa";

interface MayorFacebookAnalyticsBannerProps {
  onConnect?: () => void;
}

export default function MayorFacebookAnalyticsBanner({
  onConnect,
}: MayorFacebookAnalyticsBannerProps) {
  const router = useRouter();

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
      return;
    }

    router.push("/or/settings/facebook");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border bg-card"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
          <FaFacebookF className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Connect your Facebook Pages
          </p>

          <p className="text-xs text-muted-foreground">
            Connect pages to analyze posts, comments, and sentiment.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={handleConnect}
          whileTap={{ scale: 0.98 }}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Link2 className="h-3.5 w-3.5" />
          Connect
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.section>
  );
}
