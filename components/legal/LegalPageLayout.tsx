
import type { ReactNode } from "react";

import LegalHeader from "@/components/legal/LegalHeader";
import LegalHero, {
  type LegalHeroAction,
} from "@/components/legal/LegalHero";
import LegalFooter from "@/components/legal/LegalFooter";
import LegalNavigation, {
  type LegalNavigationItem,
} from "@/components/legal/LegalNavigation";
import LegalTrustStrip from "@/components/legal/LegalTrustStrip";

interface LegalPageLayoutProps {
  eyebrow?: string;
  title: string;
  description: string;
  updatedAt?: string;

  sections: LegalNavigationItem[];
  children: ReactNode;

  heroActions?: LegalHeroAction[];

  contactEmail?: string;
  signInHref?: string;

  trustMessage?: string;
  showNavigation?: boolean;

  headerLinks?: {
    label: string;
    href: string;
  }[];

  footerLinks?: {
    label: string;
    href: string;
  }[];
}

export default function LegalPageLayout({
  eyebrow = "LEGAL & TRANSPARENCY",
  title,
  description,
  updatedAt,
  sections,
  children,
  heroActions = [],
  contactEmail = "privacy@yourdomain.com",
  signInHref = "/login",
  trustMessage,
  showNavigation = true,
  headerLinks,
  footerLinks,
}: LegalPageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Shared header */}
      <LegalHeader
        links={headerLinks}
        signInHref={signInHref}
      />

      {/* Page hero */}
      <LegalHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        updatedAt={updatedAt}
        backHref={signInHref}
        actions={heroActions}
      />

      {/* Trust and accountability strip */}
      <LegalTrustStrip
        updatedAt={updatedAt}
        message={
          trustMessage ??
          "Adama City Social Intelligence is committed to transparency, accountability, and responsible data practices."
        }
      />

      {/* Main content */}
      <main className="relative">
        {/* Subtle page background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-muted/20"
        />

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <div
            className={
              showNavigation
                ? "grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-16"
                : "mx-auto max-w-4xl"
            }
          >
            {/* Table of contents */}
            {showNavigation && (
              <aside className="min-w-0 lg:sticky lg:top-24">
                <LegalNavigation sections={sections} />
              </aside>
            )}

            {/* Legal document content */}
            <article className="min-w-0 rounded-2xl border border-border bg-card/70 p-5 shadow-sm shadow-foreground/[0.02] backdrop-blur-sm sm:p-8 lg:p-10">
              {children}
            </article>
          </div>
        </div>
      </main>

      {/* Shared footer */}
      <LegalFooter
        contactEmail={contactEmail}
        links={footerLinks}
      />
    </div>
  );
}
