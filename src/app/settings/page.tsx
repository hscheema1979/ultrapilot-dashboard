"use client"

import * as React from "react"
import { UltraPilotSettingsForm } from "@/components/settings/ultrapilot-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Github } from "lucide-react"

interface FormData {
  githubToken: string
  repositoryName: string
  hudEnabled: boolean
  hudCompact: boolean
  autoSave: boolean
  notificationsEnabled: boolean
}

export default function SettingsPage() {
  const [initialData, setInitialData] = React.useState<Partial<FormData>>({})

  React.useEffect(() => {
    // Load settings from localStorage on mount
    const saved = localStorage.getItem('ultrapilot-settings')
    if (saved) {
      try {
        setInitialData(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const handleSave = async (data: FormData) => {
    // Here you would typically save to your backend
    console.log('Saving settings:', data)
    // Simulate API validation
    if (data.githubToken.length < 10) {
      throw new Error('Invalid GitHub token')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">UltraPilot Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your UltraPilot environment, GitHub integration, and HUD preferences
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Github className="h-5 w-5" />
              GitHub Integration
            </CardTitle>
            <CardDescription>
              UltraPilot requires GitHub credentials to create issues, manage repositories, and interact with your codebase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                <strong>Required permissions:</strong> repo (full control of private repositories)
              </p>
              <p>
                <strong>Token creation:</strong> Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <UltraPilotSettingsForm
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
