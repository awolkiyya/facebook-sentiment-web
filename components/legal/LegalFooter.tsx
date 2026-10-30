
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/app/[locale]/page";

export interface LegalFooterLink {
  label: string;
  href: string;
}

interface LegalFooterProps {
  brandName?: string;
  brandDescription?: string;
  copyrightName?: string;
  contactEmail?: string;
  links?: LegalFooterLink[];
}

const defaultLinks: LegalFooterLink[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Data Deletion", href: "/data-deletion" },
];

export default function LegalFooter({
  brandName = "CivicPulse",
  brandDescription = "Adama City Social Intelligence",
  copyrightName = "Adama City Administration",
  contactEmail = "privacy@yourdomain.com",
  links = defaultLinks,
}: LegalFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
         <BrandMark/>

          {/* Legal links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <Mail className="h-4 w-4" />
            Contact
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {copyrightName}. All rights reserved.
          </p>

          <p>
            Built for transparency, accountability, and public trust.
          </p>
        </div>
      </div>
    </footer>
  );
}
