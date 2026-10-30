
import type { LucideIcon } from "lucide-react";

interface LegalSectionProps {
  id: string;
  number: string | number;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  description?: string;
}

export default function LegalSection({
  id,
  number,
  title,
  icon: Icon,
  children,
  description,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-28 border-b border-border py-9 first:pt-0 last:border-b-0"
    >
      {/* Section heading */}
      <div className="mb-6 flex items-start gap-4">
        {/* Icon container */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary transition-colors">
          <Icon className="size-5" aria-hidden="true" />
        </div>

        {/* Heading content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.14em] text-primary">
              SECTION {String(number).padStart(2, "0")}
            </span>
          </div>

          <h2
            id={`${id}-heading`}
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {title}
          </h2>

          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Section content */}
      <div
        className="
          pl-0 text-sm leading-8 text-muted-foreground
          sm:pl-[3.75rem] sm:text-[15px]

          [&_a]:font-medium
          [&_a]:text-primary
          [&_a]:underline
          [&_a]:underline-offset-4
          [&_a]:decoration-primary/40
          [&_a:hover]:decoration-primary

          [&_h3]:mb-3
          [&_h3]:mt-7
          [&_h3]:text-base
          [&_h3]:font-semibold
          [&_h3]:tracking-tight
          [&_h3]:text-foreground

          [&_li]:pl-1
          [&_li::marker]:text-primary

          [&_ol]:my-4
          [&_ol]:list-decimal
          [&_ol]:space-y-2
          [&_ol]:pl-6

          [&_p]:mb-4
          [&_p:last-child]:mb-0

          [&_strong]:font-semibold
          [&_strong]:text-foreground

          [&_ul]:my-4
          [&_ul]:list-disc
          [&_ul]:space-y-2
          [&_ul]:pl-6

          [&_blockquote]:my-5
          [&_blockquote]:rounded-r-lg
          [&_blockquote]:border-l-2
          [&_blockquote]:border-primary/40
          [&_blockquote]:bg-muted/40
          [&_blockquote]:px-4
          [&_blockquote]:py-3

          [&_code]:rounded-md
          [&_code]:bg-muted
          [&_code]:px-1.5
          [&_code]:py-0.5
          [&_code]:font-mono
          [&_code]:text-xs
          [&_code]:text-foreground
        "
      >
        {children}
      </div>
    </section>
  );
}
