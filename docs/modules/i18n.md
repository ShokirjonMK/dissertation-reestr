# Ko'p Tilli Tizim (i18n) — Texnik Hujjat

> **Versiya:** 1.0.0
> **Yangilangan:** 2026-03-11
> **Modul:** `i18n`
> **Joylashuvi:** `frontend/src/lib/i18n/`

---

## 1. Umumiy Ma'lumot

Dissertatsiya Reestri tizimi uch tilda to'liq ishlaydi:

| Til | Kodi | Tavsif |
|-----|------|---------|
| O'zbek | `uz` | **Standart til** — barcha foydalanuvchilar uchun asosiy til |
| Rus | `ru` | Ikkinchi til — rus tilida so'zlashuvchi foydalanuvchilar uchun |
| Ingliz | `en` | Xalqaro til — xorijiy foydalanuvchilar va eksportlar uchun |

### 1.1 Standart Til

Tizimning standart tili — **O'zbek** (`uz`). Yangi foydalanuvchi birinchi marta kirganida interfeys o'zbek tilida ko'rsatiladi. Til tanlash localStorage da saqlanadi va keyingi sessiyalarda tiklanadi.

### 1.2 i18n Qamrovi

| Qatlam | i18n qo'llab-quvvatlash |
|--------|------------------------|
| UI matnlari | Zustand + JSON tarjima fayllari |
| Xato xabarlari | Tarjima fayllari |
| Database katalog nomlari | `name_uz`, `name_ru`, `name_en` maydonlar |
| Email xabarnomalar | Har bir tilda alohida shablon |
| PDF/eksport | Til parametri bilan generatsiya |

---

## 2. i18n Arxitekturasi

### 2.1 Umumiy Arxitektura

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           Zustand i18n Store                   │ │
│  │                                                │ │
│  │  state: { lang: "uz" | "ru" | "en" }          │ │
│  │  persist: localStorage ("app-language")        │ │
│  └─────────────────┬──────────────────────────────┘ │
│                    │                                 │
│  ┌─────────────────▼──────────────────────────────┐ │
│  │           useI18n() Hook                       │ │
│  │                                                │ │
│  │  { t, lang, setLang }                         │ │
│  └─────────────────┬──────────────────────────────┘ │
│                    │                                 │
│  ┌─────────────────▼──────────────────────────────┐ │
│  │        Tarjima Fayllari (JSON)                 │ │
│  │                                                │ │
│  │  locales/uz.json — O'zbek tarjimalari         │ │
│  │  locales/ru.json — Rus tarjimalari            │ │
│  │  locales/en.json — Ingliz tarjimalari         │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 2.2 Fayl Tuzilmasi

```
frontend/
└── src/
    ├── lib/
    │   └── i18n/
    │       ├── index.ts          # Asosiy eksport
    │       ├── types.ts          # TranslationKey turi
    │       └── translations/
    │           ├── uz.json       # O'zbek tarjimalari
    │           ├── ru.json       # Rus tarjimalari
    │           └── en.json       # Ingliz tarjimalari
    ├── store/
    │   └── i18n.store.ts         # Zustand store
    └── hooks/
        └── useI18n.ts            # React hook
```

---

## 3. Zustand Store

### 3.1 Store Kodi

```typescript
// src/store/i18n.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'uz' | 'ru' | 'en';

interface I18nState {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'uz', // Standart til
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'app-language', // localStorage kalit nomi
    }
  )
);
```

### 3.2 Store Xususiyatlari

- **persist middleware** — Til tanlash localStorage da saqlanadi
- **Kalit nomi:** `app-language`
- **Qiymat:** `"uz"` | `"ru"` | `"en"`
- **Dastlabki qiymat:** `"uz"`

---

## 4. useI18n Hook

### 4.1 Hook Ta'rifi

```typescript
// src/hooks/useI18n.ts

import { useI18nStore } from '@/store/i18n.store';
import uz from '@/lib/i18n/translations/uz.json';
import ru from '@/lib/i18n/translations/ru.json';
import en from '@/lib/i18n/translations/en.json';

const translations = { uz, ru, en };

export function useI18n() {
  const { lang, setLang } = useI18nStore();

  function t(key: string, params?: Record<string, string>): string {
    const dict = translations[lang];
    let text = getNestedValue(dict, key) ?? key;

    // Parametr almashtirish: {{name}} → qiymat
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }

    return text;
  }

  return { t, lang, setLang };
}
```

### 4.2 Foydalanish

```typescript
// Komponent ichida foydalanish
import { useI18n } from '@/hooks/useI18n';

function MyComponent() {
  const { t, lang, setLang } = useI18n();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('welcome.message', { name: 'Jasur' })}</p>
      <button onClick={() => setLang('ru')}>RU</button>
    </div>
  );
}
```

