
"use client";

import { useEffect, useState } from "react";
import { List, ArrowUpRight } from "lucide-react";

export interface LegalNavigationItem {
  id: string;
  title: string;
}

interface LegalNavigationProps {
  title?: string;
  sections: LegalNavigationItem[];
}

export default function LegalNavigation({
  title = "On this page",
  sections,
}: LegalNavigationProps) {
  const [activeSection, setActiveSection] = useState(
    sections[0]?.id ?? ""
  );

  useEffect(() => {
    if (sections.length === 0) return;

    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <aside className="sticky top-28 hidden self-start lg:block">
      <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm shadow-foreground/[0.02] backdrop-blur-sm">
        {/* Navigation header */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-primary">
              <List className="size-4" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {sections.length} sections
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="Table of contents"
          className="max-h-[calc(100vh-13rem)] overflow-y-auto p-3"
        >
          <ul className="space-y-1">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;

              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setActiveSection(section.id)}
                    className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                      isActive
                        ? "bg-primary/8 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary"
                      />
                    )}

                    {/* Section number */}
                    <span
                      className={`mt-0.5 min-w-5 text-[11px] font-semibold tabular-nums ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Section title */}
                    <span className="min-w-0 flex-1 leading-5">
                      {section.title}
                    </span>

                    {/* Active indicator icon */}
                    {isActive && (
                      <ArrowUpRight
                        className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Navigation footer */}
        <div className="border-t border-border px-5 py-3">
          <p className="text-[11px] leading-5 text-muted-foreground">
            Navigate through the document sections.
          </p>
        </div>
      </div>
    </aside>
  );
}
