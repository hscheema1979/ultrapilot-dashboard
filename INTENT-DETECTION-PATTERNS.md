# Intent Detection Patterns - Complete Reference

**Trigger words and phrases for automatic session classification**

---

## Category: Feature Request (FR)

**Triggers:**
- Build/Creation: "build", "create", "make", "develop", "implement", "add"
- New Features: "new feature", "add functionality", "extend", "enhance"
- Components: "component", "module", "service", "endpoint", "API"
- Structure: "architecture", "design", "structure"

**Examples:**
- "Build a REST API for task management"
- "Create a new user authentication module"
- "Implement file upload functionality"
- "Add a dashboard widget"

**Agent:** `ultra:architect` (starts workflow)
**Labels:** `type:feature-request`, `status:pending`, `phase:plan`

---

## Category: Bug Report

**Triggers:**
- Not Working: "isn't working", "not working", "doesn't work", "won't work"
- Broken: "broken", "crashes", "crash", "fails", "failure"
- Errors: "error", "exception", "bug", "issue", "problem"
- Fix: "fix", "repair", "resolve", "correct"
- Change (fix context): "change this", "need to change", "change the way"

**Examples:**
- "The login button isn't working"
- "API returns 500 error"
- "Fix the broken auth flow"
- "Change the validation logic"
- "It's broken when I click submit"

**Agent:** `ultra:debugger` (starts investigation)
**Labels:** `type:bug`, `priority:high`, `status:pending`

---

## Category: Question/Inquiry

**Triggers:**
- Question Words: "how", "what", "why", "when", "where", "which", "who"
- Explaining: "explain", "show me", "describe", "clarify"
- Understanding: "understand", "how does", "what is", "how do"
- Question Marks: Messages ending with "?"

**Examples:**
- "How does the authentication flow work?"
- "What's the difference between these approaches?"
- "Explain the Redux store architecture"
- "Show me how the API routes work"

**Agent:** `ultra:analyst` (answers questions)
**Labels:** `type:question`, `status:discussion`

---

## Category: Review/Analysis

**Triggers:**
- Review: "review", "audit", "check", "examine", "inspect"
- Analysis: "analyze", "assess", "evaluate", "investigate"
- Code Focus: "code review", "architecture review", "design review"
- Performance: "optimize", "improve", "refactor"

**Examples:**
- "Review the authentication code"
- "Analyze the database schema"
- "Audit the security implementation"
- "Review my pull request"

**Agent:** `ultra:reviewer` (reviews code)
**Labels:** `type:review`, `status:discussion`

---

## Priority Detection

### Critical Priority
- Triggers: "urgent", "critical", "blocking", "blocked", "production"
- Labels: `priority:critical`

### High Priority
- Triggers: "broken", "crash", "error", "not working", "doesn't work"
- Labels: `priority:high`

### Medium Priority
- Triggers: "bug", "fix", "change"
- Labels: `priority:medium`

### Low Priority
- Default for feature requests
- Labels: `priority:low`

---

## Implementation

