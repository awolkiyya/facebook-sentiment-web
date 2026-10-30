
import {
    CalendarDays,
    CheckCircle2,
    ShieldCheck,
    type LucideIcon,
  } from "lucide-react";
  
  interface LegalTrustStripProps {
    updatedAt?: string;
    message?: string;
    items?: {
      icon: LucideIcon;
      label: string;
    }[];
  }
  
  const defaultItems = [
    {
      icon: ShieldCheck,
      label: "Transparent data practices",
    },
    {
      icon: CheckCircle2,
      label: "Responsible platform use",
    },
  ];
  
  export default function LegalTrustStrip({
    updatedAt,
    message = "Committed to transparency, accountability, and responsible data protection.",
    items = defaultItems,
  }: LegalTrustStripProps) {
    return (
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Trust message */}
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
  
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Transparency and accountability
              </p>
  
              <p className="mt-1 max-w-xl text-xs leading-6 text-muted-foreground sm:text-sm">
                {message}
              </p>
            </div>
          </div>
  
          {/* Trust indicators and update date */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:justify-end">
            {items.map((item) => {
              const Icon = item.icon;
  
              return (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
                >
                  <Icon
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
              );
            })}
  
            {updatedAt && (
              <div className="inline-flex items-center gap-2 border-border text-xs font-medium text-muted-foreground sm:border-l sm:pl-5">
                <CalendarDays
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Updated{" "}
                  <span className="font-semibold text-foreground">
                    {updatedAt}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  