# Updated API & Tag Module — Frontend Integration Spec

> **Purpose:** This document is a self-contained reference describing every API change and new UI requirement introduced by the **Tags feature**. A frontend AI reading this document — together with the existing `api_reference.md`, `data_models.md`, and `roles_and_permissions.md` — has everything needed to integrate the changes and build new UI without reading backend code.

---

## 1. Overview

A **global Tags system** has been added to the platform. Tags are cognitive-skill labels (e.g. "Reasoning", "Memory", "Analytical") that classify exam questions.

### Key Behaviour
- **SUPER_ADMIN** owns the global tag library — create, rename, delete tags
- **TEACHER / ORG_ADMIN** can read the tag list to assign tags manually when creating questions
- **AI auto-assigns tags** when generating questions — the teacher cannot override them
- **Questions** (both manually created and AI-generated) carry a `tags` array in every response
- **Tags are visible** to students and parents on the **result page only** (not during active exam-taking)
- Tag colors are assigned **deterministically by tag name** (same tag = always same color)

---

## 2. New Data Models

### 2.1 `TagResponse`
Returned by all tag CRUD endpoints.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Tag ID |
| `name` | string | Tag name (unique, case-sensitive) |
| `createdAt` | datetime | ISO 8601 creation timestamp |

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Reasoning",
  "createdAt": "2026-04-03T10:00:00Z"
}
```

---

### 2.2 `QuestionTagResponse`
Inline shape embedded inside `QuestionResponse` and `GeneratedQuestionResponse`. Intentionally lighter than `TagResponse` (no timestamp).

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Tag ID |
| `name` | string | Tag name |

```json
{ "id": "uuid", "name": "Reasoning" }
```

---

### 2.3 `TagListResponse`
Returned by `GET /tags`. Always returns **all tags** without pagination (the list is small by design).

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of tags in the system |
| `items` | `TagResponse[]` | All tags, sorted alphabetically by name |

```json
{
  "total": 5,
  "items": [
    { "id": "uuid-1", "name": "Analytical", "createdAt": "..." },
    { "id": "uuid-2", "name": "Knowledge",  "createdAt": "..." },
    { "id": "uuid-3", "name": "Memory",     "createdAt": "..." },
    { "id": "uuid-4", "name": "Reasoning",  "createdAt": "..." },
    { "id": "uuid-5", "name": "Vocabulary", "createdAt": "..." }
  ]
}
```

---

### 2.4 Updated `QuestionResponse` ⚠️ CHANGED
The `tags` field is **new**. Every question response now includes it (defaults to empty array `[]` for untagged questions).

| Field | Type | Change |
|-------|------|--------|
| `id` | uuid | — unchanged |
| `subjectId` | uuid | — unchanged |
| `createdBy` | uuid | — unchanged |
| `questionText` | string | — unchanged |
| `topic` | string or null | — unchanged |
| `difficulty` | string or null | — unchanged |
| `options` | `QuestionOptionResponse[]` | — unchanged |
| `tags` | `QuestionTagResponse[]` | ✅ **NEW** — 0–3 tags assigned to this question |
| `createdAt` | datetime | — unchanged |

```json
{
  "id": "uuid",
  "subjectId": "uuid",
  "createdBy": "uuid",
  "questionText": "Solve x² + 5x + 6 = 0",
  "topic": "Algebra",
  "difficulty": "medium",
  "options": [
    { "id": "uuid", "optionText": "x = -2, -3", "isCorrect": true },
    { "id": "uuid", "optionText": "x = 2, 3",   "isCorrect": false }
  ],
  "tags": [
    { "id": "uuid-4", "name": "Reasoning" },
    { "id": "uuid-2", "name": "Knowledge" }
  ],
  "createdAt": "2026-04-03T10:00:00Z"
}
```

---

### 2.5 Updated `GeneratedQuestionResponse` (AI Preview) ⚠️ CHANGED
Returned by `POST /ai/generate-questions`. Each generated question now carries AI-chosen tags.

| Field | Type | Change |
|-------|------|--------|
| `questionText` | string | — unchanged |
| `topic` | string or null | — unchanged |
| `difficulty` | string or null | — unchanged |
| `options` | `GeneratedOptionResponse[]` | — unchanged |
| `tags` | `QuestionTagResponse[]` | ✅ **NEW** — AI-chosen tags (may be empty `[]`) |

> **Important:** The `tags[].id` values in this response are real UUIDs from the database. The frontend must pass these IDs back as `tagIds` when calling `POST /ai/save-generated-questions`. AI tag choices are **final** — the teacher cannot change them.

---

### 2.6 Updated `CreateQuestionRequest` ⚠️ CHANGED

| Field | Type | Required | Change |
|-------|------|----------|--------|
| `subjectId` | uuid | ✅ | — unchanged |
| `questionText` | string | ✅ | — unchanged |
| `topic` | string or null | ❌ | — unchanged |
| `difficulty` | Difficulty or null | ❌ | — unchanged |
| `options` | `QuestionOptionInput[]` | ✅ | — unchanged |
| `tagIds` | `uuid[]` or null | ❌ | ✅ **NEW** — 1–3 tag IDs from `GET /tags` |

> **Validation (handled by backend):** If `tagIds` is provided, must be 1–3 valid tag UUIDs. Sending an invalid UUID returns 404. Sending more than 3 returns 400.

---

### 2.7 Updated `UpdateQuestionRequest` ⚠️ CHANGED

| Field | Type | Required | Change |
|-------|------|----------|--------|
| `questionText` | string or null | ❌ | — unchanged |
| `topic` | string or null | ❌ | — unchanged |
| `difficulty` | Difficulty or null | ❌ | — unchanged |
| `options` | `QuestionOptionInput[]` or null | ❌ | — unchanged |
| `tagIds` | `uuid[]` or null | ❌ | ✅ **NEW** — if provided, **replaces all existing tags** (all-or-nothing) |

> Sending `tagIds: []` (empty array) is treated as "remove all tags". Sending `tagIds: null` (or omitting the field) leaves existing tags unchanged.

---

### 2.8 Updated `SaveQuestionInput` (inside `SaveGeneratedQuestionsRequest`) ⚠️ CHANGED

| Field | Type | Required | Change |
|-------|------|----------|--------|
| `questionText` | string | ✅ | — unchanged |
| `topic` | string or null | ❌ | — unchanged |
| `difficulty` | string or null | ❌ | — unchanged |
| `options` | `SaveOptionInput[]` | ✅ | — unchanged |
| `tagIds` | `uuid[]` or null | ❌ | ✅ **NEW** — pass the IDs from the generate-questions response |

---

## 3. New APIs — Tags CRUD

> **Base URL:** same as all other endpoints
> **Auth:** Bearer token required on all 4 endpoints

---

### API-T1: Create Tag
- **Method:** `POST`
- **Path:** `/tags`
- **Auth:** SUPER_ADMIN only
- **Operation ID:** `create_tag`

**Request Body:**
```json
{ "name": "Reasoning" }
```
*`name` must not be blank. Leading/trailing whitespace is stripped. Names are case-sensitively unique.*

**Response (201):**
```json
{
  "status": "SUCCESS",
  "code": 201,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Reasoning",
    "createdAt": "2026-04-03T10:00:00Z"
  }
}
```

**Error Responses:**
| Code | When |
|------|------|
| 401 | Not authenticated |
| 403 | Caller is not SUPER_ADMIN |
| 409 | Tag with this exact name already exists |
| 422 | Name is blank or missing |

---

### API-T2: List All Tags
- **Method:** `GET`
- **Path:** `/tags`
- **Auth:** SUPER_ADMIN, ORG_ADMIN, TEACHER
- **Operation ID:** `list_tags`
- **No query parameters** — returns all tags at once (no pagination)

**Response (200):**
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": {
    "total": 3,
    "items": [
      { "id": "uuid-1", "name": "Analytical", "createdAt": "2026-04-01T..." },
      { "id": "uuid-2", "name": "Memory",     "createdAt": "2026-04-01T..." },
      { "id": "uuid-3", "name": "Reasoning",  "createdAt": "2026-04-01T..." }
    ]
  }
}
```

