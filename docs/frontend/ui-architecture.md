# UI Architecture

## Stack
- Next.js (pages router)
- TypeScript
- TailwindCSS
- Zustand (state)
- TanStack Query (data fetching)
- shadcn-style UI components
- Lucide icons

## Layout
Required layout is implemented:
- Header
- Left Sidebar (collapsible)
- Main Content
- Right Widget Panel
- Footer

Minimum desktop baseline:
- `lg:min-w-[1280px]` for dashboard area.

## State Management
- `auth-store`: token + user
- `ui-store`: theme + sidebar
- `filters-store`: advanced query state

## Data Flow
UI -> API wrapper -> FastAPI backend -> repositories/services.
