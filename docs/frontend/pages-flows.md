# Sahifalar va Foydalanuvchi Oqimlari

## Sahifalar xaritasi

```
/                    → Login'ga yo'naltiradi
/login               → Login forma (ochiq)
/dashboard           → Bosh dashboard (himoyalangan)
/dashboard/dissertations      → Dissertatsiyalar ro'yxati
/dashboard/dissertations/[id] → Dissertatsiya tafsiloti (+ muammo/takliflar editori)
/dashboard/dissertations/new  → Yangi dissertatsiya
/dashboard/proposals          → Mening takliflarim (employee / moderator / admin)
/dashboard/proposals/new      → Yangi amaliyot taklifi
/dashboard/proposals/[id]     → Taklif tafsiloti va moderatsiya
/dashboard/admin/proposals    → Barcha / kutilayotgan takliflar (moderator / admin)
/dashboard/search/problems    → Muammo va takliflar bo'yicha qidiruv
/dashboard/users     → Foydalanuvchilar (Admin)
/dashboard/ai        → AI yordamchi
/dashboard/settings  → Sozlamalar
/dashboard/catalogs/* → Kataloglar (admin)
```

---

## Foydalanuvchi oqimlari

### 1. Login
```
/ sahifa → useAuthGuard → auth yo'q → /login
Login forma → POST /api/v1/auth/login
Muvaffaqiyatli → token localStorage → /dashboard
```

### 2. Dashboard ko'rish
```
/dashboard → StatCards yuklaydi
  ↓
useQuery(['dissertations']) → GET /api/v1/dissertations/
  ↓
Stats hisob-kitob: total, pending, approved, mentors
  ↓
AI Assistant tab yoki Insights tab
```

### 3. Dissertatsiyalar ro'yxati
```
/dashboard/dissertations → DissertationTable
  ↓
AdvancedFilters paneli
  ↓
Filter qo'llash → URL params yangilanadi
  ↓
GET /api/v1/dissertations/?status=approved&...
  ↓
Jadval yangilanadi → saralash, paginatsiya
```

### 4. Dissertatsiya yaratish (Doctorant)
```
"Submit Proposal" tugmasi → /dashboard/dissertations/new
  ↓
Forma to'ldiriladi (sarlavha, muammo, taklif, annotatsiya, xulosa)
  ↓
Fayllar yuklash (PDF, Word, avtoreferat) — ixtiyoriy
  ↓
POST /api/v1/dissertations/submit (multipart)
  ↓
Muvaffaqiyatli → dissertatsiyalar ro'yxatiga qaytish
```

### 5. Dissertatsiya moderatsiyasi (Moderator)
```
/dashboard/dissertations → ro'yxat
  ↓
"Pending" holatdagi dissertatsiyani tanlash
  ↓
PATCH /api/v1/dissertations/{id}/moderate?status_value=approved
  ↓
Badge yangilanadi: "Tasdiqlangan"
```

### 6. Qidiruv
```
AdvancedFilters → maydonlarga yozish
  ↓
"Apply Parameters" tugmasi
  ↓
GET /api/v1/dissertations/?query=...&status=...
yoki
POST /api/v1/search → Elasticsearch
  ↓
Natijalar jadvalda ko'rsatiladi
```

### 7. AI Assistant
```
Dashboard → AI Assistant tab
  ↓
Savol yoziladi
  ↓
POST /api/v1/ai/ask → AI Service
  ↓
Javob + manbalar ko'rsatiladi
```

### 8. Strukturalangan muammolar va takliflar
```
/dashboard/dissertations/{id} → ProblemsProposalsEditor
  ↓
GET .../problems va .../proposal-contents (TanStack Query)
  ↓
Fayl yuklash → POST .../extract-problems-proposals
  ↓
Saqlash → POST .../problems/bulk va .../proposal-contents/bulk
```

### 9. Amaliyot takliflari
```
/dashboard/proposals/new → forma → POST /api/v1/proposals/
  ↓
/dashboard/proposals/{id} → POST submit / approve / reject / ...
```

### 10. Muammo/taklif qidiruvi
```
/dashboard/search/problems → GET /api/v1/search/problems-proposals?q=...
```

---

## Auth himoyasi

Barcha `/dashboard/*` sahifalari `useAuthGuard` hook bilan himoyalangan:

```typescript
const { hasHydrated, isAuthenticated } = useAuthGuard()

if (!hasHydrated) return <Loading />
if (!isAuthenticated) return null  // /login ga yo'naltiradi
```

---

## Rol asosida UI

| Element | Rol | Ko'rinish |
|---------|-----|-----------|
| "Yangi dissertatsiya" tugmasi | Doctorant, Admin | ✅ |
| "O'chirish" tugmasi | Admin | ✅ |
| "Tasdiqlash/Rad" tugmasi | Moderator, Admin | ✅ |
| "Foydalanuvchilar" menyu | Admin | ✅ |
| Barcha qidiruv | Hammasi | ✅ |

---

## Sahifa o'tish animatsiyalari

```css
/* Sahifa yuklanishi */
animate-in fade-in duration-300

/* Karta ko'rinishi */
animate-in slide-in-from-bottom-4 duration-300 delay-100
```