**Error Responses:**
| Code | When |
|------|------|
| 401 | Not authenticated |
| 403 | Caller is STUDENT or PARENT (not allowed to call this endpoint directly) |

> **Note:** Students and parents see tags as part of `QuestionResponse` (e.g. on results page). They do not call `GET /tags` directly.

---

### API-T3: Update Tag (Rename)
- **Method:** `PATCH`
- **Path:** `/tags/{tag_id}`
- **Auth:** SUPER_ADMIN only
- **Operation ID:** `update_tag`

**Path Params:** `tag_id` (uuid)

**Request Body:**
```json
{ "name": "Critical Reasoning" }
```

**Response (200):**
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Critical Reasoning",
    "createdAt": "2026-04-03T10:00:00Z"
  }
}
```

**Error Responses:**
| Code | When |
|------|------|
| 401 | Not authenticated |
| 403 | Caller is not SUPER_ADMIN |
| 404 | Tag not found |
| 409 | New name already taken by another tag |
| 422 | Name is blank |

---

### API-T4: Delete Tag
- **Method:** `DELETE`
- **Path:** `/tags/{tag_id}`
- **Auth:** SUPER_ADMIN only
- **Operation ID:** `delete_tag`

**Path Params:** `tag_id` (uuid)

**Response (204):** No content

**Side effects:**
- All `question_tags` junction rows referencing this tag are **automatically deleted** (cascade)
- Questions that had only this tag will now have `tags: []`

**Error Responses:**
| Code | When |
|------|------|
| 401 | Not authenticated |
| 403 | Caller is not SUPER_ADMIN |
| 404 | Tag not found |

---

## 4. Changed Existing APIs

---

### 4.1 `POST /questions` — Create Question ⚠️ CHANGED

**Request — what's new:**
```diff
 {
   "subjectId": "uuid",
   "questionText": "What is photosynthesis?",
   "topic": "Biology",
   "difficulty": "easy",
+  "tagIds": ["uuid-tag-1", "uuid-tag-2"],
   "options": [
     { "optionText": "Process of making food using sunlight", "isCorrect": true },
     { "optionText": "Process of respiration", "isCorrect": false }
   ]
 }
