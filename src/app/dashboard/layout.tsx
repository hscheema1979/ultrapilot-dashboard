"use client"

import * as React from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { GithubDashboardHeader } from "@/components/dashboard/github-dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block lg:flex-shrink-0">
        <SidebarNav />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <GithubDashboardHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile navigation */}
        <MobileNav />
      </div>
    </div>
  )
}
