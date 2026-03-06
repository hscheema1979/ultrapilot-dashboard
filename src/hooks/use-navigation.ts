"use client"

import { useNavigation as useNavigationBase } from "@/lib/navigation"

export function useNavigation() {
  return useNavigationBase()
}

export function useActiveRoute() {
  const { isActive, pathname } = useNavigationBase()
  return { isActive, pathname }
}

export function useBreadcrumbs() {
  const { pathname } = useNavigationBase()
  const { getBreadcrumbs } = require("@/lib/navigation")
  return getBreadcrumbs(pathname)
}