```
*`tagIds` is optional. If provided: 1–3 valid tag UUIDs from `GET /tags`.*

**Response — what's new:**
```diff
 {
   "data": {
     "id": "uuid",
     "subjectId": "uuid",
     "createdBy": "uuid",
     "questionText": "What is photosynthesis?",
     "topic": "Biology",
     "difficulty": "easy",
     "options": [ ... ],
+    "tags": [
+      { "id": "uuid-tag-1", "name": "Knowledge" },
+      { "id": "uuid-tag-2", "name": "Memory" }
+    ],
     "createdAt": "..."
   }
 }
```

---

### 4.2 `PUT /questions/{question_id}` — Update Question ⚠️ CHANGED

**Request — what's new:**
```diff
 {
   "questionText": "Updated question text",
   "difficulty": "medium",
+  "tagIds": ["uuid-tag-3"]
 }
```
*If `tagIds` is provided, it **replaces all existing tags** (not additive).*

**Response — same as create response above (includes `tags` array).**

---

### 4.3 `GET /questions` — List Questions ⚠️ CHANGED

**Response — what's new (applies to every item in `items`):**
```diff
 {
   "data": {
     "total": 10,
     "page": 1,
     "limit": 20,
     "items": [
       {
         "id": "uuid",
         "questionText": "...",
         "topic": "...",
         "difficulty": "easy",
         "options": [ ... ],
+        "tags": [
+          { "id": "uuid", "name": "Reasoning" }
+        ],
         "createdAt": "..."
       }
     ]
   }
 }
```
*Questions without tags will have `"tags": []`.*

---

### 4.4 `POST /ai/generate-questions` — AI Question Preview ⚠️ CHANGED

**Request — UNCHANGED.**

**Response — what's new:**
```diff
 {
   "data": {
     "subjectId": "uuid",
     "generatedCount": 3,
     "questions": [
       {
         "questionText": "Solve x² + 5x + 6 = 0",
         "topic": "Quadratic Equations",
         "difficulty": "medium",
         "options": [
           { "optionText": "x = -2, -3", "isCorrect": true },
           { "optionText": "x = 2, 3",   "isCorrect": false }
         ],
+        "tags": [
+          { "id": "uuid-4", "name": "Reasoning" },
+          { "id": "uuid-2", "name": "Knowledge" }
+        ]
       }
     ]
   }
 }