### 4.3 Parametrli Tarjimalar

Dinamik qiymatlar `{{parametrNomi}}` sintaksisi bilan belgilanadi:

```json
{
  "dissertation.count": "Jami {{count}} ta dissertatsiya topildi",
  "welcome.user": "Xush kelibsiz, {{name}}!"
}
```

```typescript
t('dissertation.count', { count: '42' })
// Natija: "Jami 42 ta dissertatsiya topildi"
```

---

## 5. Tarjima Kalitlari Tuzilmasi

### 5.1 Tarjima Fayli Formati

```json
// uz.json
{
  "common": {
    "save": "Saqlash",
    "cancel": "Bekor qilish",
    "delete": "O'chirish",
    "edit": "Tahrirlash",
    "create": "Yaratish",
    "search": "Qidirish",
    "loading": "Yuklanmoqda...",
    "error": "Xatolik yuz berdi",
    "success": "Muvaffaqiyatli bajarildi",
    "confirm": "Tasdiqlash",
    "back": "Orqaga",
    "next": "Keyingi",
    "submit": "Yuborish"
  },
  "nav": {
    "dashboard": "Boshqaruv paneli",
    "dissertations": "Dissertatsiyalar",
    "catalogs": "Kataloglar",
    "reports": "Hisobotlar",
    "settings": "Sozlamalar",
    "logout": "Chiqish"
  },
  "auth": {
    "login": "Kirish",
    "logout": "Chiqish",
    "email": "Elektron pochta",
    "password": "Parol",
    "forgotPassword": "Parolni unutdingizmi?",
    "loginButton": "Tizimga kirish"
  },
  "dissertation": {
    "title": "Sarlavha",
    "direction": "Ilmiy yo'nalish",
    "university": "Universitet",
    "country": "Mamlakat",
    "region": "Region",
    "defenseDate": "Himoya sanasi",
    "degree": "Ilmiy daraja",
    "status": {
      "draft": "Qoralama",
      "pending": "Ko'rib chiqilmoqda",
      "approved": "Tasdiqlangan",
      "rejected": "Rad etilgan",
      "defended": "Himoya qilingan"
    },
    "upload": {
      "title": "Dissertatsiya yuklash",
      "step1": "Asosiy ma'lumotlar",
      "step2": "Ilmiy tasnif",
      "step3": "Kalit so'zlar",
      "step4": "Muallif",
      "step5": "Fayllar",
      "step6": "Tasdiqlash"
    }
  },
  "catalog": {
    "countries": "Mamlakatlar",
    "universities": "Universitetlar",
    "regions": "Regionlar",
    "directions": "Ilmiy yo'nalishlar"
  },
  "validation": {
    "required": "Bu maydon to'ldirilishi shart",
    "minLength": "Kamida {{min}} belgi kiriting",
    "maxLength": "Ko'pi bilan {{max}} belgi kiriting",
    "invalidEmail": "Elektron pochta manzili noto'g'ri",
    "invalidJshshir": "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak"
  }
}
```

### 5.2 Kalit Nomlanish Qoidalari

- **Namespace.key** formatida ierarxik tuzilma
- camelCase formatida kalit nomlari
- Ko'p so'zli nomlar uchun camelCase (masalan: `defenseDate`)
- Barcha tillarda bir xil kalit tuzilmasi

### 5.3 Tillar Bo'yicha Solishtiruv

```json
// uz.json
{ "common.save": "Saqlash" }

// ru.json
{ "common.save": "Сохранить" }

// en.json
{ "common.save": "Save" }
```

---

## 6. Database Jadvallarida i18n

### 6.1 Ko'p Tilli Katalog Maydonlari

Barcha katalog jadvallari uchta til ustunini o'z ichiga oladi:

```sql
-- countries jadvali misoli
CREATE TABLE countries (
    id          SERIAL PRIMARY KEY,
    name_uz     VARCHAR(255) NOT NULL,  -- O'zbek tilida nom
    name_ru     VARCHAR(255) NOT NULL,  -- Rus tilida nom
    name_en     VARCHAR(255) NOT NULL,  -- Ingliz tilida nom
    code        VARCHAR(10)  NOT NULL UNIQUE,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP
);
```

### 6.2 Bir Xil Sxema Barcha Kataloglarda

| Jadval | name_uz | name_ru | name_en |
|--------|---------|---------|---------|
| `countries` | + | + | + |
| `universities` | + | + | + |
| `regions` | + | + | + |
| `scientific_directions` | + | + | + |

### 6.3 API Javoblarida i18n

API barcha til variantlarini qaytaradi. Frontend joriy tilga mos keluvchi maydonni ko'rsatadi:

