
# Dissertation Registry System – UI/UX Specification

This document defines the UI / UX architecture and visual design system
for the Dissertation Problems & Proposals Registry System.

This specification is intended for:

- Frontend developers
- Designers
- AI coding agents (Codex / Cursor / Claude Code)

---

# 1. Layout Architecture

Layout type: Left Sidebar Dashboard Layout

Structure:

Header
Sidebar (left navigation)
Main Content
Right Widget Panel
Footer

Sidebar must be collapsible.

Minimum desktop width: 1280px.

---

# 2. Layout Diagram

┌──────────────────────────────────────────────┐
│ Header                                       │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Content                  │
│              │                               │
│              │                               │
│              │                               │
│              │                               │
│              │                               │
│              │                               │
│              │                               │
├──────────────┴───────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘

---

# 3. Visual Style

Use Glass UI style.

Components must include:

- backdrop blur
- transparent background
- rounded corners
- soft shadows

Example Tailwind:

backdrop-blur
bg-white/70
shadow-xl
rounded-xl

---

# 4. Color System

Primary Accent Color:
Blue 500

Background:
Slate 100

Borders:
Zinc 200

Example:

bg-slate-100
border-zinc-200
bg-white/80

---

# 5. Typography

Fonts:

Headings:
Noto Sans Mono

Body:
IBM Plex Serif

Sizes:

Heading: 32–40px
Subheading: 20–24px
Body: 14–16px

Heading style:

font-medium
tracking-tight

---

# 6. Dashboard Cards

Statistics cards:

Total Dissertations
Pending Review
Approved Proposals
Expert Mentors

Card must include:

Icon
Number
Status indicator

Example:

+12%
Active

---

# 7. Data Tables

Tables must support:

sorting
filtering
pagination
status badges

Columns example:

Applicant
Research Title
Status
Direction
Actions

Statuses:

Approved
Rejected
Under Review

---

# 8. Right Sidebar Widgets

Widget 1

AI Research Assistant

Elements:

Title
Description
Primary Button

Start Analysis

Widget 2

Quick Actions

Submit Proposal
Review Analytics
Supervisor Portal

---

# 9. Advanced Filters

Filters must include:

registry categories
expert rating slider
region selector
visibility toggle

Action button:

Apply Parameters

---

# 10. Search Interface

Search fields:

title
problem
proposal
annotation
conclusion
keywords
author
supervisor
university
scientific direction

Search must support:

multi-filter
keyword search
tag filters

---

# 11. AI Assistant

ChatGPT style interface.

Components:

conversation messages
input box
suggested prompts
reference links

---

# 12. Animations

Use subtle animations:

slide
blur
word-by-word reveal

Animation rules:

ease-out
200–300ms
repeat once

Example:

transition-all duration-300 ease-out

---

# 13. UI Components

Reusable components:

Button
Input
Select
Checkbox
Radio
Modal
Dropdown
Tabs
Table
Card
Pagination
Notification
Toast

All components must follow the same design system.

---

# 14. Responsive Design

Support:

Desktop
Tablet
Mobile

Breakpoints:

sm
md
lg
xl
2xl

---

# 15. Dark Mode

System must support dark mode.

Switch should be in header.

---

# 16. Frontend Stack

Framework:
Next.js

Language:
TypeScript

Styling:
TailwindCSS

State:
Zustand

Data fetching:
TanStack Query

UI Components:
Shadcn UI

Icons:
Lucide

---

# 17. Usage for AI

AI coding agents must:

1. Follow this design specification.
2. Generate reusable UI components.
3. Implement dashboard layout.
4. Use TailwindCSS.
5. Apply glass style cards.