```

> **Frontend must:**
> - Show the `tags` capsules on each question card in the preview UI
> - Extract the `id` values from `tags` and send them back as `tagIds` when saving

---

### 4.5 `POST /ai/save-generated-questions` — Save AI Questions ⚠️ CHANGED

**Request — what's new (per question object):**
```diff
 {
   "subjectId": "uuid",
   "questions": [
     {
       "questionText": "Solve x² + 5x + 6 = 0",
       "topic": "Quadratic Equations",
       "difficulty": "medium",
+      "tagIds": ["uuid-4", "uuid-2"],
       "options": [
         { "optionText": "x = -2, -3", "isCorrect": true },
         { "optionText": "x = 2, 3",   "isCorrect": false }
       ]
     }
   ]
 }
```

*`tagIds` is optional per question. If the AI returned `tags: []` for a question, send `tagIds: null` or omit the field.*

**Response — UNCHANGED.**
```json
{
  "data": {
    "savedCount": 3,
    "questionIds": ["uuid1", "uuid2", "uuid3"]
  }
}
```

---

## 5. SUPER_ADMIN — Tag Management Page UI Spec

### Route
```
/super-admin/tags
```
This is a **dedicated standalone page** accessible only by SUPER_ADMIN. Add it to the SUPER_ADMIN navigation alongside Organizations.

---

### 5.1 Page Layout

```
┌──────────────────────────────────────────────────────┐
│  Tags                                                 │
│  Manage global question tags used across all orgs     │
│                                                       │
│  ┌──────────────────────────────┐  ┌─────────────┐   │
│  │  Tag name...                 │  │  + Add Tag  │   │
│  └──────────────────────────────┘  └─────────────┘   │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  All Tags (12)                                  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────┐  │   │
│  │  │  Analytical  │ │   Memory     │ │  ...   │  │   │
│  │  └──────────────┘ └──────────────┘ └────────┘  │   │
│  │                                    [scrollable] │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

### 5.2 Create Tag (Top Input)

- Single text input + "Add Tag" button
- On submit → calls `POST /tags`
- **Success:** new tag capsule immediately appears in the box below; input clears
- **Error (409 conflict):** show inline error message below the input: *"A tag with this name already exists."*
- **Error (422):** show inline: *"Tag name cannot be blank."*
- Pressing `Enter` in the input should trigger the same action as clicking "Add Tag"

---

### 5.3 Tag Capsule Box (Below Input)

- Shows all tags from `GET /tags` on page load
- **Scrollable** container — fixed height (e.g. `max-height: 60vh`), vertical scroll when content overflows
- Each tag is a **capsule/pill** UI element
- Capsule color: determined by **hash-based color assignment** (see Section 6.2 for palette)
- The tag count is shown as a subtitle: *All Tags (12)*

---

### 5.4 Capsule Interaction States

#### State A — Default
- Shows tag name in colored capsule
- No action buttons visible

#### State B — Hover
- A **"×" (delete) button** appears on the right side of the capsule
- Cursor changes to pointer on hover

#### State C — Click on tag name (Edit mode)
- Tag name text becomes an **inline editable input** inside the capsule
- The "×" button **transforms into a "✓" (tick/check) button**
- User types the new name
- Clicking "✓" → calls `PATCH /tags/{tag_id}` with new name
  - **Success:** capsule updates in place with new name
  - **Error (409):** inline error tooltip on the capsule: *"Name already exists"*
  - **Error (422):** inline error: *"Name cannot be blank"*
- Pressing `Escape` cancels edit and reverts to default state
- Pressing `Enter` submits the edit (same as clicking "✓")

#### State D — Delete (Click "×")
- **Do NOT delete immediately**
- Show a **timed confirmation popup** (see 5.5 below)

---

### 5.5 Timed Delete Confirmation Popup

When the user clicks "×" on a tag capsule, a popup modal appears with:

**Popup content:**
```
⚠️  Delete tag "{tagName}"?

This will permanently remove the tag from ALL questions it has
been assigned to across the entire platform. This cannot be undone.

[Cancel]          [Delete tag — 5s]
```