```typescript
// Complete intent detection patterns
const intentPatterns = {
  featureRequest: {
    triggers: [
      // Build/Creation verbs
      /\b(build|create|make|develop|implement|add|construct|write|code)\b/i,

      // Feature words
      /\b(new feature|functionality|capability|module|component|service)\b/i,

      // Technical terms
      /\b(api|endpoint|route|handler|controller|interface)\b/i,

      // Architecture
      /\b(architecture|design|structure|schema|system)\b/i
    ],
    agent: 'ultra:architect',
    labels: ['type:feature-request', 'status:pending', 'phase:plan'],
    priority: 'low'
  },

  bugReport: {
    triggers: [
      // Not working (expanded)
      /\b(isn't working|not working|doesn't work|won't work|won't start)\b/i,
      /\b(isnt working|dont work|wont work)\b/i,  // Without apostrophes

      // Broken/Crash
      /\b(broken|crashes|crash|crashed|fails|failed|failing)\b/i,
      /\b(error|exception|bug|issue|problem)\b/i,

      // Fix/Repair
      /\b(fix|repair|resolve|correct|debug)\b/i,

      // Change (in fix context)
      /\b(change this|change the|needs to change|should change)\b/i,

      // Negative patterns
      /\b(wrong|incorrect|invalid|bad)\b/i
    ],
    agent: 'ultra:debugger',
    labels: ['type:bug', 'status:pending'],
    priority: 'high'
  },

  question: {
    triggers: [
      // Question words
      /\b(how|what|why|when|where|which|who)\b/i,
      /\b(can you|could you|would you)\b/i,

      // Explaining
      /\b(explain|describe|clarify|show me|tell me)\b/i,

      // Understanding
      /\b(understand|how does|what is|how do|what do)\b/i,

      // Question marks
      /\?\?*$/
    ],
    agent: 'ultra:analyst',
    labels: ['type:question', 'status:discussion'],
    priority: 'low'
  },

  review: {
    triggers: [
      // Review verbs
      /\b(review|audit|check|examine|inspect|analyze)\b/i,

      // Code focus
      /\b(code review|pr review|pull request)\b/i,

      // Assessment
      /\b(assess|evaluate|investigate)\b/i,

      // Quality
      /\b(improve|optimize|refactor)\b/i
    ],
    agent: 'ultra:reviewer',
    labels: ['type:review', 'status:discussion'],
    priority: 'medium'
  }
}

// Priority boosters
const priorityBoosters = {
  critical: [
    /\b(critical|urgent|blocking|blocked|production|emergency)\b/i,
    /\b(down| outage|security|security issue)\b/i
  ],
  high: [
    /\b(broken|crash|error|exception|not working|doesn't work)\b/i,
    /\b(failing|failed|failure)\b/i
  ]
}

export function detectIntent(message: string): IntentAnalysis {
  const scores = Object.entries(intentPatterns).map(([type, config]) => {
    const matchCount = config.triggers.reduce((count, pattern) => {
      return count + (pattern.test(message) ? 1 : 0)
    }, 0)

    return {
      type,
      score: matchCount,
      agent: config.agent,
      labels: config.labels,
      priority: config.priority
    }
  })

  // Find best match
  const best = scores.sort((a, b) => b.score - a.score)[0]

  // Check for priority boosters
  let priority = best.priority
  for (const [level, patterns] of Object.entries(priorityBoosters)) {
    if (patterns.some(p => p.test(message))) {
      priority = level
      break
    }
  }

  return {
    type: best.type,
    confidence: best.score > 0 ? 0.9 : 0.3,
    suggestedAgent: best.agent,
    suggestedLabels: [...best.labels, `priority:${priority}`],
    priority: priority as any
  }
}
```

---

## Examples

### Bug Report Examples
- "The login button isn't working"
  → Type: bug-report
  → Agent: ultra:debugger
  → Priority: high

- "API returns 500 error when I call /tasks"
  → Type: bug-report
  → Agent: ultra:debugger
  → Priority: high

- "Fix the broken authentication"
  → Type: bug-report
  → Agent: ultra:debugger
  → Priority: high

- "Change the validation logic, it's wrong"
  → Type: bug-report
  → Agent: ultra:debugger
  → Priority: medium

### Feature Request Examples
- "Build a REST API for task management"
  → Type: feature-request
  → Agent: ultra:architect
  → Priority: low

- "Add OAuth authentication"
  → Type: feature-request
  → Agent: ultra:architect
  → Priority: low

### Question Examples
- "How does the auth flow work?"
  → Type: question
  → Agent: ultra:analyst
  → Priority: low

- "What's the difference between Redux and Context?"
  → Type: question
  → Agent: ultra:analyst
  → Priority: low

### Review Examples
- "Review the authentication code"
  → Type: review
  → Agent: ultra:reviewer
  → Priority: medium

- "Analyze the database schema"
  → Type: review
  → Agent: ultra:reviewer
  → Priority: medium

---

## Edge Cases

### Multiple Triggers
"Fix the broken API and add new endpoints"
→ Best match: bug-report (fix/broken)
→ Secondary: feature-request (add endpoints)
→ Result: Bug report takes precedence

### Unclear Intent
"Help me with the dashboard"
→ Low confidence (0.3)
→ Ask user: "Are you building something new, fixing a bug, or need help understanding?"

### Conversational
"Thanks, that works great!"
→ No actionable intent
→ Don't create GitHub issue
→ Just a conversation

---

## Testing

```typescript
// Test cases
const testCases = [
  { input: "The login button isn't working", expected: 'bug-report' },
  { input: "Build a REST API", expected: 'feature-request' },
  { input: "How does auth work?", expected: 'question' },
  { input: "Review this code", expected: 'review' },
  { input: "Fix the broken API", expected: 'bug-report' },
  { input: "Change the validation", expected: 'bug-report' },
  { input: "Add user management", expected: 'feature-request' },
  { input: "Explain the architecture", expected: 'question' },
  { input: "The system crashes", expected: 'bug-report' },
  { input: "Create a dashboard widget", expected: 'feature-request' }
]

testCases.forEach(({ input, expected }) => {
  const result = detectIntent(input)
  console.assert(
    result.type === expected,
    `Expected ${expected} for "${input}", got ${result.type}`
  )
})
```

---

## Continuous Improvement

### Learning from Corrections
When user corrects misclassification:
1. Store correction
2. Add new pattern
3. Retrain model (if using ML)

### Pattern Evolution
- Monitor failed detections
- Add new trigger phrases
- Refine regex patterns
- A/B test improvements

---

**This ensures accurate automatic classification of all Relay chat sessions!** 🎯
