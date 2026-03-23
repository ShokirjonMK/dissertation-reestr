# Komponentlar Katalogu

## Dashboard komponentlar

### StatCard
**Fayl:** `src/components/dashboard/StatCard.tsx`

Statistika kartasi — raqam, trend va holat ko'rsatadi.

```tsx
<StatCard
  title="Total Dissertations"
  value="142"
  icon={FileText}
  trend="+12%"
  status="Active"
/>
```

**Props:**
| Prop | Tur | Tavsif |
|------|-----|--------|
| title | string | Karta nomi |
| value | string | Asosiy qiymat |
| icon | LucideIcon | Ikonka |
| trend | string | O'sish ko'rsatgichi |
| status | string | Holat matni |

---

### DissertationTable
**Fayl:** `src/components/dashboard/DissertationTable.tsx`

Dissertatsiyalar jadvali — saralash, filtrlash, paginatsiya.

**Ustunlar:**
- Muallif
- Sarlavha
- Holat (badge bilan)
- Ilmiy yo'nalish
- Harakatlar

**Xususiyatlar:**
- Sarlavha bo'yicha saralash
- Holat bo'yicha filtrlash
- Sahifa bo'yicha paginatsiya
- Status badge rangli ko'rinish

---

### AdvancedFilters
**Fayl:** `src/components/dashboard/AdvancedFilters.tsx`

Ko'p parametrli qidiruv va filtrlash paneli.

**Qidiruv maydonlari:**
- Sarlavha, muammo, taklif, annotatsiya, xulosa
- Kalit so'z, muallif, rahbar
- Universitet, ilmiy yo'nalish

**Filtrlash:**
- Holat (Select)
- Ilmiy yo'nalish (Select)
- Ekspert reytingi (slider/range)
- Region (Select)
- Ko'rinuvchanlik toggle
- Yil (input)

**Harakatlar:** "Parametrlarni qo'llash" tugmasi

---

### AIAssistantChat
**Fayl:** `src/components/dashboard/AIAssistantChat.tsx`

ChatGPT uslubidagi AI assistant interfeysi.

**Elementlar:**
- Suhbat xabarlari (user + assistant)
- Matn kiritish maydoni
- Yuborish tugmasi
- Tavsiya etilgan savollar
- Manbalar havolalari

**Holat:** React state orqali mahalliy

---

### RightWidgets
**Fayl:** `src/components/dashboard/RightWidgets.tsx`

O'ng panel veidjetlari.

**Widget 1 — AI Research Assistant:**
- Sarlavha + Tavsif
- "Start Analysis" tugmasi

**Widget 2 — Quick Actions:**
- Submit Proposal tugmasi
- Review Analytics tugmasi
- Supervisor Portal tugmasi

---

## UI Komponentlar (Shadcn/ui asosida)

| Komponent | Fayl | Tavsif |
|-----------|------|--------|
| Button | `ui/button.tsx` | Tugma (default/outline/destructive/ghost) |
| Input | `ui/input.tsx` | Matn kiritish maydoni |
| Textarea | `ui/textarea.tsx` | Ko'p satrli matn |
| Select | `ui/select.tsx` | Tanlash ro'yxati |
| Checkbox | `ui/checkbox.tsx` | Belgilash qutisi |
| RadioGroup | `ui/radio-group.tsx` | Radio tugmalar guruhi |
| Switch | `ui/switch.tsx` | On/off toggle |
| Modal | `ui/modal.tsx` | Oyna (dialog wrapper) |
| Dialog | `ui/dialog.tsx` | Radix UI dialog |
| DropdownMenu | `ui/dropdown-menu.tsx` | Ochiladigan menyu |
| Tabs | `ui/tabs.tsx` | Tab navigatsiya |
| Table | `ui/table.tsx` | Jadval |
| Card | `ui/card.tsx` | Karta (CardHeader, CardContent...) |
| Badge | `ui/badge.tsx` | Holat belgisi |
| Pagination | `ui/pagination.tsx` | Sahifalash |
| Notification | `ui/notification.tsx` | Xabar paneli |
| Toast | `ui/toast.tsx` | Vaqtincha bildirish |

---

## Layout komponent

### DashboardLayout
**Fayl:** `src/layouts/DashboardLayout.tsx`

Asosiy dashboard layout:

```tsx
<DashboardLayout title="Sahifa nomi" subtitle="Tavsif">
  {/* asosiy kontent */}
</DashboardLayout>
```

Tarkibi:
- **Header**: Logo, navigatsiya, dark mode toggle, user menu
- **Sidebar** (collapsible): Navigatsiya menyusi
- **Main Content**: Children prop
- **Right Panel**: RightWidgets
- **Footer**: Huquqlar

---

## Hooks

### useAuthGuard
**Fayl:** `src/hooks/use-auth-guard.ts`

Sahifani himoya qilish uchun. Token yo'q bo'lsa login'ga yo'naltiradi.

```typescript
const { hasHydrated, isAuthenticated } = useAuthGuard()
```

---

## Providers

### AppProviders
**Fayl:** `src/components/providers/AppProviders.tsx`

Barcha provayderlarni o'rab oladi:
- `QueryClientProvider` (TanStack Query)
- `ThemeProvider` (Dark mode)
- `Toaster` (Toast bildirishtiruvlar)

---

## Takliflar va qidiruv (2026)

### ProposalStatusBadge
**Fayl:** `src/components/proposals/ProposalStatusBadge.tsx`  
Taklif statusi uchun rangli badge (`draft`, `submitted`, `under_review`, …).

### StatusHistoryTimeline
**Fayl:** `src/components/proposals/StatusHistoryTimeline.tsx`  
`proposal_status_history` uchun vertikal vaqt chizig'i.

### ProblemsProposalsEditor
**Fayl:** `src/components/problems-proposals/ProblemsProposalsEditor.tsx`  
Dissertatsiya sahifasida muammo/taklif qatorlari, fayldan AI ajratish, bulk saqlash (`API_BASE_URL` + `buildAuthHeaders`).

### SimpleProblemSearch
**Fayl:** `src/components/search/SimpleProblemSearch.tsx`  
`GET /api/v1/search/problems-proposals` orqali qidiruv va natija kartochkalari.

Modul hujjatlari: [implementation-proposals](../../modules/implementation-proposals/README.md), [dissertation-problems-proposals](../../modules/dissertation-problems-proposals/README.md).