**Behaviour:**
- The **"Delete tag"** button shows a countdown: *"Delete tag — 5s"*, *"Delete tag — 4s"*, etc.
- The countdown ticks every second
- **If user clicks "Delete tag" before time runs out** → call `DELETE /tags/{tag_id}` → remove capsule from UI on success
- **If user clicks "Cancel"** → popup closes, nothing happens
- **If 5 seconds elapse without any action** → popup auto-closes, deletion is **aborted**
- While popup is open, the background page is dimmed (modal overlay)

**Implementation notes:**
- Use `setTimeout` + `setInterval` for the countdown
- Clear all timers on Cancel or on successful delete
- If the DELETE call fails (e.g. 404 network error), show an error toast and close the popup

---

## 6. Tag Capsules on Question Cards

### 6.1 Placement & Appearance
- Tags appear in the **top-right corner** of every question card/box
- They are displayed as small colored **pill/capsule badges**
- Maximum 3 tags visible (by design — backend never returns more)
- Untagged questions simply show no badges (no placeholder)

---

### 6.2 Hash-Based Color Assignment

The frontend should derive a **deterministic color** from the tag's `name` string so the same tag always renders in the same color across sessions and users.

**Algorithm:**
```js
const TAG_PALETTE = [
  { bg: "#EDE9FE", text: "#6D28D9" }, // violet
  { bg: "#DBEAFE", text: "#1D4ED8" }, // blue
  { bg: "#D1FAE5", text: "#065F46" }, // emerald
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#FCE7F3", text: "#9D174D" }, // pink
  { bg: "#E0F2FE", text: "#0369A1" }, // sky
  { bg: "#FFE4E6", text: "#9F1239" }, // rose
  { bg: "#ECFCCB", text: "#3F6212" }, // lime
  { bg: "#F3E8FF", text: "#7E22CE" }, // purple
  { bg: "#FFEDD5", text: "#9A3412" }, // orange
];

function getTagColor(tagName) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_PALETTE.length;
  return TAG_PALETTE[index];
}
```
*Use `color.bg` as the capsule background and `color.text` as the text color.*

---

### 6.3 Where Tags Are Displayed

| View | Show Tags? | Notes |
|------|-----------|-------|
| **Question Bank list** (`GET /questions`) | ✅ Yes | Top-right of each question card |
| **Question detail view** | ✅ Yes | Same top-right placement |
| **AI-generated questions preview** | ✅ Yes | Shown after `POST /ai/generate-questions` returns; these are AI-chosen tags |
| **Exam creation — question picker** | ✅ Yes | Show tags when listing questions to add to exam |
| **During active exam (student view)** | ❌ No | Do not show tags to student while taking the exam |
| **Exam result page (student/parent view)** | ✅ Yes | Show tags on each question in the result breakdown |

---

## 7. Teacher — Tag Selection in Question Creation Form

### 7.1 Manual Question Creation (`POST /questions`)

When a teacher opens the **"Create Question"** form:

1. **On form mount:** call `GET /tags` to load the tag list
2. Show a **multi-select dropdown** (or tag picker) labelled **"Tags"** below the `difficulty` field
3. The dropdown lists all tags from `GET /tags` as selectable options
4. **Selection limit:** 1–3 tags maximum. Disable additional selections once 3 are chosen; show a tooltip: *"Maximum 3 tags allowed"*
5. Selected tags appear as colored capsules inside the input area (same capsule style as elsewhere)
6. Each selected capsule has an "×" to deselect it
7. The field is **optional** — the teacher can create a question without selecting any tags
8. On submit: collect the `id` values of selected tags and send as `tagIds` in the request body

**UX Example:**
```
Tags (optional)
┌──────────────────────────────────────────────┐
│  [Reasoning ×]  [Memory ×]  ▼               │
│                                               │
│  ▾ Dropdown                                  │
│    ○ Analytical                               │
│    ○ Knowledge                                │
│    ✓ Memory                                   │  ← already selected
│    ✓ Reasoning                                │  ← already selected
│    ○ Vocabulary                               │
└──────────────────────────────────────────────┘
```

---

### 7.2 Manual Question Update (`PUT /questions/{id}`)

