import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WorkflowMonitor } from "@/components/dashboard/workflow-monitor"
import { ProjectsBoard } from "@/components/dashboard/projects-board"
import { TasksList } from "@/components/dashboard/tasks-list"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your GitHub operations and Relay sessions
          </p>
        </div>

        {/* Overview Metrics */}
        <MetricsCards />

        {/* Main Content Tabs */}
        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <WorkflowMonitor />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <ProjectsBoard />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TasksList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
