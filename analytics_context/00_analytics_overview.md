# Analytics Module — Frontend Integration Overview

> **Purpose:** Master reference for the Analytics Module. Read this before any role-specific file.
> All three role dashboards (`01_student_analytics.md`, `02_teacher_analytics.md`, `03_parent_analytics.md`) build on the concepts defined here.

---

## 1. Module Summary

The Analytics Module provides **role-scoped performance dashboards**. Each role sees only data they are permitted to — enforced server-side. The backend returns `403` for any out-of-scope request.

| Role | Scope |
|------|-------|
| `STUDENT` | Own performance only |
| `TEACHER` | Only groups they are assigned to + students within those groups |
| `PARENT` | Only their linked children |

---

## 2. All Analytics Endpoints

| # | Method | Path | Role | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/analytics/student/dashboard` | STUDENT | All 6 widgets for the calling student |
| 2 | `GET` | `/analytics/teacher/groups` | TEACHER | List teacher's assigned groups |
| 3 | `GET` | `/analytics/teacher/groups/{groupId}/students` | TEACHER | Students in one group |
| 4 | `GET` | `/analytics/teacher/groups/{groupId}/dashboard` | TEACHER | Class-level dashboard (5 widgets) |
| 5 | `GET` | `/analytics/teacher/students/{studentUserId}/dashboard` | TEACHER | Per-student dashboard (6 widgets) |
| 6 | `GET` | `/analytics/parent/children` | PARENT | List linked children |
| 7 | `GET` | `/analytics/parent/children/{studentUserId}/dashboard` | PARENT | Child's full dashboard (6 widgets) |

**Auth:** `Authorization: Bearer <token>` required on all endpoints.
- Missing / invalid token → `401`
- Wrong role → `403`

---

## 3. Date Filter (Shared Across All Dashboards)

All `/dashboard` endpoints accept optional date range query params:

| Param | Type | Format | Description |
|-------|------|--------|-------------|
| `from` | string | ISO 8601 | Filter results from this date (inclusive) |
| `to` | string | ISO 8601 | Filter results up to this date (inclusive) |

**Example:**
```
GET /analytics/student/dashboard?from=2026-01-01T00:00:00Z&to=2026-03-31T23:59:59Z
```

If `from` / `to` are omitted → endpoint returns **all-time** data.

### Date Range Picker Component (place on every dashboard page)
- Position: top-right of the page header
- Default: no selection (all-time data)
- On change: re-call the dashboard endpoint with new params and refresh all widgets
- Clear button: resets both fields → all-time
- Display format: `DD MMM YYYY` (e.g. "01 Jan 2026")

---

## 4. Response Envelope

All API responses use a standard wrapper — same as the rest of the platform:

```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": { ... }
}
```

Always read from `response.data` in your API/service layer.

---

## 5. Mastery Level System

Mastery levels are derived from a student's **average percentage** for a subject:

| Level | Condition | Background | Text Color | Icon |
|-------|-----------|------------|------------|------|
| **Star** | `avgPercentage >= 85` | `#FEF3C7` | `#92400E` | ⭐ |
| **Achiever** | `avgPercentage >= 60` | `#DBEAFE` | `#1D4ED8` | 🎯 |
| **Learner** | `avgPercentage < 60` | `#F3F4F6` | `#6B7280` | 📖 |

> If a student has **zero attempts** in a subject → backend returns `"Learner"`. Display with reduced opacity (50%) to signal "no data yet".

### Mastery Badge Component
```
Shape: pill / rounded-full
Content: [icon] + [level name]   e.g. "⭐ Star"
Usage: heatmap cells, student cards, table rows, stat cards
```

---

## 6. Completion Rate Color Rules

Applied to the completion rate stat card's progress bar and percentage number:

| Rate | Color | Hex |
|------|-------|-----|
| `>= 80%` | Green | `#10B981` |
| `>= 50%` | Amber | `#F59E0B` |
| `< 50%` | Red | `#EF4444` |

---

## 7. All Shared Data Models (Typed Reference)

These are the **exact camelCase field names** returned by the API.

### `CompletionRateResponse`
```ts
{
  totalAssigned: number     // total published+ended exams assigned to the class
  totalCompleted: number    // submitted / auto-submitted attempts
  completionRate: number    // (totalCompleted / totalAssigned) × 100, 2 decimals
}
```

### `AvgScoreResponse`
```ts
{
  avgPercentage: number         // average % across submitted exams
  totalExamsAttempted: number   // count of submitted/auto-submitted attempts
}
```

### `ProgressionPoint`
```ts
{
  examId: string          // UUID
  examTitle: string       // truncate to 20 chars in chart axis
  percentage: number      // score as a percentage for this attempt
  submittedAt: string | null  // ISO 8601; null if missing
}
```

### `ProgressionResponse`
```ts
{
  points: ProgressionPoint[]   // chronological order — oldest first
}
```

