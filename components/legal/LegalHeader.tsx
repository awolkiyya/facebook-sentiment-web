
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandMark } from "@/app/[locale]/page";

export interface LegalHeaderLink {
  label: string;
  href: string;
}

interface LegalHeaderProps {
  brandName?: string;
  brandDescription?: string;
  links?: LegalHeaderLink[];
  signInHref?: string;
}

const defaultLinks: LegalHeaderLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Data Deletion", href: "/data-deletion" },
  { label: "Terms of Service", href: "/terms" },
];

export default function LegalHeader({
  brandName = "CivicPulse",
  brandDescription = "Adama City Social Intelligence",
  links = defaultLinks,
  signInHref = "/login",
}: LegalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${brandName} home`}
        >
          <BrandMark/>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Legal navigation"
          className="hidden items-center gap-6 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-slate-100 px-5 py-3 md:hidden">
        <nav
          aria-label="Mobile legal navigation"
          className="flex items-center gap-5 overflow-x-auto"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