- Same tag picker as above, pre-populated with the question's existing `tags`
- On submit with a changed tag selection: send `tagIds` in the request body
- If the teacher **clears all tags**: send `tagIds: []`
- If the teacher **makes no change to tags**: you may omit `tagIds` entirely (existing tags are preserved)

---

### 7.3 AI-Generated Questions Preview

After `POST /ai/generate-questions` returns:
- Show each question card with its AI-chosen tags in the top-right
- Tags are **read-only** in this view — no editing allowed
- A small label above the tags area: *"Auto-tagged by AI"*
- When the teacher clicks **"Save all questions"** or **"Save"** on individual questions:
  - Extract `tags[].id` from each question object
  - Send them as `tagIds` in the corresponding entry of `SaveGeneratedQuestionsRequest`

---

## 8. Updated Role Permissions

### 8.1 SUPER_ADMIN — Updated "Can Access" Table

Add the following to the SUPER_ADMIN permissions section:

| Endpoint | Action |
|----------|--------|
| `POST /tags` | Create a global tag |
| `GET /tags` | List all tags |
| `PATCH /tags/{tag_id}` | Rename a tag |
| `DELETE /tags/{tag_id}` | Delete a tag (cascades from all questions) |

---

### 8.2 ORG_ADMIN — Add to "Can Access"

| Endpoint | Action |
|----------|--------|
| `GET /tags` | Read global tags (needed for admin question operations) |

---

### 8.3 TEACHER — Add to "Can Access"

| Endpoint | Action |
|----------|--------|
| `GET /tags` | Read global tags (for dropdown in question creation form) |

---

### 8.4 Updated Permission Matrix

| Feature | SUPER_ADMIN | ORG_ADMIN | TEACHER | STUDENT | PARENT |
|---------|-------------|-----------|---------|---------|--------|
| Create Tags | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rename Tags | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Tags | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Tag List (`GET /tags`) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Tags to Questions | ❌ | ❌ | ✅ | ❌ | ❌ |
| See Tags on Questions (result page) | ❌ | ✅ | ✅ | ✅ | ✅ |
| See Tags on Questions (during exam) | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 9. Error Reference (Tags-Specific)

| HTTP Code | Error | Cause |
|-----------|-------|-------|
| 400 | `"A question must have between 1 and 3 tags."` | `tagIds` array has 0 or more than 3 entries |
| 403 | `"Unauthorized"` | STUDENT/PARENT calling `GET /tags`, or non-SUPER_ADMIN calling write endpoints |
| 404 | `"Tag not found."` | `tag_id` path param doesn't exist |
| 404 | `"Tag not found."` | One of the `tagIds` in a question request doesn't exist |
| 409 | `"A tag with this name already exists."` | Duplicate name on create or rename |

---

## 10. API Call Sequence — Common Flows

### Flow A: Teacher Creates a Tagged Question Manually
```
1. GET /tags                         → load tag list for dropdown
2. [teacher fills form + selects tags]
3. POST /questions  { ..., tagIds: ["uuid-1", "uuid-2"] }
   ← response includes tags: [{ id, name }, { id, name }]
4. Display question card with colored tag capsules top-right
```

### Flow B: AI Generates Tagged Questions
```
1. POST /ai/generate-questions  { subjectId, topic, difficulty, count }
   ← each question has tags: [{ id, name }, ...]
2. Display preview cards with tag capsules top-right ("Auto-tagged by AI")
3. Teacher clicks Save
4. POST /ai/save-generated-questions  {
     subjectId,
     questions: [
       { questionText, topic, difficulty, options, tagIds: [id1, id2] },
       { questionText, topic, difficulty, options, tagIds: [] }
     ]
   }
   ← { savedCount: 2, questionIds: [...] }
```

### Flow C: SUPER_ADMIN Manages Tags
```
1. GET /tags                         → populate the capsule box
2. [admin types name] POST /tags     → new tag appears in box
3. [admin clicks tag name] → edit mode → PATCH /tags/{id}
4. [admin hovers + clicks ×] → timed popup → DELETE /tags/{id}
```

### Flow D: Student views result with tags
```
1. GET /results/{attempt_id}
   ← answerDetails[].questionText + ... 
   (tags are part of QuestionResponse on the exam questions,
    rendered alongside each question in the result breakdown)
```
