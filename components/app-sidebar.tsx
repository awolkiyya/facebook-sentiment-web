"use client";

import * as React from "react";
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

   NavItem stays the source of truth. These two optional
   fields are read defensively so navConfig can adopt
   them one entry at a time.
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

type Can = (
  resource: string,
  action: PermissionAction,
) => boolean;

type Translate = (key: string) => string;

/* =====================================================
   SKELETON

   Mirrors the real layout: page switcher block, search
   field, two nav sections. A skeleton that doesn't match
   what loads causes a visible jump on hydration.
===================================================== */

function SidebarSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="animate-pulse space-y-6 p-2"
    >
      <span className="sr-only">
        Loading navigation
      </span>

      <div className="flex items-center gap-2.5 rounded-lg p-2">
        <div className="size-9 shrink-0 rounded-lg bg-sidebar-accent" />

        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded bg-sidebar-accent" />
          <div className="h-2.5 w-16 rounded bg-sidebar-accent/60" />
        </div>
      </div>

      <div className="h-8 w-full rounded-lg bg-sidebar-accent/50" />

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

   Unchanged in behaviour: groups survive only if at
   least one child survives. Now pure + memoized by the
   caller so it doesn't rebuild on every keystroke.
===================================================== */

function buildNav(
  items: NavItem[],
  can: Can,
  tNav: Translate,
): NavItem[] {
  return items
    .map((item): NavItem | null => {
      const children = item.items
        ? buildNav(item.items, can, tNav)
        : undefined;

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
    .filter(
      (item): item is NavItem => item !== null,
    );
}

/* =====================================================
   SEARCH FILTER

   Matches on the translated title. A group is kept when
   its own title matches (all children shown) or when any
   child matches (only those children shown).
===================================================== */

function filterNav(
  items: NavItem[],
  query: string,
): NavItem[] {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return items;
  }

  return items
    .map((item): NavItem | null => {
      const selfMatch = item.title
        .toLowerCase()
        .includes(needle);

      if (!item.items) {
        return selfMatch ? item : null;
      }

      if (selfMatch) {
        return item;
      }

      const children = filterNav(
        item.items,
        needle,
      );

      return children.length
        ? { ...item, items: children }
        : null;
    })
    .filter(
      (item): item is NavItem => item !== null,
    );
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
    const key =
      (item as SectionedNavItem).section ??
      "general";

    const bucket = sections.get(key);

    if (bucket) {
      bucket.push(item);
    } else {
      sections.set(key, [item]);
    }
  }

  return Array.from(
    sections,
    ([key, sectionItems]) => ({
      key,
      items: sectionItems,
    }),
  );
}

