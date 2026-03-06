# Implementation Plan Summary

**Project:** GitHub Mission Control Dashboard - Workflow Automation System
**Date:** 2026-03-06
**Status:** Phase 1 Complete - Planning
**Plan Version:** Draft v1

---

## Quick Overview

This document provides a high-level summary of the detailed implementation plan located at `.ultra/plan.md`.

### What We're Building

A workflow automation system that enables users to:
1. **Submit feature requests** through a web form
2. **Auto-detect intent** (feature, bug, question, review)
3. **Assign appropriate AI agents** (ultra:architect, ultra:team-lead, etc.)
4. **Track progress** in real-time
5. **Control workflows** with approval gates
6. **Manage task queues** for parallel execution

### Three Workflow Types

1. **Quick Request** - Single agent, < 30 minutes, no approvals
2. **Full Ultrapilot** - Complete 5-phase lifecycle with approval gates
3. **Task Queue** - Multi-project task management with prioritization

---

## Implementation Timeline

| Phase | Duration | Focus | Success Criteria |
|-------|----------|-------|------------------|
| **Phase 1** | Week 1-2 | Foundation | Data models, state management, GitHub integration, intent detection |
| **Phase 2** | Week 2-3 | Quick Request | Single-agent workflow, submit form, progress tracking |
| **Phase 3** | Week 3-4 | Full Ultrapilot | Multi-phase workflow, approval gates, UltraPilot integration |
| **Phase 4** | Week 4-5 | Task Queue | Queue management, parallel execution, dependencies |
| **Phase 5** | Week 5 | Real-time Updates | WebSocket/SSE streaming, live progress updates |
| **Phase 6** | Week 6 | Polish & Docs | Error handling, testing, documentation |

---

## Key Components

### Frontend Components (7 files)

1. **submit-form.tsx** - Form for submitting workflows
2. **workflow-selector.tsx** - Radio buttons for workflow type selection
3. **intent-preview.tsx** - Real-time intent detection display
4. **progress-tracker.tsx** - Phase pipeline and progress visualization
5. **task-queue.tsx** - Drag-and-drop task queue management
6. **approval-gate.tsx** - Approve/reject UI for phase gates
7. **page.tsx** (/workflows) - Main workflow dashboard

### Backend Services (7 files)

1. **engine.ts** - Core workflow orchestration
2. **intent-detection.ts** - Intent classification and agent suggestion
3. **orchestrator.ts** - Agent spawning and lifecycle management
4. **integrator.ts** - GitHub issue/comment/label management
5. **approval-gates.ts** - Approval gate logic and state management
6. **websocket-gateway.ts** - Real-time update broadcasting
7. **store.ts** - State persistence and checkpoint management

### API Endpoints (12 routes)

**Workflow Management:**
- POST /api/workflows - Create workflow
- GET /api/workflows - List workflows
- GET /api/workflows/:id - Get workflow details
- PUT /api/workflows/:id/advance - Advance to next phase
- POST /api/workflows/:id/pause - Pause workflow
- POST /api/workflows/:id/approve - Approve phase gate
- POST /api/workflows/:id/intervene - User intervention

**Task Queue:**
- POST /api/tasks - Create task
- GET /api/tasks - List tasks
- POST /api/tasks/:id/reassign - Reassign to different agent
- PUT /api/tasks/:id/priority - Update task priority

**Real-time:**
- GET /api/workflows/stream - SSE stream for updates
- WebSocket /api/workflows/ws - WebSocket connection

**Intent Detection:**
- POST /api/intent-detect - Detect intent from description

---

## File Ownership Boundaries

### Frontend Team Ownership
- `/src/app/workflows/` - All workflow pages
- `/src/components/workflows/` - All workflow components
- Read-only access to `/src/lib/workflows/types.ts`

### Backend Team Ownership
- `/src/lib/workflows/` - All workflow services
- `/src/lib/agents/` - Agent orchestration
- `/src/lib/github/` - GitHub integration
- `/src/lib/realtime/` - WebSocket gateway
- `/src/lib/state/` - State management
- `/src/app/api/` - All API routes

### Shared Files (Read-only for non-owners)
- `/src/lib/workflows/types.ts` - Type definitions
- `/src/lib/workflows/constants.ts` - Constants and enums
- `/src/lib/workflows/utils.ts` - Utility functions

---

## Dependencies to Install