### `StudentSubjectMastery`
```ts
{
  subjectId: string
  subjectName: string         // e.g. "Mathematics"
  avgPercentage: number       // average across all exams in this subject
  masteryLevel: "Star" | "Achiever" | "Learner"
}
```

### `StudentHeatmapResponse`
```ts
{
  subjectMasteries: StudentSubjectMastery[]
}
```
> ⚠️ This is **NOT a grid** — it is a flat list, one item per subject. Render as a row of cards.

### `ClassHeatmapRow`
```ts
{
  masteryLevel: "Learner" | "Achiever" | "Star"
  cells: number[]   // one integer per subject — raw student count at this mastery level
}
```

### `ClassHeatmapResponse`
```ts
{
  subjects: string[]        // column headers — e.g. ["Maths", "Science", "English"]
  rows: ClassHeatmapRow[]   // always 3 rows in order: [Learner, Achiever, Star]
}
```
> `subjects[i]` is the column header for `rows[j].cells[i]`. Use `subjects.length` to know the column count.

### `TopPerformerEntry`
```ts
{
  rank: number
  studentId: string         // internal UUID (StudentModel)
  studentUserId: string     // UserModel UUID — USE THIS for navigation
  studentName: string
  avgPercentage: number
}
```

### `TopPerformersResponse`
```ts
{
  entries: TopPerformerEntry[]   // sorted by rank ascending
}
```

### `DetailedTableRow`
```ts
{
  studentId: string         // internal UUID
  studentUserId: string     // use for navigation to student analytics
  studentName: string
  groupName: string
  avgPercentage: number
  completionRate: number
  masteryLevel: "Star" | "Achiever" | "Learner"
}
```

### `DetailedTableResponse`
```ts
{
  rows: DetailedTableRow[]   // sorted by avgPercentage descending
}
```

### `TopicBreakdown`
```ts
{
  topic: string       // "Uncategorised" if unclassified
  correct: number
  incorrect: number
  accuracy: number    // (correct / total) × 100
}
```
> Returned sorted **weakest first** (lowest accuracy at index 0).

### `StudentExamResult`
```ts
{
  examId: string
  examTitle: string
  score: number               // raw marks
  percentage: number
  passed: boolean             // percentage >= exam's pass threshold
  submittedAt: string | null  // ISO 8601
  topicBreakdown: TopicBreakdown[]
}
```

### `AssignedGroupSummary` (Teacher only)
```ts
{
  groupId: string      // use as path param for group dashboard
  groupName: string
  studentCount: number
}
```

### `StudentInGroupSummary` (Teacher only)
```ts
{
  studentUserId: string   // use as path param for student dashboard
  studentName: string
}
```

### `LinkedChildSummary` (Parent only)
```ts
{
  studentUserId: string    // use as path param for child dashboard
  studentName: string
  groupId: string | null
  groupName: string | null
}
```

---

## 8. Shared Widget Components

### Stat Card
```
┌──────────────────────────────────┐
│  [icon]  Widget Title             │
│                                   │
│         73.5%                     │  ← primary big number
│    across 7 exams                 │  ← supporting subtitle
│    ████████░░  73%                │  ← optional progress bar
└──────────────────────────────────┘
```
- White card, subtle shadow (`shadow-md`)
- Primary number: large bold font (`text-4xl font-bold`)
- Subtitle: muted gray (`text-sm text-gray-500`)

### Loading State
- Display skeleton shapes matching each widget's dimensions
- Use animated shimmer effect (CSS `animate-pulse` or equivalent)
- Do NOT show a global spinner — load each widget independently

### Empty State
```
[📭 illustration or icon]
  No data yet
  [context message per widget]
```
- Center-aligned inside the widget card
- Muted colors, no action button (unless noted)

### Error State
- Inline inside the widget card: *"Failed to load. [Retry]"*
- Retry re-calls the same endpoint
- Do NOT collapse the widget — keep it visible with the error state

---

## 9. Sidebar Navigation (Updated)

### STUDENT Sidebar
```
📊 Dashboard
📝 My Exams
📈 Analytics           ← /student/analytics
📋 My Results
🏆 Leaderboard
🔔 Notifications
👤 Profile
```

### TEACHER Sidebar
```
📊 Dashboard
🏫 My Classes
👨‍🎓 Students
📚 Question Bank
📝 Exams
📈 Analytics           ← single tab; lands on group selector or last-viewed group
🔔 Notifications
👤 Profile
```
> The Analytics tab opens a page that contains the group selector dropdown.
> Selecting a group shows the class dashboard; selecting a student from there shows the student dashboard.
> These are **sub-views within the Analytics tab** — NOT separate sidebar entries.

### PARENT Sidebar
```
📊 Dashboard
👨‍👩‍👧 My Children        ← list of children; clicking one opens their analytics
🔔 Notifications
👤 Profile
```
