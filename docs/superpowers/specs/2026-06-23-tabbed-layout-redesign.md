# OpenRouter Mastery — Tabbed Layout Redesign

## Goal
Redesign the OpenRouter Mastery course HTML/CSS/JS pages to use a **tabbed layout per session** (Learn | Lab | Quiz) instead of the current single-long-scroll. Improve visual hierarchy, interactivity, mobile responsiveness, and overall polish while keeping the content unchanged.

## Problem Statement
The current layout stacks Learn/Lab/Quiz vertically on one long page. Users reported:
- Walls of text with no visual breaks
- One long scroll is tedious
- Quiz is not interactive (cosmetic radio buttons with `<details>` reveals)
- Looks plain/dated
- Learn/Lab/Quiz all look the same visually

## Approach: Tabbed Session Layout
Each session page gets a tab bar with three tabs. Only one tab's content is visible at a time. Tabs switch via JS (no page reload).

### Page Structure
```
[Header / Site Nav (sticky)]
[Breadcrumb]
[H1 Title + Meta bar (duration, level, tags)]
[Tab Bar (sticky, below header)]
  ├── 📖 Learn  (default active)
  ├── 🔬 Lab
  └── 📝 Quiz
[Tab Content — only active tab shown]
[Prev / Next Navigation]
```

### Each Tab Has Distinct Visual Identity

| Tab | Background | Accent | Purpose |
|-----|-----------|--------|---------|
| Learn | White (#FFF) | Purple (#6A3DE8) | Concept explanations, code examples |
| Lab | Warm orange (#FFF7ED) | Orange (#EA580C) | Hands-on steps, code blocks |
| Quiz | Green tint (#ECFDF5) | Green (#10B981) | Interactive quiz with scoring |

### Key Features

1. **Tab switching** — click a tab to show/hide corresponding content div. Active tab gets purple highlight. Smooth transition.

2. **Learn tab sidebar** — sticky "In this session" outline on the right (desktop) showing H2/H3 headings from the Learn content. Scroll-spy highlights current section. Collapses to top on mobile.

3. **Code blocks with copy button** — each `<pre><code>` block gets a "Copy" button in the top-right corner. Click copies to clipboard.

4. **Interactive Quiz** — radio buttons are functional with a "Submit & Check" button. Clicking submit:
   - Highlights correct answers green, incorrect red
   - Shows score (e.g., "4 / 5")
   - Option to retry or move on

5. **Callout boxes** — `.note` (blue left border + book icon), `.tip` (green left border + lightbulb icon), `.warning` (amber left border + warning icon). Consistent padding and border-radius across all three.

6. **Mobile responsive** — at <768px:
   - Tab bar becomes a horizontal scrollable pill
   - Learn sidebar collapses to an expandable "In this session" dropdown at top
   - Quiz options stack full-width
   - Reduced font sizes
   - Touch-friendly button sizes (min 44px)

7. **Landing page polish** — each track (Beginner/Intermediate/Expert) gets a distinct accent color:
   - Beginner: Purple (#6A3DE8)
   - Intermediate: Amber (#F59E0B)
   - Expert: Green (#10B981)

8. **Favicon** — simple SVG favicon with the course brand mark.

9. **On-page progress** — session pages show a mini progress bar at the top of the Learn tab showing how many of the 33 sessions have been marked complete (e.g., "5 / 33 sessions completed"). Data from localStorage.

### Files to Modify
- `assets/css/styles.css` — complete rewrite of session-related styles (retain landing/section styles)
- `assets/js/progress.js` — extend for quiz scoring tracking
- `assets/js/session.js` — **new file** — tab switching, copy buttons, quiz logic, sidebar scroll-spy
- All 33 session HTML files — restructure into tabbed layout
- 3 section HTML files — minor visual polish (track accent colors)
- `index.html` — minor polish (track accent colors, favicon)

### Quiz Interaction Design
- Each question rendered as a radio group with labels
- "Submit & Check" button at bottom
- On submit:
  - Correct answer label turns green with checkmark
  - Wrong selected answer turns red with X
  - Score counter updates
  - Disable further changes
- "Reset" button to retry

### Tab Switching Behavior
- Only one tab's `.tab-content` visible at a time
- Switching tabs resets scroll position to top of content
- Active tab is persisted in localStorage per session (so returning to a session shows the last-used tab)
- URL hash updated to `#learn`, `#lab`, `#quiz`

### Mobile Considerations
- Tab bar: horizontal scroll with pill-style tabs (compact)
- Sidebar: becomes a collapsible `<details>` element at the top of Learn
- Code blocks: horizontal scroll rather than wrapping
- Quiz options: full-width tap targets
- No hover-dependent interactions (all work on touch)
- All interactive elements minimum 44x44px touch target

### Non-Goals
- No backend or server-side changes (static HTML/JS/CSS only)
- No database (localStorage only for progress + quiz scores)
- No framework or build step (vanilla JS)
- No image assets or external dependencies beyond Font Awesome

## Implementation Scope
Approximately: 1 CSS file rewrite + 1 new JS file + bulk edit of 33 session HTML files + minor edits to 4 top-level pages.
