"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { NavItem } from "@/types/commen"

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const pathname = usePathname()

  /*
  |--------------------------------------------------------------------------
  | Route Matching
  |--------------------------------------------------------------------------
  */

  const isRouteActive = React.useCallback(
    (url: string) => {
      if (url === "/") {
        return pathname === "/"
      }

      return (
        pathname === url ||
        pathname.startsWith(`${url}/`)
      )
    },
    [pathname]
  )

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const hasChildren =
          Boolean(item.items && item.items.length > 0)

        const parentActive =
          isRouteActive(item.url)

        const childActive =
          item.items?.some((subItem) =>
            isRouteActive(subItem.url)
          ) ?? false

        const isActive =
          parentActive || childActive

        /*
        |--------------------------------------------------------------------------
        | Simple Item
        |--------------------------------------------------------------------------
        */

        if (!hasChildren) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className="
                  h-10
                  rounded-lg
                  px-3
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  hover:bg-sidebar-accent
                  hover:text-sidebar-accent-foreground
                  data-[active=true]:bg-sidebar-accent
                  data-[active=true]:font-semibold
                  data-[active=true]:text-sidebar-accent-foreground
                "
              >
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      className="
                        size-[18px]
                        shrink-0
                      "
                    />
                  )}

                  <span className="truncate">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        /*
        |--------------------------------------------------------------------------
        | Parent + Children
        |--------------------------------------------------------------------------
        */

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={
              isActive
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  className="
                    relative
                    h-10
                    rounded-lg
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    hover:bg-sidebar-accent
                    hover:text-sidebar-accent-foreground
                    data-[active=true]:bg-sidebar-accent
                    data-[active=true]:font-semibold
                    data-[active=true]:text-sidebar-accent-foreground
                  "
                >
                  {/*
                  |--------------------------------------------------------------------------
                  | Active Indicator
                  |--------------------------------------------------------------------------
                  */}

                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-5
                        w-0.5
                        -translate-y-1/2
                        rounded-full
                        bg-sidebar-primary
                      "
                    />
                  )}

                  {item.icon && (
                    <item.icon
                      className="
                        size-[18px]
                        shrink-0
                      "
                    />
                  )}

                  <span className="truncate">
                    {item.title}
                  </span>

                  <ChevronDown
                    className="
                      ml-auto
                      size-4
                      shrink-0
                      opacity-60
                      transition-transform
                      duration-200
                      group-data-[state=open]/collapsible:rotate-180
                    "
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/*
              |--------------------------------------------------------------------------
              | Children
              |--------------------------------------------------------------------------
              */}

              <CollapsibleContent>
                <SidebarMenuSub
                  className="
                    ml-4
                    mt-1
                    gap-0.5
                    border-l
                    border-sidebar-border
                    pl-3
                  "
                >
                  {item.items?.map((subItem) => {
                    const subItemActive =
                      isRouteActive(subItem.url)

                    return (
                      <SidebarMenuSubItem
                        key={subItem.title}
                      >
                        <SidebarMenuSubButton
                          asChild
                          isActive={subItemActive}
                          className="
                            relative
                            h-9
                            rounded-md
                            px-3
                            text-[13px]
                            font-medium
                            text-muted-foreground
                            transition-all
                            duration-200
                            hover:bg-sidebar-accent
                            hover:text-sidebar-accent-foreground
                            data-[active=true]:bg-sidebar-accent
                            data-[active=true]:font-semibold
                            data-[active=true]:text-sidebar-accent-foreground
                          "
                        >
                          <Link href={subItem.url}>
                            {/*
                            |--------------------------------------------------------------------------
                            | Active Child Indicator
                            |--------------------------------------------------------------------------
                            */}

                            {subItemActive && (
                              <span
                                className="
                                  absolute
                                  -left-[13px]
                                  top-1/2
                                  h-5
                                  w-0.5
                                  -translate-y-1/2
                                  rounded-full
                                  bg-sidebar-primary
                                  "
                                />
                            )}

                            <span className="truncate">
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </SidebarMenu>
  )
}