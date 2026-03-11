# Frontend UI Arxitekturasi

## Texnologiyalar

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Next.js | 14.2 | React framework, Pages Router |
| React | 18.3 | UI library |
| TypeScript | 5.7 | Tip xavfsizligi |
| TailwindCSS | 3.4 | Utiliti-asosida stillar |
| Shadcn/ui | latest | Komponent kutubxonasi |
| Zustand | 5.0 | Client-side holat boshqaruvi |
| TanStack Query | 5.66 | Server holat va kesh |
| Lucide React | latest | Ikonlar |

---

## Papka tuzilishi

```
front/src/
├── pages/                      # Next.js Pages Router
│   ├── _app.tsx               # App wrapper (providers)
│   ├── index.tsx              # Asosiy sahifa (login redirect)
│   ├── login.tsx              # Login forma
│   └── dashboard/
│       ├── index.tsx          # Dashboard bosh sahifa
│       ├── dissertations.tsx  # Dissertatsiyalar ro'yxati
│       ├── dissertations/
│       │   ├── [id].tsx       # Dissertatsiya tafsilotlari
│       │   └── new.tsx        # Yangi dissertatsiya yaratish
│       └── users.tsx          # Foydalanuvchilar boshqaruvi
│
├── components/
│   ├── providers/
│   │   └── AppProviders.tsx   # Query client + auth setup
│   ├── dashboard/
│   │   ├── StatCard.tsx       # Statistika kartochkasi
│   │   ├── DissertationTable.tsx  # Dissertatsiyalar jadvali
│   │   ├── AdvancedFilters.tsx    # Qidiruv va filtrlash
│   │   ├── AIAssistantChat.tsx    # AI chat widget
│   │   └── RightWidgets.tsx       # O'ng panel widget
│   └── ui/                    # Shadcn/ui asosiy komponentlar
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       ├── checkbox.tsx
│       ├── dropdown-menu.tsx
│       ├── modal.tsx
│       ├── notification.tsx
│       ├── pagination.tsx
│       ├── radio-group.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       └── toast.tsx
│
├── layouts/
│   └── DashboardLayout.tsx    # Asosiy layout (sidebar + header)
│
├── hooks/
│   └── use-auth-guard.ts      # Auth himoyasi
│
├── services/
│   ├── api.ts                 # API klient (fetch wrapper)
│   └── query-client.ts        # React Query konfiguratsiyasi
│
├── store/
│   ├── auth-store.ts          # Autentifikatsiya holati
│   ├── filters-store.ts       # Filtrlash holati
│   └── ui-store.ts            # UI holati (sidebar, dark mode)
│
├── types/
│   └── index.ts               # TypeScript tiplari
│
├── lib/
│   └── utils.ts               # Yordamchi funksiyalar
│
└── styles/
    └── globals.css            # Global stillar
```

---

## Layout Arxitekturasi

```
┌──────────────────────────────────────────┐
│              HEADER                      │
│  Logo | Nav | Dark mode | User menu      │
├─────────────┬────────────────────────────┤
│             │                            │
│   SIDEBAR   │    MAIN CONTENT            │
│  (240px)    │                            │
│  Dashboard  │  StatCards                 │
│  Dissertat. │  DissertationTable         │
│  Users      │  AdvancedFilters           │
│  Settings   │  AIAssistantChat           │
│             │                            │
│ [collapse]  │                            │
├─────────────┴────────────────────────────┤
│              FOOTER                      │
└──────────────────────────────────────────┘
```

**Minimum kenglik:** 1280px (lg breakpoint)

---

## Holat boshqaruvi (Zustand)

### auth-store
```typescript
{
  token: string | null
  user: User | null
  setAuth(token, user): void
  clearAuth(): void
}
```

### ui-store
```typescript
{
  sidebarOpen: boolean
  darkMode: boolean
  toggleSidebar(): void
  toggleDarkMode(): void
}
```

### filters-store
```typescript
{
  query: string
  status: string | null
  scientificDirectionId: number | null
  universityId: number | null
  year: number | null
  // ... boshqa filterlar
  setFilter(key, value): void
  resetFilters(): void
}
```

---

## Ma'lumot oqimi

```
UI komponent
  ↓ useQuery / useMutation (TanStack Query)
    ↓ api.ts (fetch wrapper)
      ↓ FastAPI Backend (port 8000)
        ↓ PostgreSQL / Services
```

---

## Glass UI dizayn tizimi

Dashboard barcha komponentlari Glass UI stilida:

```css
backdrop-blur
bg-white/70 (dark: bg-slate-800/70)
shadow-xl
rounded-xl
border border-zinc-200
```

**Rang palitasi:**
- Primary: Blue 500 (`#3b82f6`)
- Background: Slate 100 (`#f1f5f9`)
- Surface: white/80
- Border: Zinc 200 (`#e4e4e7`)

**Tipografiya:**
- Headings: Noto Sans Mono
- Body: IBM Plex Serif

---

## Sahifalar va marshrutlash

| URL | Komponent | Tavsif |
|-----|-----------|--------|
| `/` | index.tsx | Login'ga yo'naltiradi |
| `/login` | login.tsx | Login forma |
| `/dashboard` | dashboard/index.tsx | Statistika + AI Chat |
| `/dashboard/dissertations` | dissertations.tsx | Ro'yxat + filtrlash |
| `/dashboard/dissertations/[id]` | dissertations/[id].tsx | Tafsilotlar |
| `/dashboard/dissertations/new` | dissertations/new.tsx | Yaratish forma |
| `/dashboard/users` | users.tsx | Foydalanuvchilar |

---

## Animatsiyalar

```css
transition-all duration-300 ease-out
```

- Sidebar ochilish/yopilish: slide
- Karta ko'rinishi: blur + fade
- Modalllar: scale-in
- Toast: slide-up
