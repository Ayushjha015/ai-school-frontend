# Parent Analytics — Frontend Integration Spec

> **Role:** `PARENT`
> **Prerequisite:** Read `00_analytics_overview.md` first.
> **Route:** `/parent/analytics/children/:studentUserId`

---

## 1. Page Structure Overview

The Parent Analytics experience is accessed from the **"My Children"** sidebar entry. Each child listed becomes a clickable link to their analytics dashboard.

```
Sidebar: "My Children"
  └── Child 1 Name  → /parent/analytics/children/{studentUserId}
  └── Child 2 Name  → /parent/analytics/children/{studentUserId}
```

If a parent has multiple children, a **child selector** (tabs or dropdown) appears at the top of the analytics page so the parent can switch between them without going back to the sidebar.

---

## 2. APIs Used (2 Endpoints)

| # | Method | Path | When Called |
|---|--------|------|-------------|
| 1 | `GET` | `/analytics/parent/children` | On My Children page mount — list all linked children |
| 2 | `GET` | `/analytics/parent/children/{studentUserId}/dashboard` | When a child is selected — load their dashboard |

Both dashboard calls accept optional `?from` / `?to` date filters.

---

## 3. Children List Page

### Route
```
/parent/children
```

### API
```
GET /analytics/parent/children
```

### Example Response
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": [
    {
      "studentUserId": "uuid-u1",
      "studentName": "Emily Sharma",
      "groupId": "uuid-g1",
      "groupName": "Class 9A"
    },
    {
      "studentUserId": "uuid-u2",
      "studentName": "Aryan Sharma",
      "groupId": "uuid-g2",
      "groupName": "Class 7B"
    }
  ]
}
```

### Children Cards Layout (My Children page)
```
┌────────────────────────────────────────────────┐
│  👨‍👩‍👧 My Children                               │
│                                                 │
│  ┌──────────────────────┐  ┌─────────────────┐ │
│  │  👤 Emily Sharma     │  │ 👤 Aryan Sharma │ │
│  │  Class 9A            │  │ Class 7B         │ │
│  │  [View Analytics →]  │  │ [View Analytics →] │ │
│  └──────────────────────┘  └─────────────────┘ │
└────────────────────────────────────────────────┘
```

- Each card shows child name + class name
- "View Analytics →" navigates to `/parent/analytics/children/{studentUserId}`
- If `groupName` is null → show *"Class not assigned"* in muted text

### Empty State (No children linked)
```
[👨‍👩‍👧 illustration]
No children linked to your account
Contact your school administrator to link your child's account.
```

---

## 4. Child Dashboard Page

### Route
```
/parent/analytics/children/:studentUserId
```

### Page Layout
```
┌──────────────────────────────────────────────────────────────┐
│  ← My Children                                               │
│                                                               │
│  [Emily ▼]  [Aryan ▼]           [From: ___]  [To: ___]     │
│  (child selector tabs / dropdown — only shown if > 1 child)  │
│                                                               │
│  👤 Emily Sharma   |   Class 9A                              │
├──────────────────────┬───────────────────────────────────────┤
│  Completion Rate     │  Avg Score                            │
│  [stat card]         │  [stat card]                          │
├──────────────────────┼───────────────────────────────────────┤
│  Rank in Class       │  Class Size                           │
│  [stat card]         │  [stat card]                          │
├──────────────────────┴───────────────────────────────────────┤
│  Performance Progression                                      │
│  [bar + trendline chart — full width]                        │
├──────────────────────────────────────────────────────────────┤
│  Subject Mastery                                              │
│  [scrollable row of subject cards — full width]              │
├──────────────────────────────────────────────────────────────┤
│  Exam History                                                 │
│  [expandable table with show-more — full width]              │
└──────────────────────────────────────────────────────────────┘
```

### Child Selector (top of page — only when parent has > 1 child)
```
[Emily ▼]  [Aryan ▼]      ← tabs (if 2–4 children)
     or