```bash
cd /home/ubuntu/hscheema1979/ultrapilot-dashboard

# Frontend dependencies
npm install react-markdown remark-gfm @dnd-kit/core @dnd-kit/sortable date-fns use-debounce zustand

# Backend dependencies
npm install uuid ws chokidar
```

---

## Data Storage Structure

```
.ultra/
├── workflows/
│   ├── active/           # Currently running workflows
│   ├── completed/        # Finished workflows
│   └── checkpoints/      # State rollback points
├── queue/
│   ├── tasks.json        # Task queue state
│   └── dependencies.json # Task dependency graph
├── artifacts/
│   ├── specs/            # Generated specifications
│   ├── plans/            # Implementation plans
│   └── code/             # Generated code artifacts
└── agents/
    ├── sessions/         # Agent session states
    └── outputs/          # Agent execution logs
```

---

## Integration Points

### Existing Components to Reuse
1. **DashboardLayout** - Layout wrapper for all pages
2. **ProjectSelector** - Project selection dropdown
3. **github-auth.ts** - GitHub App authentication
4. **shadcn/ui** - UI component library

### UltraPilot Plugin Integration
1. **Agent Catalog** - Use 20+ specialist agents
2. **State Directory** - Use `.ultra/` structure
3. **Skills** - Integrate with autopilot skill
4. **Agent Spawning** - Use Claude Code CLI

### GitHub Integration
1. **Issues** - Represent workflows
2. **Comments** - Activity logs
3. **Labels** - Workflow metadata
4. **Pull Requests** - Deliverables

---

## Error Handling Strategy

### API Errors
- Standardized error format with error codes
- Proper HTTP status codes (400, 401, 403, 404, 500, etc.)
- Request IDs for tracing

### Agent Failures
- Retry logic for transient failures
- Timeout handling (1 hour default)
- User notifications on failure
- Automatic cleanup on crash

### State Rollback
- Checkpoints before phase transitions
- Automatic rollback on failure
- User notification of rollback
- GitHub comment about rollback

---

## Testing Strategy

### Unit Tests
- State management operations
- Intent detection logic
- Agent orchestration
- GitHub integration

### Integration Tests
- Quick request workflow
- Full Ultrapilot workflow
- Task queue processing
- Error scenarios

### End-to-End Tests
- Submit → Execute → Complete
- Multi-phase with approvals
- Queue processing
- Pause/resume/cancel

### Performance Tests
- 100 concurrent workflows
- 1000 tasks in queue
- 10 parallel agents

---

## Success Criteria

### User Experience
- ✅ Submit request in < 2 minutes
- ✅ Intent detection > 90% accuracy
- ✅ Real-time updates < 2 second delay
- ✅ Mobile-responsive UI
- ✅ Accessible (WCAG AA)

### Technical
- ✅ API response time < 500ms (p95)
- ✅ Agent spawn < 5 seconds
- ✅ GitHub issue created < 2 seconds
- ✅ Zero data loss
- ✅ Comprehensive error handling

### Workflows
- ✅ Quick request completes in < 30 minutes
- ✅ Full workflow passes all phases
- ✅ Queue handles parallel execution
- ✅ Approval gates work correctly
- ✅ Artifacts accessible

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Agent spawn failure | Retry logic, manual trigger fallback |
| GitHub rate limits | Rate limiting, caching |
| State corruption | Atomic writes, checksums |
| WebSocket drops | Reconnection logic, SSE fallback |
| Intent detection errors | User override option |
| Parallel conflicts | File ownership locks |

---

## Next Steps

1. **Review Plan** - Stakeholder approval
2. **Environment Setup** - Install dependencies, configure .env
3. **Phase 1 Kickoff** - Start with data models and state management
4. **Weekly Reviews** - Progress checkpoints
5. **Iterate** - Adjust plan based on learnings

---

## Key Files Reference

| File | Purpose | Owner |
|------|---------|-------|
| `.ultra/spec.md` | Requirements and architecture | ultra:architect |
| `.ultra/plan.md` | This detailed implementation plan | ultra:planner |
| `.ultra/plan-summary.md` | This summary document | ultra:planner |

---

## Questions?

Refer to the detailed plan at `.ultra/plan.md` for:
- Complete I/O contracts for all components
- Detailed code examples
- Comprehensive error handling
- Full testing specifications
- Deployment strategy

---

**Status:** ✅ Phase 1 (Planning) Complete
**Next Phase:** Phase 2 (Foundation) - Ready to begin
**Estimated Duration:** 6 weeks total
**Team Size:** 2 parallel teams (Frontend + Backend)
