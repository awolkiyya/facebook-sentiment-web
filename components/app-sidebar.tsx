"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { FaFacebookF } from "react-icons/fa";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NavItem } from "@/types/commen";
import { PermissionAction } from "@/types/user";

import { RootState } from "@/lib/store/store";

import { usePermission } from "@/hooks/usePermission";
import { NAV_ITEMS } from "@/configs/navConfig";

/* =====================================================
   TYPES

   NavItem stays the source of truth. The optional
   `section` field is read defensively so navConfig can
   adopt it one entry at a time.
===================================================== */

type SectionedNavItem = NavItem & {
  section?: string;
};

export type ConnectedPage = {
  id: string;
  name: string;
  avatarUrl?: string;
  /** Followers, posts tracked, whatever the page is scoped by. */
  meta?: string;
};

type Can = (resource: string, action: PermissionAction) => boolean;

type Translate = (key: string) => string;

/* =====================================================
   SKELETON

   Mirrors the real layout: brand row, page switcher,
   search field, two nav sections. A skeleton that does
   not match what loads causes a visible jump on hydration.
===================================================== */

function SidebarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="animate-pulse space-y-5 p-2"
    >
      <span className="sr-only">Loading navigation</span>

      {/* Brand row */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="size-8 shrink-0 rounded-lg bg-sidebar-accent" />
        <div className="h-4 w-24 rounded bg-sidebar-accent" />
      </div>

      {/* Page switcher */}
      <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border p-2">
        <div className="size-8 shrink-0 rounded-lg bg-sidebar-accent" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-sidebar-accent" />
          <div className="h-2.5 w-16 rounded bg-sidebar-accent/60" />
        </div>
      </div>

      {/* Search */}
      <div className="h-8 w-full rounded-lg bg-sidebar-accent/50" />

      {/* Nav sections */}
      <div className="space-y-4">
        {[4, 3].map((count, section) => (
          <div key={section} className="space-y-1.5">
            <div className="ml-2 h-2 w-14 rounded bg-sidebar-accent/50" />

            {Array.from({ length: count }).map((_, row) => (
              <div
                key={row}
                className="h-8 w-full rounded-lg bg-sidebar-accent/40"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   AUTHORIZED NAVIGATION

   Groups survive only if at least one child survives.
   Pure, and memoized by the caller so it does not
   rebuild on every keystroke.
===================================================== */

function buildNav(items: NavItem[], can: Can, tNav: Translate): NavItem[] {
  return items
    .map((item): NavItem | null => {
      const children = item.items ? buildNav(item.items, can, tNav) : undefined;

      if (item.items) {
        if (!children?.length) {
          return null;
        }

        return {
          ...item,
          title: tNav(item.title),
          items: children,
        };
      }

      if (item.permission) {
        const authorized = can(
          item.permission.resource,
          item.permission.action,
        );

        if (!authorized) {
          return null;
        }
      }

      return {
        ...item,
        title: tNav(item.title),
      };
    })
    .filter((item): item is NavItem => item !== null);
}

/* =====================================================
   SEARCH FILTER

   Matches on the translated title. A group is kept when
   its own title matches (all children shown) or when any
   child matches (only those children shown).
===================================================== */

function filterNav(items: NavItem[], query: string): NavItem[] {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return items;
  }

  return items
    .map((item): NavItem | null => {
      const selfMatch = item.title.toLowerCase().includes(needle);

      if (!item.items) {
        return selfMatch ? item : null;
      }

      if (selfMatch) {
        return item;
      }

      const children = filterNav(item.items, needle);

      return children.length ? { ...item, items: children } : null;
    })
    .filter((item): item is NavItem => item !== null);
}

/* =====================================================
   SECTION GROUPING

   Items without a section fall into "general", which
   renders without a label. Order follows first
   appearance in navConfig, so the config file stays the
   single place where ordering lives.
===================================================== */

function groupBySection(
  items: NavItem[],
): Array<{ key: string; items: NavItem[] }> {
  const sections = new Map<string, NavItem[]>();

  for (const item of items) {
    const key = (item as SectionedNavItem).section ?? "general";

    const bucket = sections.get(key);

    if (bucket) {
      bucket.push(item);
    } else {
      sections.set(key, [item]);
    }
  }

  return Array.from(sections, ([key, sectionItems]) => ({
    key,
    items: sectionItems,
  }));
}

/* =====================================================
   BRAND ROW

   The CivicPulse mark and product name. In icon mode only
   the mark remains, centered in the rail.
===================================================== */

function BrandRow({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`${name} home`}
      className="
        flex h-10 items-center gap-2.5 rounded-lg px-1
        outline-none transition-colors
        hover:bg-sidebar-accent/60
        focus-visible:ring-2 focus-visible:ring-ring/50
        group-data-[collapsible=icon]:justify-center
        group-data-[collapsible=icon]:px-0
      "
    >
      <Image
        src="/icons/icon.png"
        alt=""
        width={32}
        height={32}
        priority
        className="size-8 shrink-0 object-contain"
      />

      <span
        className="
          truncate text-[15px] font-semibold tracking-tight
          group-data-[collapsible=icon]:hidden
        "
      >
        {name}
      </span>
    </Link>
  );
}

/* =====================================================
   PAGE AVATAR

   The page's own picture when we have one, otherwise its
   first letter on a themed tile.
===================================================== */

function PageAvatar({ page }: { page?: ConnectedPage }) {
  return (
    <div
      className="
        flex size-8 shrink-0 items-center justify-center overflow-hidden
        rounded-lg border border-sidebar-border bg-primary/10
        text-xs font-semibold text-primary
        group-data-[collapsible=icon]:-m-1 group-data-[collapsible=icon]:size-6
      "
    >
      {page?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.avatarUrl}
          alt=""
          className="size-full object-cover"
        />
      ) : page ? (
        page.name.slice(0, 1).toUpperCase()
      ) : (
        <FaFacebookF aria-hidden="true" className="size-3.5" />
      )}
    </div>
  );
}

/* =====================================================
   PAGE SWITCHER

   Every screen in a social analytics tool is scoped by one
   thing: which Facebook page you are looking at. It sits
   under the brand as a bordered selector, the way a
   workspace switcher does in other SaaS products.
===================================================== */

const SWITCHER_BUTTON =
  "h-auto rounded-xl border border-sidebar-border bg-card p-2 shadow-sm " +
  "hover:bg-sidebar-accent/60 " +
  "data-[state=open]:bg-sidebar-accent " +
  "group-data-[collapsible=icon]:border-transparent " +
  "group-data-[collapsible=icon]:bg-transparent " +
  "group-data-[collapsible=icon]:shadow-none";

function PageSwitcher({
  pages,
  activePage,
  onPageChange,
  productName,
}: {
  pages: ConnectedPage[];
  activePage?: ConnectedPage;
  onPageChange?: (pageId: string) => void;
  productName: string;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const identity = (
    <>
      <PageAvatar page={activePage} />

      <div className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">
          {activePage?.name ?? productName}
        </span>

        <span className="truncate text-[11px] text-muted-foreground">
          {activePage
            ? (activePage.meta ?? "Facebook page")
            : "No page connected"}
        </span>
      </div>
    </>
  );

  /* Nothing to switch between: render a plain identity
     block rather than a dropdown that opens onto one row. */

  if (pages.length <= 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip={activePage?.name ?? productName}
            className={`${SWITCHER_BUTTON} cursor-default`}
          >
            {identity}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={activePage?.name}
              className={SWITCHER_BUTTON}
            >
              {identity}

              <ChevronsUpDown
                aria-hidden="true"
                className="ml-auto size-4 shrink-0 text-muted-foreground"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side={collapsed ? "right" : "bottom"}
            sideOffset={6}
            className="w-64 rounded-xl"
          >
            <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
              Connected pages
            </DropdownMenuLabel>

            {pages.map((page) => {
              const active = page.id === activePage?.id;

              return (
                <DropdownMenuItem
                  key={page.id}
                  onSelect={() => onPageChange?.(page.id)}
                  className="gap-2.5 p-2"
                >
                  <PageAvatar page={page} />

                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm">{page.name}</span>

                    {page.meta ? (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {page.meta}
                      </span>
                    ) : null}
                  </div>

                  {active ? (
                    <Check
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                  ) : null}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2.5 p-2 text-sm">
              {/* Facebook's own mark keeps Facebook's own color */}
              <span className="flex size-6 items-center justify-center rounded-md border border-sidebar-border">
                <FaFacebookF
                  aria-hidden="true"
                  className="size-3 text-[#1877F2]"
                />
              </span>
              Connect another page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* =====================================================
   NAV SEARCH

   Hidden in icon mode, where there is nowhere to put it.
   Cmd/Ctrl + K focuses it.
===================================================== */

function NavSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

      if (shortcut) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative px-2 pb-1 group-data-[collapsible=icon]:hidden">
      <Search
        aria-hidden="true"
        className="
          pointer-events-none absolute left-4 top-1/2
          size-3.5 -translate-y-1/2 text-muted-foreground
        "
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onChange("");
          }
        }}
        placeholder="Find a screen"
        aria-label="Find a screen"
        className="
          h-8 w-full rounded-lg border border-sidebar-border
          bg-sidebar-accent/40 pl-8 pr-9 text-xs
          text-sidebar-foreground placeholder:text-muted-foreground
          outline-none transition-colors
          focus-visible:border-primary/50
          focus-visible:bg-background
          focus-visible:ring-2 focus-visible:ring-primary/20
        "
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            rounded p-0.5 text-muted-foreground
            hover:text-sidebar-foreground
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-primary/30
          "
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : (
        <kbd
          className="
            pointer-events-none absolute right-4 top-1/2
            -translate-y-1/2 rounded border border-sidebar-border
            bg-background px-1 text-[10px] font-medium
            text-muted-foreground/80
          "
        >
          ⌘K
        </kbd>
      )}
    </div>
  );
}

/* =====================================================
   SYNC STATUS

   A quiet line above the user menu. Cyan dot when fresh,
   red when the last sync is stale. Hidden in icon mode.
===================================================== */

function SyncStatus({ label, stale }: { label: string; stale: boolean }) {
  return (
    <div
      role="status"
      className="
        flex items-center gap-2 px-2 text-[11px] text-muted-foreground
        group-data-[collapsible=icon]:hidden
      "
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        {!stale ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-2/50" />
        ) : null}

        <span
          className={`relative inline-flex size-2 rounded-full ${
            stale ? "bg-destructive" : "bg-chart-2"
          }`}
        />
      </span>

      <span className="truncate">
        {stale ? "Sync delayed. Last synced " : "Last synced "}
        {label}
      </span>
    </div>
  );
}

/* =====================================================
   APP SIDEBAR
===================================================== */

export function AppSidebar({
  pages = [],
  activePageId,
  onPageChange,
  lastSyncedLabel = "just now",
  syncStale = false,
  homeHref = "/",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  pages?: ConnectedPage[];
  activePageId?: string;
  onPageChange?: (pageId: string) => void;
  lastSyncedLabel?: string;
  syncStale?: boolean;
  /** Where the logo links to. */
  homeHref?: string;
}) {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const { can } = usePermission();

  const tSystem = useTranslations("system");
  const tNav = useTranslations("navigation");

  const [query, setQuery] = React.useState("");

  /* Permission + translation pass. Rebuilds only when
     permissions or locale change, not on every keystroke. */

  const authorizedNav = React.useMemo(
    () => buildNav(NAV_ITEMS, can, tNav),
    [can, tNav],
  );

  const sections = React.useMemo(
    () => groupBySection(filterNav(authorizedNav, query)),
    [authorizedNav, query],
  );

  const activePage =
    pages.find((page) => page.id === activePageId) ?? pages[0];

  /* ===================================================
     LOADING
  =================================================== */

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="p-2">
          <SidebarSkeleton />
        </SidebarHeader>
      </Sidebar>
    );
  }

  if (!user) {
    return null;
  }

  const hasResults = sections.some((section) => section.items.length > 0);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-sidebar-border bg-background"
    >
      <SidebarHeader className="gap-3 border-b border-sidebar-border bg-background p-3">
        <BrandRow name={tSystem("title")} href={homeHref} />

        <PageSwitcher
          pages={pages}
          activePage={activePage}
          onPageChange={onPageChange}
          productName={tSystem("title")}
        />
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-background py-2">
        <div className="pb-1">
          <NavSearch value={query} onChange={setQuery} />
        </div>

        {hasResults ? (
          sections.map((section) => (
            <SidebarGroup key={section.key} className="py-1">
              {section.key !== "general" ? (
                <SidebarGroupLabel
                  className="
                    h-auto px-2 pb-1 pt-2 text-[11px]
                    font-medium text-sidebar-foreground/50
                  "
                >
                  {tNav(section.key)}
                </SidebarGroupLabel>
              ) : null}

              <NavMain items={section.items} />
            </SidebarGroup>
          ))
        ) : (
          <div className="px-4 py-6 text-center group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-muted-foreground">
              Nothing matches “{query.trim()}”.
            </p>

            <button
              type="button"
              onClick={() => setQuery("")}
              className="
                mt-2 rounded text-xs font-medium text-primary
                underline-offset-2 hover:underline
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-primary/30
              "
            >
              Show all screens
            </button>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border bg-background p-2">
        {activePage ? (
          <SyncStatus label={lastSyncedLabel} stale={syncStale} />
        ) : null}

        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}