[Select child ▼]           ← dropdown (if >= 5 children)
```
- Switching child → re-call the dashboard endpoint with the new `studentUserId`
- Preserve date filter selection across child switches

---

## 5. API Reference

### Endpoint
```
GET /analytics/parent/children/{studentUserId}/dashboard
```

### Query Parameters
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
    "studentName": "Emily Sharma",
    "completionRate": {
      "totalAssigned": 10,
      "totalCompleted": 8,
      "completionRate": 80.0
    },
    "avgScore": {
      "avgPercentage": 76.4,
      "totalExamsAttempted": 8
    },
    "rankInClass": 5,
    "classSize": 32,
    "progression": {
      "points": [
        { "examId": "uuid-e1", "examTitle": "Maths Unit 1",    "percentage": 72.0, "submittedAt": "2026-01-10T09:00:00Z" },
        { "examId": "uuid-e2", "examTitle": "Science Chapter 2","percentage": 80.0, "submittedAt": "2026-01-24T10:30:00Z" },
        { "examId": "uuid-e3", "examTitle": "English Essay",    "percentage": 77.0, "submittedAt": "2026-02-05T11:00:00Z" }
      ]
    },
    "heatmap": {
      "subjectMasteries": [
        { "subjectId": "uuid-s1", "subjectName": "Mathematics", "avgPercentage": 72.0, "masteryLevel": "Achiever" },
        { "subjectId": "uuid-s2", "subjectName": "Science",     "avgPercentage": 80.0, "masteryLevel": "Achiever" },
        { "subjectId": "uuid-s3", "subjectName": "English",     "avgPercentage": 77.0, "masteryLevel": "Achiever" }
      ]
    },
    "performanceTable": [
      {
        "examId": "uuid-e3",
        "examTitle": "English Essay",
        "score": 38,
        "percentage": 77.0,
        "passed": true,
        "submittedAt": "2026-02-05T11:00:00Z",
        "topicBreakdown": [
          { "topic": "Grammar",     "correct": 7,  "incorrect": 3, "accuracy": 70.0 },
          { "topic": "Vocabulary",  "correct": 9,  "incorrect": 1, "accuracy": 90.0 },
          { "topic": "Comprehension","correct": 8, "incorrect": 2, "accuracy": 80.0 }
        ]
      }
    ]
  }
}
```

---

## 6. Widget Specifications

> All 6 widgets are **identical in behaviour and styling** to the Student self-view (`01_student_analytics.md §4`), with these differences:
>
> - **Field name difference:** the rank field is `rankInClass` (not `myRank` as in the student view). Map accordingly.
> - **Read-only:** parent cannot take any action from this dashboard — display only.
> - **Header:** shows child name and class, not "My Analytics".

### Widget mapping

| Widget | Source field | Same spec as student view? |
|--------|-------------|---------------------------|
| Completion Rate | `data.completionRate` | ✅ Identical |
| Avg Score | `data.avgScore` | ✅ Identical |
| Rank in Class | `data.rankInClass` + `data.classSize` | ✅ Identical (field is `rankInClass` not `myRank`) |
| Progression Chart | `data.progression.points` | ✅ Identical |
| Subject Mastery | `data.heatmap.subjectMasteries` | ✅ Identical |
| Exam History Table | `data.performanceTable` | ✅ Identical (show-more, expandable topics) |

---

## 7. Full API Call Sequence

```
1. User clicks "My Children" in sidebar
   → GET /analytics/parent/children
   → Render child cards; or empty state if [] returned

2. User clicks "View Analytics →" on Emily's card
   → Navigate to /parent/analytics/children/{emily_studentUserId}
   → GET /analytics/parent/children/{emily_studentUserId}/dashboard
   → Show skeleton loaders → populate all 6 widgets

3. If parent has > 1 child: render child selector tabs/dropdown at top of dashboard
   → User clicks "Aryan" tab
   → GET /analytics/parent/children/{aryan_studentUserId}/dashboard
   → Replace all widget data (preserve date filter)

4. User changes date range
   → GET /analytics/parent/children/{studentUserId}/dashboard?from=...&to=...
   → Refresh all widgets

5. User clicks "← My Children" back button
   → Return to /parent/children
```

---

## 8. Error Reference

| Scenario | Behaviour |
|----------|-----------|
| `GET /analytics/parent/children` returns `[]` | Show empty state: *"No children linked to your account. Contact your school administrator."* |
| `403` on child dashboard | Show: *"This child is not linked to your account."* |
| `404` on child dashboard | Show: *"Child not found."* + back button |
| `rankInClass === null` | Show `—` with *"No exam results yet"* |
| `500` | Toast + per-widget error state with Retry |
| `groupName === null` | Show *"Class not assigned"* in muted text on child card |
| Any widget data empty | Widget-specific empty state (same as student view) |
