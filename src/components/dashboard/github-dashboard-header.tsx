"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Rocket,
  Menu,
  FolderOpen,
  FolderKanban,
  Workflow,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { useOrgSwitcher } from "@/hooks/use-org-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface GithubDashboardHeaderProps {
  notificationCount?: number
}

export function GithubDashboardHeader({ notificationCount = 0 }: GithubDashboardHeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { currentOrg, switchOrg, availableOrgs, getOrgLabel } = useOrgSwitcher()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Handle keyboard shortcut for search (Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector("input[type=search]") as HTMLInputElement
        searchInput?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"...`)
      // Navigate to search results page
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery)}`
      setSearchQuery("")
    }
  }

  const navItems = [
    { href: "/dashboard", icon: Rocket, label: "Dashboard" },
    { href: "/dashboard/repos", icon: FolderOpen, label: "Repositories" },
    { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
    { href: "/dashboard/workflows", icon: Workflow, label: "Workflows" },
    { href: "/dashboard/autoloop", icon: RefreshCw, label: "Autoloop" },
    { href: "/dashboard/metrics", icon: BarChart3, label: "Metrics" },
    { href: "/dashboard/issues", icon: AlertCircle, label: "Issues" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Rocket className="h-5 w-5" />
                    <span className="">UltraPilot</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Rocket className="h-5 w-5" />
            <span className="">UltraPilot</span>
          </Link>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Rocket className="h-6 w-6" />
            <span className="hidden xl:inline text-xl">UltraPilot Mission Control</span>
            <span className="xl:hidden text-xl">UltraPilot</span>
          </Link>
        </div>

        {/* Organization Selector */}
        <div className="ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {currentOrg}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableOrgs.map((org) => (
                <DropdownMenuItem
                  key={org}
                  onClick={() => switchOrg(org)}
                  className={cn(org === currentOrg && "bg-accent")}
                >
                  {getOrgLabel(org)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="flex-1 px-4 lg:px-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search... (⌘K)"
              className="w-full bg-background pl-8 md:w-64 lg:w-96"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notificationCount === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    {notificationCount} new notification{notificationCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