```typescript
// Frontend yordamchi funksiya
function getLocalizedName(
  item: { name_uz: string; name_ru: string; name_en: string },
  lang: 'uz' | 'ru' | 'en'
): string {
  const key = `name_${lang}` as keyof typeof item;
  return item[key] || item.name_uz; // Fallback: O'zbek
}
```

### 6.4 Database Da Qidiruv

Ko'p tilli qidiruvda barcha til maydonlari qamrab olinadi:

```python
# SQLAlchemy query — barcha tillarda qidiruv
query = select(Country).where(
    or_(
        Country.name_uz.ilike(f"%{search}%"),
        Country.name_ru.ilike(f"%{search}%"),
        Country.name_en.ilike(f"%{search}%"),
        Country.code.ilike(f"%{search}%"),
    )
)
```

---

## 7. Til Tanlash UI

### 7.1 Header Da Til Tugmalari

Barcha sahifalardagi header qismida til tanlash tugmalari joylashgan:

```
[UZ] [RU] [EN]
```

Tanlangan til qalin (bold) va ajratilgan rang bilan ko'rsatiladi.

### 7.2 Komponent Kodi

```typescript
// src/components/layout/LanguageSwitcher.tsx

import { useI18n } from '@/hooks/useI18n';

const LANGUAGES = [
  { code: 'uz', label: 'UZ', fullName: "O'zbek" },
  { code: 'ru', label: 'RU', fullName: 'Русский' },
  { code: 'en', label: 'EN', fullName: 'English' },
] as const;

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-2 py-1 text-sm rounded ${
            lang === code
              ? 'bg-primary text-white font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={LANGUAGES.find(l => l.code === code)?.fullName}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### 7.3 Til O'zgarganda UI Yangilanishi

Zustand store reaktiv bo'lgani uchun til o'zgarganda barcha komponentlar avtomatik qayta renderlanadi. Sahifani qayta yuklash shart emas.

---

## 8. ElasticSearch Da Ko'p Tilli Indekslash

### 8.1 Mapping

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "uzbek_analyzer"
      },
      "keywords": {
        "type": "keyword"
      },
      "university_name_uz": { "type": "text" },
      "university_name_ru": { "type": "text" },
      "university_name_en": { "type": "text" },
      "direction_name_uz": { "type": "text" },
      "direction_name_ru": { "type": "text" }
    }
  }
}
```

### 8.2 Qidiruv — Barcha Tillarda

```python
# ES qidiruv so'rovi — barcha til maydonlarida
search_body = {
  "query": {
    "multi_match": {
      "query": search_text,
      "fields": [
        "title^3",
        "annotation^2",
        "keywords^2",
        "university_name_uz",
        "university_name_ru",
        "university_name_en",
        "direction_name_uz",
        "direction_name_ru"
      ]
    }
  }
}
```

---

## 9. Backend Da i18n

### 9.1 Xato Xabarlari

Backend xato xabarlari foydalanuvchi tiliga mos tilde qaytarilishi mumkin. Buning uchun `Accept-Language` headeri ishlatiladi:

```python
# FastAPI dependency
def get_user_language(
    accept_language: str = Header(default="uz")
) -> str:
    supported = ["uz", "ru", "en"]
    lang = accept_language.split(",")[0].strip()[:2].lower()
    return lang if lang in supported else "uz"
```

### 9.2 Email Shablon Tili

Email xabarnomalar yuborilganda foydalanuvchi tili aniqlanadi:

```python
async def send_notification(user_id: int, template: str, context: dict):
    user = await get_user(user_id)
    lang = user.preferred_language or "uz"
    template_file = f"emails/{template}_{lang}.html"
    # ...
```

---

## 10. Test va QA

### 10.1 Tarjima Tekshiruvi

Barcha tarjima kalitlari mavjudligini tekshirish uchun test:

```typescript
// tests/i18n.test.ts
import uz from '@/lib/i18n/translations/uz.json';
import ru from '@/lib/i18n/translations/ru.json';
import en from '@/lib/i18n/translations/en.json';

test('barcha til fayllari bir xil kalitlarga ega', () => {
  const uzKeys = Object.keys(flattenObject(uz));
  const ruKeys = Object.keys(flattenObject(ru));
  const enKeys = Object.keys(flattenObject(en));

  expect(ruKeys).toEqual(uzKeys);
  expect(enKeys).toEqual(uzKeys);
});
```

### 10.2 Yetishmayotgan Tarjimalar

Agar kalit topilmasa, kalit o'zi ko'rsatiladi (fallback):

```typescript
function t(key: string): string {
  const value = getNestedValue(translations[lang], key);
  if (!value) {
    console.warn(`[i18n] Missing translation: ${key} (${lang})`);
    return key; // Fallback: kalit o'zi
  }
  return value;
}
```

---

*Hujjat versiyasi: 1.0.0. So'nggi o'zgarishlar uchun Git tarixini tekshiring.*
