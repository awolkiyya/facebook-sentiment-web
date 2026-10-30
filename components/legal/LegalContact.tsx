
import {
    ArrowRight,
    Mail,
    type LucideIcon,
  } from "lucide-react";
import Threads from "../Threads";
  
  interface LegalContactProps {
    eyebrow?: string;
    title?: string;
    description: string;
    email: string;
    buttonLabel?: string;
    icon?: LucideIcon;
  }
  
  export default function LegalContact({
    eyebrow = "NEED ASSISTANCE?",
    title = "Have questions?",
    description,
    email,
    buttonLabel = "Contact our team",
    icon: Icon = Mail,
  }: LegalContactProps) {
    const subject = encodeURIComponent("CivicPulse Legal Inquiry");
  
    return (
      <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
        {/* Background effects */}
        <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_92%)]"
      >
        <Threads
          color="#031937"
          lineCount={90}
          thickness={0.6}
          softness={1.3}
          amplitude={1.7}
          distance={0.4}
          waves={1.05}
          speed={0.6}
          split={0.04}
          fray={0.5}
          angle={25}
          taper={0.85}
          brightness={1.1}
          parting={0}
          enableMouseInteraction
          fade={0}
          opacity={0.32}
          seed={0}
        />
      </div>
  
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-primary">
              <Icon className="h-4 w-4" />
              {eyebrow}
            </div>
  
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
  
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
  
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex break-all text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {email}
            </a>
          </div>
  
          {/* Action */}
          <div className="shrink-0">
            <a
              href={`mailto:${email}?subject=${subject}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    );
  }
  