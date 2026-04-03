# Teacher Analytics — Frontend Integration Spec

> **Role:** `TEACHER`
> **Prerequisite:** Read `00_analytics_overview.md` first.
> **Analytics Tab Route:** `/teacher/analytics`

---

## 1. Page Structure Overview

The Teacher Analytics module lives under a single **"Analytics" tab** in the sidebar. It has two views:

```
/teacher/analytics                         → Class Dashboard (default — shows group selector)
/teacher/analytics/students/:studentUserId → Student Dashboard (drill-down from class view)
```

No separate sidebar sub-entries. The group selector and student selector live inside the Analytics tab page itself.

---

## 2. APIs Used (4 Endpoints)

| # | Method | Path | When Called |
|---|--------|------|-------------|
| 1 | `GET` | `/analytics/teacher/groups` | On Analytics tab mount — populate group dropdown |
| 2 | `GET` | `/analytics/teacher/groups/{groupId}/students` | When user selects a group — populate student dropdown |
| 3 | `GET` | `/analytics/teacher/groups/{groupId}/dashboard` | When user selects a group — load class dashboard |
| 4 | `GET` | `/analytics/teacher/students/{studentUserId}/dashboard` | When user selects a student — load student dashboard |

**Note:** Endpoints 3 and 4 accept optional `?from` and `?to` date params. Endpoint 4 also accepts `?limit` (default 5, max 50) for top performers.

---

## 3. Class Dashboard Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  📈 Analytics                                                     │
│                                                                   │
│  Class:  [Class 9A ▼]      Student: [Select student... ▼]        │
│                              [From: ___]  [To: ___]              │
├─────────────────────────┬────────────────────────────────────────┤
│  Completion Rate         │  Avg Score                            │
│  [stat card]             │  [stat card]                          │
├─────────────────────────┴────────────────────────────────────────┤
│  Top Performers                               [Limit: 5 ▼]       │
│  [leaderboard list]                                              │
├──────────────────────────────────────────────────────────────────┤
│  Academic Standards Heatmap                                       │
│  [grid: rows = mastery levels, cols = subjects]                  │
├──────────────────────────────────────────────────────────────────┤
│  Student Performance Table                                        │
│  [sortable table — one row per student]                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Selector Flow (Before Dashboard Loads)

```
1. GET /analytics/teacher/groups
   → populate "Class" dropdown with groupName values
   → if empty list → show: "You have no assigned classes yet."

2. User selects a group (groupId)
   → Simultaneously fire:
       GET /analytics/teacher/groups/{groupId}/students  → populate Student dropdown
       GET /analytics/teacher/groups/{groupId}/dashboard → load class dashboard widgets

3. User selects a student from Student dropdown (studentUserId)
   → Navigate to: /teacher/analytics/students/{studentUserId}
   → GET /analytics/teacher/students/{studentUserId}/dashboard
```

### Group Dropdown Component
```
┌───────────────────────────────┐
│  Class 9A  ▼                  │
├───────────────────────────────┤
│  ○ Class 9A   (32 students)   │
│  ● Class 10B  (28 students)   │
│  ○ Class 8C   (35 students)   │
└───────────────────────────────┘
```
- Show `groupName` + `(studentCount students)` in dropdown items
- Persist last selected group in state so teacher doesn't lose context on tab re-visit

### Student Dropdown Component
```
┌─────────────────────────────┐
│  Select a student... ▼      │
├─────────────────────────────┤
│  Ayush Sharma               │
│  Priya Mehta                │
│  Rohan Gupta                │
└─────────────────────────────┘
```
- Populated after group selection
- Selecting a student navigates to student dashboard view

---

## 5. Class Dashboard — API Reference

### Endpoint
```
GET /analytics/teacher/groups/{groupId}/dashboard
```

### Query Parameters
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `from` | ISO 8601 | ❌ | — | Filter from date |
| `to` | ISO 8601 | ❌ | — | Filter to date |
| `limit` | integer | ❌ | `5` | Top performers count (1–50) |

