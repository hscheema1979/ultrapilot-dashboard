'use client'

import { ReactNode } from 'react'
import { TopNavigation } from './top-navigation'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <TopNavigation />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