/* =====================================================
   PAGE SWITCHER

   The header carries the one thing every screen in a
   social analytics tool is scoped by: which Facebook
   page you're looking at. Product name sits underneath
   it, not above it.
===================================================== */

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

  const brandMark = (
    <div
      className="
        flex size-9 shrink-0 items-center justify-center
        rounded-lg bg-[#1877F2] text-white shadow-sm
      "
    >
      <FaFacebookF
        aria-hidden="true"
        className="size-4"
      />
    </div>
  );

  /* Nothing to switch between: render a plain identity
     block rather than a dropdown that opens onto one row. */

  if (pages.length <= 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="cursor-default hover:bg-transparent"
            tooltip={activePage?.name ?? productName}
          >
            {brandMark}

            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-semibold tracking-tight">
                {activePage?.name ?? productName}
              </span>

              <span className="truncate text-[11px] text-muted-foreground">
                {activePage ? productName : "No page connected"}
              </span>
            </div>
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
              className="
                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground
              "
            >
              {brandMark}

              <div className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-sm font-semibold tracking-tight">
                  {activePage?.name}
                </span>

                <span className="truncate text-[11px] text-muted-foreground">
                  {productName}
                </span>
              </div>

              <ChevronsUpDown
                aria-hidden="true"
                className="ml-auto size-4 opacity-60"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side={collapsed ? "right" : "bottom"}
            sideOffset={6}
            className="w-64 rounded-lg"
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
                  className="gap-2 p-2"
                >
                  <div
                    className="
                      flex size-6 shrink-0 items-center justify-center
                      overflow-hidden rounded-md border border-sidebar-border
                      bg-muted text-[10px] font-semibold
                    "
                  >
                    {page.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      page.name.slice(0, 1).toUpperCase()
                    )}
                  </div>

                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm">
                      {page.name}
                    </span>

                    {page.meta ? (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {page.meta}
                      </span>
                    ) : null}
                  </div>

                  {active ? (
                    <Check
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  ) : null}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2 text-sm">
              <FaFacebookF
                aria-hidden="true"
                className="size-3.5 text-[#1877F2]"
              />
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
  const inputRef =
    React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey);

      if (shortcut) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onChange("");
          }
        }}
        placeholder="Find a screen"
        aria-label="Find a screen"
        className="
          h-8 w-full rounded-lg border border-sidebar-border
          bg-sidebar-accent/40 pl-8 pr-8 text-xs
          text-sidebar-foreground placeholder:text-muted-foreground
          outline-none transition-colors
          focus-visible:border-[#1877F2]/50
          focus-visible:bg-background
          focus-visible:ring-2 focus-visible:ring-[#1877F2]/20
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
            focus-visible:ring-[#1877F2]/30
          "
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : (
        <kbd
          className="
            pointer-events-none absolute right-4 top-1/2
            -translate-y-1/2 text-[10px] font-medium
            text-muted-foreground/70
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

   Replaces the decorative product card. Same footprint,
   but it answers a question people actually have: is the
   data I'm reading current?
===================================================== */

function SyncStatus({
  lastSyncedLabel,
  stale,
}: {
  lastSyncedLabel: string;
  stale?: boolean;
}) {
  return (
    <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
      <div
        className="
          flex items-center gap-2 rounded-lg border
          border-sidebar-border bg-muted/40 px-2.5 py-2
        "
      >
        <span
          aria-hidden="true"
          className={`
            size-1.5 shrink-0 rounded-full
            ${stale ? "bg-amber-500" : "bg-emerald-500"}
          `}
        />

        <span className="truncate text-[11px] text-muted-foreground">
          {stale
            ? `Sync paused · ${lastSyncedLabel}`
            : `Synced ${lastSyncedLabel}`}
        </span>
      </div>
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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  pages?: ConnectedPage[];
  activePageId?: string;
  onPageChange?: (pageId: string) => void;
  lastSyncedLabel?: string;
  syncStale?: boolean;
}) {
  const { user, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

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
    () =>
      groupBySection(
        filterNav(authorizedNav, query),
      ),
    [authorizedNav, query],
  );

  const activePage =
    pages.find(
      (page) => page.id === activePageId,
    ) ?? pages[0];

  /* ===================================================
     LOADING
  =================================================== */

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="border-b border-sidebar-border p-2">
          <SidebarSkeleton />
        </SidebarHeader>
      </Sidebar>
    );
  }

  if (!user) {
    return null;
  }

  const hasResults = sections.some(
    (section) => section.items.length > 0,
  );

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-sidebar-border bg-background"
    >
      <SidebarHeader className="border-b border-sidebar-border bg-background p-2">
        <PageSwitcher
          pages={pages}
          activePage={activePage}
          onPageChange={onPageChange}
          productName={tSystem("title")}
        />
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-background py-2">
        <div className="pb-1">
          <NavSearch
            value={query}
            onChange={setQuery}
          />
        </div>

        {hasResults ? (
          sections.map((section) => (
            <SidebarGroup
              key={section.key}
              className="py-1"
            >
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
                mt-2 text-xs font-medium text-[#1877F2]
                underline-offset-2 hover:underline
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#1877F2]/30 rounded
              "
            >
              Show all screens
            </button>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border bg-background p-2">

        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}