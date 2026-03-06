'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Activity,
  LayoutGrid,
  Settings,
  FolderOpen,
  Zap,
  Menu,
  Home,
  ChevronDown
} from "lucide-react"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Tracker", href: "/tracker", icon: LayoutGrid },
      { name: "Kanban", href: "/kanban", icon: Activity },
    ]
  },
  {
    title: "Management",
    items: [
      { name: "Projects", href: "/projects", icon: FolderOpen },
      { name: "Agents", href: "/agents", icon: Activity },
      { name: "GitHub", href: "/github", icon: Activity },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
  {
    title: "Relay",
    items: [
      { name: "Ubuntu", href: "/p/ubuntu/", icon: Zap, external: true },
      { name: "hscheema1979", href: "/p/hscheema1979/", icon: Zap, external: true },
      { name: "Projects", href: "/p/projects/", icon: Zap, external: true },
      { name: "Dev", href: "/p/dev/", icon: Zap, external: true },
      { name: "MyHealthTeam", href: "/p/myhealthteam/", icon: Zap, external: true },
    ]
  }
]

export function TopNavigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <Link href="/" className="font-bold text-lg hidden sm:inline-block">
              Operations Suite
            </Link>
          </div>

          {/* Navigation Dropdowns */}
          <nav className="flex items-center gap-1 ml-8">
            {navigationItems.map((section) => (
              <DropdownMenu key={section.title}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    {section.title}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>{section.title}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const isExternal = (item as any).external === true

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        {isExternal ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 cursor-pointer",
                              isActive && "bg-accent"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 cursor-pointer",
                              isActive && "bg-accent"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Activity className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </>
  )
}

function MobileNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center px-4 py-2 border-b bg-background">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <div className="flex items-center gap-2 ml-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Operations Suite</span>
        </div>
      </div>

      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span>Operations Suite</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for Operations Suite
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {navigationItems.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const isExternal = (item as any).external === true

                    return (
                      <div key={item.href}>
                        {isExternal ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Button>
                          </a>
                        ) : (
                          <Link href={item.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3"
                              onClick={() => setOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground">Operations Suite v1.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
