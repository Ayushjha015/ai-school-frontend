# Student Analytics — Frontend Integration Spec

> **Role:** `STUDENT`
> **Prerequisite:** Read `00_analytics_overview.md` first for shared models, colors, and components.
> **Route:** `/student/analytics`
> **API:** `GET /analytics/student/dashboard`

---

## 1. Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  📈 My Analytics                    [From: ___]  [To: ___]  │
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
│  My Exam History                                             │
│  [data table — full width, expandable rows, show more]      │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. API Reference

### Endpoint
```
GET /analytics/student/dashboard
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
    "completionRate": {
      "totalAssigned": 10,
      "totalCompleted": 7,
      "completionRate": 70.0
    },
    "avgScore": {
      "avgPercentage": 73.5,
      "totalExamsAttempted": 7
    },
    "myRank": 3,
    "classSize": 32,
    "progression": {
      "points": [
        { "examId": "uuid-1", "examTitle": "Maths Mid-Term",    "percentage": 68.0, "submittedAt": "2026-01-15T10:30:00Z" },
        { "examId": "uuid-2", "examTitle": "Science Chapter 3", "percentage": 75.5, "submittedAt": "2026-01-28T09:00:00Z" },
        { "examId": "uuid-3", "examTitle": "English Grammar",   "percentage": 82.0, "submittedAt": "2026-02-10T11:00:00Z" }
      ]
    },
    "heatmap": {
      "subjectMasteries": [
        { "subjectId": "uuid-s1", "subjectName": "Mathematics", "avgPercentage": 68.5, "masteryLevel": "Achiever" },
        { "subjectId": "uuid-s2", "subjectName": "Science",     "avgPercentage": 87.0, "masteryLevel": "Star"     },
        { "subjectId": "uuid-s3", "subjectName": "English",     "avgPercentage": 55.0, "masteryLevel": "Learner"  }
      ]
    },
    "performanceTable": [
      {
        "examId": "uuid-3",
        "examTitle": "English Grammar",
        "score": 41,
        "percentage": 82.0,
        "passed": true,
        "submittedAt": "2026-02-10T11:00:00Z",
        "topicBreakdown": [
          { "topic": "Tenses",      "correct": 8,  "incorrect": 2, "accuracy": 80.0  },
          { "topic": "Punctuation", "correct": 10, "incorrect": 0, "accuracy": 100.0 }
        ]
      }
    ]
  }
}
```

---

## 3. Widget Specifications

---

### Widget 1 — Completion Rate

**Source:** `data.completionRate`

```
┌─────────────────────────────────┐
│  ✅ Completion Rate              │
│                                  │
│         70%                      │  ← completionRate (big number)
│  7 of 10 exams completed         │  ← "totalCompleted of totalAssigned exams completed"
│  ████████░░  70%                 │  ← horizontal progress bar
└─────────────────────────────────┘
```

**Color rules (progress bar + % number):**
- `>= 80` → Green `#10B981`
- `>= 50` → Amber `#F59E0B`
- `< 50` → Red `#EF4444`

**Empty state:** `totalAssigned === 0` → *"No exams assigned to your class yet."*

---

### Widget 2 — Avg Score

**Source:** `data.avgScore`

```
┌─────────────────────────────────┐
│  📊 Avg Score                    │
│                                  │
│         73.5%                    │  ← avgPercentage
│  across 7 exams                  │  ← "across totalExamsAttempted exams"
│  🎯 Achiever                     │  ← mastery badge derived from avgPercentage
└─────────────────────────────────┘
```

**Mastery badge:** derived by applying the thresholds from `00_analytics_overview.md §5`.

**Empty state:** `totalExamsAttempted === 0` → *"Complete your first exam to see your score."*

---

### Widget 3 — Rank in Class

**Source:** `data.myRank`, `data.classSize`

```
┌─────────────────────────────────┐
│  🏆 Rank in Class                │
│                                  │
│         #3                       │  ← myRank
│  out of 32 students              │  ← classSize
└─────────────────────────────────┘
```

**Special cases:**
- `myRank === 1` → show `👑 #1`
- `myRank === null` → show `—` with subtext *"Complete an exam to get ranked"*

---

### Widget 4 — Performance Progression

**Source:** `data.progression.points`

**Chart type:** Vertical bar chart with a smooth trend line overlay

