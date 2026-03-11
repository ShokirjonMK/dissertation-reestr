# Dizayn Tizimi

## Konsepsiya: Glass UI

Barcha komponentlar Glass UI (glassmorphism) stilida — shaffof, bulaniq orqa fon, yumshoq soyalar.

**Asosiy Glass klasser:**
```css
backdrop-blur-md
bg-white/70          /* light mode */
bg-slate-800/70      /* dark mode */
shadow-xl
rounded-xl
border border-zinc-200
```

---

## Rang palitasi

### Light mode
| Nom | TailwindCSS | Hex | Maqsad |
|-----|-------------|-----|--------|
| Primary | `blue-500` | `#3b82f6` | Asosiy tugmalar, aksentlar |
| Background | `slate-100` | `#f1f5f9` | Sahifa foni |
| Surface | `white/80` | rgba(255,255,255,0.8) | Karta foni |
| Border | `zinc-200` | `#e4e4e7` | Chegaralar |
| Text | `slate-900` | `#0f172a` | Asosiy matn |
| Muted | `slate-500` | `#64748b` | Ikkinchi darajali matn |

### Status ranglari
| Holat | TailwindCSS | Hex |
|-------|-------------|-----|
| Success / Approved | `green-500` | `#22c55e` |
| Warning / Pending | `yellow-500` | `#eab308` |
| Error / Rejected | `red-500` | `#ef4444` |
| Info / Draft | `blue-400` | `#60a5fa` |
| Defended | `purple-500` | `#a855f7` |

### Dark mode
```css
.dark {
  --background: slate-900
  --surface: slate-800/80
  --text: slate-100
  --border: slate-700
}
```

---

## Tipografiya

### Fontlar
```css
/* Headings */
font-family: 'Noto Sans Mono', monospace;

/* Body */
font-family: 'IBM Plex Serif', serif;
```

Google Fonts dan yuklash (`globals.css`):
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500;600&family=IBM+Plex+Serif:wght@400;500&display=swap');
```

### O'lchamlar
| Element | Tur | TailwindCSS |
|---------|-----|-------------|
| Hero sarlavha | 32–40px | `text-4xl` |
| Dashboard sarlavha | 22–24px | `text-2xl` |
| Karta sarlavhasi | 18–20px | `text-xl` |
| Jadval sarlavhasi | 14px | `text-sm font-semibold` |
| Asosiy matn | 14–16px | `text-sm` / `text-base` |
| Yordam matni | 12px | `text-xs` |

### Sarlavha stili
```css
font-weight: 500;        /* font-medium */
letter-spacing: -0.025em; /* tracking-tight */
```

---

## Komponentlar

### Button

```tsx
// Primary
<Button variant="default">Saqlash</Button>

// Secondary
<Button variant="outline">Bekor qilish</Button>

// Destructive
<Button variant="destructive">O'chirish</Button>

// Ghost
<Button variant="ghost">Ko'rish</Button>
```

### Badge (Status)

```tsx
// Approved
<Badge className="bg-green-100 text-green-700">Tasdiqlangan</Badge>

// Pending
<Badge className="bg-yellow-100 text-yellow-700">Ko'rib chiqilmoqda</Badge>

// Rejected
<Badge className="bg-red-100 text-red-700">Rad etilgan</Badge>

// Draft
<Badge className="bg-blue-100 text-blue-700">Qoralama</Badge>
```

### StatCard
```tsx
<StatCard
  title="Total Dissertations"
  value="142"
  icon={FileText}
  trend="+12%"
  status="Active"
/>
```

### Glass Card
```tsx
<Card className="backdrop-blur-md bg-white/70 shadow-xl rounded-xl border border-zinc-200">
  <CardHeader>
    <CardTitle>Sarlavha</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

---

## Animatsiyalar

```css
/* Barcha o'tishlar */
transition-all duration-300 ease-out

/* Sidebar */
transition-all duration-300 ease-in-out

/* Hover effekti */
hover:scale-105 transition-transform duration-200

/* Karta ko'rinishi */
animate-in fade-in slide-in-from-bottom-4 duration-300
```

**Qoidalar:**
- Vaqt: 200–300ms
- Easing: `ease-out`
- Bir martalik (repeat: once)
- Haddan tashqari animatsiya yo'q

---

## Dark mode

Zustand `ui-store` va `localStorage` orqali saqlanadi.

```typescript
// Yoqish/o'chirish
const { darkMode, toggleDarkMode } = useUIStore()

// HTML elementga qo'shish
<html className={darkMode ? 'dark' : ''}>
```

TailwindCSS konfiguratsiya:
```js
// tailwind.config.ts
darkMode: 'class'
```

---

## Responsive breakpointlar

| Breakpoint | Piksel | Maqsad |
|------------|--------|--------|
| `sm` | 640px | Kichik mobil |
| `md` | 768px | Tablet |
| `lg` | 1024px | Kichik desktop |
| `xl` | 1280px | Desktop (minimal) |
| `2xl` | 1536px | Katta ekran |

Dashboard faqat `lg:` va undan katta ekranlarda to'liq ko'rinadi.
Mobil va tabletda sidebar yashiriladi.