### Full Example Response
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": {
    "groupId": "uuid-g1",
    "groupName": "Class 9A",
    "completionRate": {
      "totalAssigned": 300,
      "totalCompleted": 240,
      "completionRate": 80.0
    },
    "avgScore": {
      "avgPercentage": 71.2,
      "totalExamsAttempted": 240
    },
    "topPerformers": {
      "entries": [
        { "rank": 1, "studentId": "uuid-s1", "studentUserId": "uuid-u1", "studentName": "Priya Mehta",  "avgPercentage": 92.5 },
        { "rank": 2, "studentId": "uuid-s2", "studentUserId": "uuid-u2", "studentName": "Rohan Gupta",  "avgPercentage": 88.0 },
        { "rank": 3, "studentId": "uuid-s3", "studentUserId": "uuid-u3", "studentName": "Ayush Sharma", "avgPercentage": 85.0 }
      ]
    },
    "heatmap": {
      "subjects": ["Mathematics", "Science", "English"],
      "rows": [
        { "masteryLevel": "Learner",  "cells": [5, 3, 12] },
        { "masteryLevel": "Achiever", "cells": [18, 20, 15] },
        { "masteryLevel": "Star",     "cells": [9, 9, 5]  }
      ]
    },
    "performanceTable": {
      "rows": [
        {
          "studentId": "uuid-s1", "studentUserId": "uuid-u1", "studentName": "Priya Mehta",
          "groupName": "Class 9A", "avgPercentage": 92.5, "completionRate": 100.0, "masteryLevel": "Star"
        },
        {
          "studentId": "uuid-s2", "studentUserId": "uuid-u2", "studentName": "Rohan Gupta",
          "groupName": "Class 9A", "avgPercentage": 88.0, "completionRate": 90.0, "masteryLevel": "Star"
        }
      ]
    }
  }
}
```

---

## 6. Class Dashboard — Widget Specifications

---

### Widget 1 — Class Completion Rate

**Source:** `data.completionRate`

```
┌───────────────────────────────────┐
│  ✅ Class Completion Rate          │
│                                   │
│         80%                       │  ← completionRate
│  240 of 300 exam slots filled     │  ← "totalCompleted of totalAssigned exam slots"
│  ████████████░░░  80%             │  ← progress bar (color rules from overview §6)
└───────────────────────────────────┘
```

> "Exam slots" = total exams × total students in the class. Both numbers are already computed by the backend.

**Empty state:** `totalAssigned === 0` → *"No exams have been assigned to this class yet."*

---

### Widget 2 — Class Avg Score

**Source:** `data.avgScore`

```
┌───────────────────────────────────┐
│  📊 Class Avg Score               │
│                                   │
│         71.2%                     │  ← avgPercentage
│  across 240 attempts              │  ← totalExamsAttempted
│  🎯 Achiever                      │  ← mastery badge from avgPercentage
└───────────────────────────────────┘
```

---

### Widget 3 — Top Performers

**Source:** `data.topPerformers.entries`

**Layout (leaderboard list):**
```
┌─────────────────────────────────────────────────┐
│  🏆 Top Performers                [Limit: 5 ▼]  │
│                                                   │
│  👑 #1  Priya Mehta       ⭐ 92.5%  →           │
│     #2  Rohan Gupta       ⭐ 88.0%  →           │
│     #3  Ayush Sharma      ⭐ 85.0%  →           │
└─────────────────────────────────────────────────┘
```

**Limit dropdown:** values `[5, 10, 20]` — on change, re-call the dashboard endpoint with `?limit=N`

**Row elements:**
- Rank badge: `#1` with crown `👑`, others as `#2`, `#3`…
- Avatar placeholder (initials circle)
- Student name
- Mastery badge derived from `avgPercentage`
- Percentage value
- Arrow `→` at far right — **clickable** → navigates to `/teacher/analytics/students/{studentUserId}`