**Recharts implementation (ComposedChart):**
```jsx
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const getMasteryColor = (pct) => {
  if (pct >= 85) return '#F59E0B';  // gold — Star
  if (pct >= 60) return '#3B82F6';  // blue — Achiever
  return '#9CA3AF';                  // gray — Learner
};

<ResponsiveContainer width="100%" height={280}>
  <ComposedChart data={points} margin={{ top: 16, right: 24, bottom: 32, left: 0 }}>
    <XAxis
      dataKey="examTitle"
      tickFormatter={(v) => v.length > 20 ? v.slice(0, 18) + '…' : v}
      angle={-30}
      textAnchor="end"
    />
    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
    <Tooltip content={<ProgressionTooltip />} />
    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
      {points.map((p) => (
        <Cell key={p.examId} fill={getMasteryColor(p.percentage)} />
      ))}
    </Bar>
    <Line
      type="monotone"
      dataKey="percentage"
      stroke="#6366F1"
      strokeWidth={2}
      dot={false}
    />
  </ComposedChart>
</ResponsiveContainer>
```

**Custom Tooltip:**
```jsx
const ProgressionTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { examTitle, percentage, submittedAt } = payload[0].payload;
  return (
    <div className="bg-white border rounded shadow p-2 text-sm">
      <p className="font-semibold">{examTitle}</p>
      <p>Score: {percentage}%</p>
      <p>Date: {submittedAt ? formatDate(submittedAt) : '—'}</p>
    </div>
  );
};
```

**Edge cases:**
- `points.length === 0` → empty state: *"Complete your first exam to see your progression."*
- `points.length === 1` → render single bar; hide the trend line (min 2 points needed)

---

### Widget 5 — Subject Mastery

**Source:** `data.heatmap.subjectMasteries`

> ⚠️ This is a **flat list of subject cards** — NOT a grid. One card per subject.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  📚 Subject Mastery                                         │
│                                                             │
│  → horizontally scrollable row (overflow-x: auto)          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Mathematics  │  │   Science    │  │   English    │  →   │
│  │   68.5%      │  │   87.0%      │  │   55.0%      │      │
│  │ 🎯 Achiever  │  │  ⭐ Star     │  │ 📖 Learner   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────┘
```

**Card backgrounds (use mastery level colors from §5 of overview):**
- Star → `#FEF3C7`
- Achiever → `#DBEAFE`
- Learner → `#F3F4F6`

**Zero-attempt subject:** show card with 50% opacity + `"No attempts yet"` instead of `%`.

**Empty state:** `subjectMasteries.length === 0` → *"No subjects with active exams found."*

---

### Widget 6 — Exam History Table

**Source:** `data.performanceTable`

**Columns:**
| Column | Field | Notes |
|--------|-------|-------|
| Exam | `examTitle` | Truncate at 30 chars; full title in tooltip |
| Score | `score` | Raw number (e.g. "41") |
| Percentage | `percentage` | `"73.5%"` |
| Result | `passed` | ✅ **Pass** (green) / ❌ **Fail** (red) badge |
| Date | `submittedAt` | `"10 Feb 2026"`; `—` if null |
| Topics | `topicBreakdown` | Expand toggle (▶ / ▼) |

**Pagination — Show More pattern:**
- Default: show first 10 rows
- Show button: *"Show all X results"* (where X = `performanceTable.length`)
- On click: reveal remaining rows (no API call needed — all data is already in response)

**Expandable topic row:**
When user clicks a row, expand a section below it showing a mini horizontal bar chart:

```jsx
// One bar per topic in topicBreakdown (sorted weakest → strongest already by API)
// Bar width = accuracy %
// Bar color:
//   accuracy >= 75 → #10B981 green
//   accuracy >= 50 → #F59E0B amber
//   accuracy < 50  → #EF4444 red

{topicBreakdown.map((t) => (
  <div key={t.topic} className="flex items-center gap-2 py-1">
    <span className="w-32 text-sm text-gray-600 truncate">{t.topic}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full"
        style={{ width: `${t.accuracy}%`, background: getAccuracyColor(t.accuracy) }}
      />
    </div>
    <span className="text-xs text-gray-500 w-10 text-right">{t.accuracy}%</span>
  </div>
))}
```

**Empty state:** `performanceTable.length === 0` → *"You haven't completed any exams yet."*

---

## 4. API Call Sequence

```
1. User lands on /student/analytics
   → show skeleton loaders for all 6 widgets

2. GET /analytics/student/dashboard
   → on success: populate all 6 widgets simultaneously
   → on 404: show full-page error "Student profile not found. Contact your administrator."
   → on 403: redirect to login

3. User changes date range picker
   → GET /analytics/student/dashboard?from=...&to=...
   → re-show skeletons → replace with new data
```

---

## 5. Error Reference

| Scenario | Behaviour |
|----------|-----------|
| `404` | Full-page error: *"Student profile not found."* |
| `403` | Redirect to login |
| `500` | Toast + per-widget error state with Retry |
| `myRank === null` | Show `—` with *"Complete an exam to get ranked"* |
| `submittedAt === null` | Show `—` in date column |
| `points.length < 2` | Render bars but skip trend line |
| `subjectMasteries.length === 0` | Widget empty state (not an error) |
