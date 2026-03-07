import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProjectProvider } from "@/contexts/project-context"
import { OrgProvider } from "@/contexts/org-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toast-provider"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { GithubDashboardHeader } from "@/components/dashboard/github-dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UltraPilot Mission Control",
  description: "GitHub operations, workflows, and project management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OrgProvider availableOrgs={["hscheema1979", "creative-adventures"]}>
            <ProjectProvider>
              <TooltipProvider>
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
                <Toaster />
              </TooltipProvider>
            </ProjectProvider>
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
