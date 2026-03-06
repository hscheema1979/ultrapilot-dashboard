'use client'

import { useState } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Sparkles, GitPullRequest, BugWarning, Timer, Zap, List } from "lucide-react"
import { useRouter } from "next/navigation"

interface WorkflowFormData {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'code-review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId?: string
  workflowType: 'quick' | 'full' | 'queue'
}

export default function WorkflowSubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [intentDetection, setIntentDetection] = useState<{
    intent: string
    confidence: number
    suggestedType: string
  } | null>(null)
  const [formData, setFormData] = useState<WorkflowFormData>({
    title: '',
    description: '',
    type: 'feature-request',
    priority: 'medium',
    workflowType: 'quick'
  })

  const handleInputChange = (field: keyof WorkflowFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/workflows/${result.id}`)
      } else {
        const error = await response.json()
        alert(`Failed to submit workflow: ${error.message}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Submit Workflow</h1>
            <p className="text-muted-foreground">
              Create a feature request, bug report, or code review workflow
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of what you need"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                minLength={10}
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                10-200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of your requirements..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                minLength={50}
                rows={8}
                required
              />
              <p className="text-sm text-muted-foreground">
                Minimum 50 characters. Be as specific as possible about your requirements.
              </p>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Tabs
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="feature-request" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Feature Request
                  </TabsTrigger>
                  <TabsTrigger value="bug-report" className="flex items-center gap-2">
                    <BugWarning className="h-4 w-4" />
                    Bug Report
                  </TabsTrigger>
                  <TabsTrigger value="code-review" className="flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4" />
                    Code Review
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority *</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={formData.priority === priority ? 'default' : 'outline'}
                    onClick={() => handleInputChange('priority', priority)}
                    className="flex-1"
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Workflow Type */}
            <div className="space-y-2">
              <Label>Workflow Type *</Label>
              <div className="grid grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.workflowType === 'quick'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('workflowType', 'quick')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <Zap className="h-8 w-8 mx-auto text-blue-500" />
                    <h3 className="font-semibold">Quick</h3>
                    <p className="text-sm text-muted-foreground">
                      Single agent, &lt;30 min
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.workflowType === 'full'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('workflowType', 'full')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <Timer className="h-8 w-8 mx-auto text-purple-500" />
                    <h3 className="font-semibold">Full Ultrapilot</h3>
                    <p className="text-sm text-muted-foreground">
                      5-phase lifecycle
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.workflowType === 'queue'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('workflowType', 'queue')}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <List className="h-8 w-8 mx-auto text-green-500" />
                    <h3 className="font-semibold">Task Queue</h3>
                    <p className="text-sm text-muted-foreground">
                      Multi-project
                    </p>
                  </CardContent>
                </Card>
              </div>

              {formData.workflowType === 'quick' && (
                <p className="text-sm text-muted-foreground">
                  ⚡ <strong>Quick</strong>: Single AI agent handles your request directly. Best for simple, straightforward tasks.
                </p>
              )}
              {formData.workflowType === 'full' && (
                <p className="text-sm text-muted-foreground">
                  🔄 <strong>Full Ultrapilot</strong>: Complete 5-phase process with requirements, architecture, planning, execution, and verification. Includes approval gates.
                </p>
              )}
              {formData.workflowType === 'queue' && (
                <p className="text-sm text-muted-foreground">
                  📋 <strong>Task Queue</strong>: Add to queue for ultra:team-lead to prioritize and schedule along with other tasks.
                </p>
              )}
            </div>

            {/* Intent Detection Preview */}
            {intentDetection && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Detected Intent:</span>
                  <Badge variant="secondary">
                    {Math.round(intentDetection.confidence * 100)}% confident
                  </Badge>
                </div>
                <p className="text-sm">{intentDetection.intent}</p>
                <p className="text-sm text-muted-foreground">
                  Suggested: <strong>{intentDetection.suggestedType}</strong> workflow
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.description}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Workflow'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
