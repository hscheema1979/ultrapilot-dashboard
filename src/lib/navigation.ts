import { useRouter, usePathname } from "next/navigation"

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  description?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    description: "Overview and activity feed",
  },
  {
    title: "Repositories",
    href: "/dashboard/repos",
    icon: "FolderOpen",
    description: "Browse and manage repositories",
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: "FolderKanban",
    description: "Project boards and tasks",
  },
  {
    title: "Workflows",
    href: "/dashboard/workflows",
    icon: "Workflow",
    description: "Monitor workflow runs",
    badge: 0, // Will be updated dynamically
  },
  {
    title: "Autoloop",
    href: "/dashboard/autoloop",
    icon: "RefreshCw",
    description: "Autoloop status and events",
  },
  {
    title: "Metrics",
    href: "/dashboard/metrics",
    icon: "BarChart3",
    description: "Performance metrics",
  },
  {
    title: "Issues",
    href: "/dashboard/issues",
    icon: "AlertCircle",
    description: "Track issues and PRs",
    badge: 0, // Will be updated dynamically
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    description: "Configure dashboard",
  },
]

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const navigate = (href: string) => {
    router.push(href)
  }

  const getCurrentNav = (): NavItem | undefined => {
    return NAV_ITEMS.find((item) => isActive(item.href))
  }

  return {
    isActive,
    navigate,
    getCurrentNav,
    pathname,
  }
}

export function getBreadcrumbs(pathname: string): Array<{ title: string; href: string }> {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: Array<{ title: string; href: string }> = []

  // Always start with Dashboard
  if (segments[0] === "dashboard") {
    breadcrumbs.push({ title: "Dashboard", href: "/dashboard" })
  }

  // Build up the path
  let currentPath = ""
  segments.forEach((segment, index) => {
    if (index === 0) return // Skip first segment (already added)

    currentPath += `/${segment}`
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    breadcrumbs.push({ title, href: currentPath })
  })

  return breadcrumbs
}

export function getQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}
