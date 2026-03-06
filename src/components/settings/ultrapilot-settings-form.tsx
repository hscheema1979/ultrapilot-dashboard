"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react"

interface FormData {
  githubToken: string
  repositoryName: string
  hudEnabled: boolean
  hudCompact: boolean
  autoSave: boolean
  notificationsEnabled: boolean
}

interface FormErrors {
  githubToken?: string
  repositoryName?: string
}

interface UltraPilotSettingsFormProps {
  initialData?: Partial<FormData>
  onSave?: (data: FormData) => Promise<void>
  className?: string
}

export function UltraPilotSettingsForm({
  initialData,
  onSave,
  className
}: UltraPilotSettingsFormProps) {
  const [formData, setFormData] = React.useState<FormData>({
    githubToken: initialData?.githubToken || "",
    repositoryName: initialData?.repositoryName || "",
    hudEnabled: initialData?.hudEnabled ?? true,
    hudCompact: initialData?.hudCompact ?? false,
    autoSave: initialData?.autoSave ?? true,
    notificationsEnabled: initialData?.notificationsEnabled ?? true,
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.githubToken.trim()) {
      newErrors.githubToken = "GitHub token is required"
    } else if (formData.githubToken.length < 10) {
      newErrors.githubToken = "GitHub token appears to be invalid"
    }

    if (!formData.repositoryName.trim()) {
      newErrors.repositoryName = "Repository name is required"
    } else if (!formData.repositoryName.includes('/')) {
      newErrors.repositoryName = "Repository must be in format 'owner/repo'"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    setSaveStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSaveStatus('idle')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (onSave) {
        await onSave(formData)
      }

      // Save to localStorage for persistence
      localStorage.setItem('ultrapilot-settings', JSON.stringify(formData))

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub Configuration</CardTitle>
            <CardDescription>
              Configure your GitHub credentials for UltraPilot integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="githubToken">
                GitHub Token
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="githubToken"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={formData.githubToken}
                onChange={(e) => handleInputChange('githubToken', e.target.value)}
                className={errors.githubToken ? 'border-destructive' : ''}
                aria-invalid={!!errors.githubToken}
                disabled={isSubmitting}
              />
              {errors.githubToken && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.githubToken}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Create a personal access token with repo permissions at GitHub Settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repositoryName">
                Repository Name
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="repositoryName"
                type="text"
                placeholder="owner/repository"
                value={formData.repositoryName}
                onChange={(e) => handleInputChange('repositoryName', e.target.value)}
                className={errors.repositoryName ? 'border-destructive' : ''}
                aria-invalid={!!errors.repositoryName}
                disabled={isSubmitting}
              />
              {errors.repositoryName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.repositoryName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: owner/repository (e.g., facebook/react)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* HUD Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>HUD Preferences</CardTitle>
            <CardDescription>
              Customize the UltraPilot heads-up display
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hudEnabled">Enable HUD</Label>
                <p className="text-xs text-muted-foreground">
                  Show real-time agent status in the HUD
                </p>
              </div>
              <Switch
                id="hudEnabled"
                checked={formData.hudEnabled}
                onCheckedChange={(checked) => handleInputChange('hudEnabled', checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hudCompact">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use minimal HUD display format
                </p>
              </div>
              <Switch
                id="hudCompact"
                checked={formData.hudCompact}
                onCheckedChange={(checked) => handleInputChange('hudCompact', checked)}
                disabled={isSubmitting || !formData.hudEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Additional UltraPilot configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Auto Save</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically save agent progress
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={formData.autoSave}
                onCheckedChange={(checked) => handleInputChange('autoSave', checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificationsEnabled">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Enable desktop notifications
                </p>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={formData.notificationsEnabled}
                onCheckedChange={(checked) => handleInputChange('notificationsEnabled', checked)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>

          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm text-status-success">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved successfully
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed to save settings
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