**Empty state:** `entries.length === 0` → *"No exam results available for this class yet."*

---

### Widget 4 — Academic Standards Heatmap

**Source:** `data.heatmap`

This is a **true grid** (unlike the student view's card list).

**Structure:**
- **Rows** (fixed, always 3): `Learner`, `Achiever`, `Star`
- **Columns** (dynamic): `data.heatmap.subjects` — one per active subject in the group
- **Cell value**: `data.heatmap.rows[i].cells[j]` = count of students at mastery level `i` for subject `j`

**Rendering the grid:**

```
                | Mathematics | Science | English |
Learner         |      5      |    3    |   12    |
Achiever        |     18      |   20    |   15    |
Star            |      9      |    9    |    5    |
```

**Cell styling:**
| Row (masteryLevel) | Cell Background | Text Color |
|--------------------|----------------|------------|
| `Star` | `#FEF3C7` | `#92400E` |
| `Achiever` | `#DBEAFE` | `#1D4ED8` |
| `Learner` | `#F3F4F6` | `#6B7280` |

**Cell value display:**
- Value > 0 → show the number in bold
- Value === 0 → show `—` in dimmed text (color: `#D1D5DB`)

**Implementation pattern:**
```jsx
const { subjects, rows } = data.heatmap;

// Header row
<tr>
  <th></th>
  {subjects.map(s => <th key={s}>{s}</th>)}
</tr>

// Data rows — rows is [Learner, Achiever, Star]
{rows.map((row, i) => (
  <tr key={row.masteryLevel}>
    <td><MasteryBadge level={row.masteryLevel} /></td>
    {row.cells.map((count, j) => (
      <td key={subjects[j]} style={{ background: getCellBg(row.masteryLevel) }}>
        {count > 0 ? <strong>{count}</strong> : <span style={{ color: '#D1D5DB' }}>—</span>}
      </td>
    ))}
  </tr>
))}
```

**Empty state:** `subjects.length === 0` → *"No subjects with active exams found for this class."*

---

### Widget 5 — Student Performance Table

**Source:** `data.performanceTable.rows`

**Columns:**
| Column | Field | Notes |
|--------|-------|-------|
| Student | `studentName` | Clickable → `/teacher/analytics/students/{studentUserId}` |
| Avg % | `avgPercentage` | `"92.5%"` |
| Completion | `completionRate` | `"100%"` with mini progress bar |
| Mastery | `masteryLevel` | Colored badge |

**Default sort:** `avgPercentage` descending (API returns this order). Allow column header click to re-sort client-side.

**Clickable rows:** clicking anywhere on a student's row navigates to:
```
/teacher/analytics/students/{studentUserId}
```

**Empty state:** `rows.length === 0` → *"No students found in this class."*

---

## 7. Student Dashboard (Teacher Viewing a Student)

### Route
```
/teacher/analytics/students/:studentUserId
```

### Back navigation
Show a back button in the page header:
```
← Back to Class 9A   |   Student: Priya Mehta
```
Back button returns to `/teacher/analytics` with the previously selected group preserved.

### API Reference

```
GET /analytics/teacher/students/{studentUserId}/dashboard
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | ISO 8601 | ❌ | Filter from date |
| `to` | ISO 8601 | ❌ | Filter to date |

### Full Example Response
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": {
    "studentUserId": "uuid-u1",
    "studentName": "Priya Mehta",
    "completionRate": {
      "totalAssigned": 10,
      "totalCompleted": 10,
      "completionRate": 100.0
    },
    "avgScore": {
      "avgPercentage": 92.5,
      "totalExamsAttempted": 10
    },
    "progression": {
      "points": [
        { "examId": "uuid-e1", "examTitle": "Maths Unit 1", "percentage": 88.0, "submittedAt": "2026-01-10T09:00:00Z" },
        { "examId": "uuid-e2", "examTitle": "Science Test",  "percentage": 95.0, "submittedAt": "2026-01-20T10:00:00Z" }
      ]
    },
    "heatmap": {
      "subjectMasteries": [
        { "subjectId": "uuid-s1", "subjectName": "Mathematics", "avgPercentage": 90.0, "masteryLevel": "Star" },
        { "subjectId": "uuid-s2", "subjectName": "Science",     "avgPercentage": 95.0, "masteryLevel": "Star" }
      ]
    },
    "performanceTable": [
      {
        "examId": "uuid-e2",
        "examTitle": "Science Test",
        "score": 47,
        "percentage": 95.0,
        "passed": true,
        "submittedAt": "2026-01-20T10:00:00Z",
        "topicBreakdown": [
          { "topic": "Photosynthesis", "correct": 9, "incorrect": 1, "accuracy": 90.0 },
          { "topic": "Respiration",    "correct": 8, "incorrect": 0, "accuracy": 100.0 }
        ]
      }
    ]
  }
}
```

### Student Dashboard Page Layout
```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Class 9A                                          │
│  👤 Priya Mehta                  [From: ___]  [To: ___]     │
├──────────────────────┬───────────────────────────────────────┤
│  Completion Rate     │  Avg Score                            │
│  [stat card]         │  [stat card]                          │
├──────────────────────┴───────────────────────────────────────┤
│  Performance Progression                                      │
│  [bar + trendline chart — full width]                        │
├──────────────────────────────────────────────────────────────┤
│  Subject Mastery                                              │
│  [scrollable row of subject cards]                           │
├──────────────────────────────────────────────────────────────┤
│  Exam History                                                 │
│  [expandable table with show more]                           │
└──────────────────────────────────────────────────────────────┘
```

All 6 widgets use the **exact same specs** as the Student self-view (`01_student_analytics.md §4`). The only difference is the page header (student name + back button instead of "My Analytics").

---

## 8. Full API Call Sequences

### Flow A — Teacher lands on Analytics tab
```
1. Mount Analytics tab
   → GET /analytics/teacher/groups
   → Populate group dropdown
   → Auto-select first group (or last-used group if stored in state)

2. Group selected (groupId)
   → Parallel:
       GET /analytics/teacher/groups/{groupId}/students    → populate student dropdown
       GET /analytics/teacher/groups/{groupId}/dashboard   → load all 5 class widgets

3. User changes date range
   → GET /analytics/teacher/groups/{groupId}/dashboard?from=...&to=...
   → Refresh all widgets

4. User changes limit on Top Performers
   → GET /analytics/teacher/groups/{groupId}/dashboard?limit=10
   → Refresh only Top Performers widget (or full refresh — simpler to do full)
```

### Flow B — Teacher drills into a student
```
1. User clicks student in performance table OR selects from student dropdown
   → Navigate to /teacher/analytics/students/{studentUserId}
   → GET /analytics/teacher/students/{studentUserId}/dashboard
   → Load all 6 student widgets

2. User changes date range
   → GET /analytics/teacher/students/{studentUserId}/dashboard?from=...&to=...
   → Refresh all widgets

3. User clicks "← Back to Class 9A"
   → Return to /teacher/analytics with previously selected group still active
```

---

## 9. Error Reference

| Scenario | Behaviour |
|----------|-----------|
| `GET /analytics/teacher/groups` returns empty `[]` | Show: *"You have no assigned classes yet."* — do not show dashboard |
| `403` on group dashboard | Show: *"You are not assigned to this group."* (shouldn't happen if dropdown is populated from the same API) |
| `403` on student dashboard | Show: *"This student does not belong to your assigned classes."* |
| `404` on student dashboard | Show: *"Student not found."* + Back button |
| `500` | Toast + per-widget error state with Retry |
| `heatmap.subjects.length === 0` | Widget empty state — not a global error |
