"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  FolderKanban,
  Workflow,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/navigation"

export function MobileNav() {
  const pathname = usePathname()

  // Filter out settings for mobile nav
  const mobileNavItems = NAV_ITEMS.filter(item => item.href !== "/dashboard/settings")

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-16 grid-cols-7 items-center">
        {mobileNavItems.slice(0, 7).map((item) => {
          const Icon = getIcon(item.icon)
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 py-2 text-xs transition-all",
                isActive
                  ? "text-accent-foreground"
                  : "text-muted-foreground hover:text-accent-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "text-primary"
                )} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="truncate text-[10px]">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Helper function to get icon component by name
function getIcon(iconName: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    FolderOpen,
    FolderKanban,
    Workflow,
    RefreshCw,
    BarChart3,
    AlertCircle,
  }
  return icons[iconName] || LayoutDashboard
}
