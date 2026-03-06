import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProjectProvider } from "@/contexts/project-context"
import { OrgProvider } from "@/contexts/org-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toast-provider"
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
                {children}
                <Toaster />
              </TooltipProvider>
            </ProjectProvider>
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
