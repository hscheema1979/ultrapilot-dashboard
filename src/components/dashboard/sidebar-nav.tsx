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
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  Activity,
  Bot,
  Github,
  Terminal,
  User,
  Code,
  HeartPulse,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/navigation"

interface SidebarNavProps {
  className?: string
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Menu</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="grid gap-1">
          {NAV_ITEMS.map((item, index) => {
            const Icon = getIcon(item.icon)
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const badge = item.badge

            // Add divider before items with divider=true
            if (item.divider && index > 0) {
              return (
                <div key={item.href} className="space-y-1">
                  <Separator className="my-2" />
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-2")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {badge !== undefined && badge > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {badge > 9 ? "9+" : badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {collapsed && badge !== undefined && badge > 0 && (
                      <Badge variant="secondary" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                        {badge > 9 ? "9+" : badge}
                      </Badge>
                    )}
                  </Link>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-2")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {badge !== undefined && badge > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {badge > 9 ? "9+" : badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && badge !== undefined && badge > 0 && (
                  <Badge variant="secondary" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>UltraPilot v1.0.0</p>
            <p className="mt-1">© 2025 UltraPilot</p>
          </div>
        )}
      </div>
    </div>
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
    Settings,
    LayoutGrid,
    Activity,
    Bot,
    Github,
    Terminal,
    User,
    Code,
    HeartPulse,
    BookOpen,
  }
  return icons[iconName] || LayoutDashboard
}
