# Dissertatsiya Yuklash Wizard — Texnik Hujjat

> **Versiya:** 1.0.0
> **Yangilangan:** 2026-03-11
> **Modul:** `dissertation-upload`
> **Marshrut:** `/dashboard/dissertations/upload`

---

## 1. Wizard Arxitekturasi

Dissertatsiya yuklash jarayoni 6 bosqichli **Step Wizard** interfeysi orqali amalga oshiriladi. Wizard foydalanuvchiga katta va murakkab formani kichik, boshqarish oson qadamlarga bo'lib ko'rsatadi.

### 1.1 Holat Boshqaruvi

Wizard holati Zustand store da saqlanadi. Har bir bosqich ma'lumotlari alohida ob'ekt sifatida store ga yoziladi.

```typescript
interface WizardState {
  currentStep: number;          // 1-6
  completedSteps: number[];     // Tugallangan bosqichlar
  isSubmitting: boolean;        // Yuborilmoqda holati

  // Har bir bosqich ma'lumotlari
  step1: BasicInfoData | null;
  step2: ScientificClassificationData | null;
  step3: KeywordsAnnotationData | null;
  step4: AuthorData | null;
  step5: FilesData | null;
  step6: ConfirmationData | null;

  // Amallar
  setStep: (step: number) => void;
  setStepData: (step: number, data: any) => void;
  markStepComplete: (step: number) => void;
  resetWizard: () => void;
}
```

### 1.2 Navigatsiya Qoidalari

- Foydalanuvchi faqat tugallangan bosqichdan keyingisiga o'ta oladi
- Oldingi bosqichlarga istalgan vaqt qaytish mumkin
- Sahifa yangilanganida progress localStorage dan tiklanadi
- "Keyingi" tugmasi bosqich validatsiyasidan o'tgach faollashadi

### 1.3 Progress Ko'rsatkich

```
[1] Asosiy ──► [2] Ilmiy ──► [3] Kalit so'z ──► [4] Muallif ──► [5] Fayllar ──► [6] Tasdiqlash
 ●                ○              ○                  ○               ○               ○
```

---

## 2. Bosqich 1: Asosiy Ma'lumotlar

### 2.1 Maqsad

Dissertatsiyaning asosiy identifikatsiya ma'lumotlarini to'ldirish.

### 2.2 Forma Maydonlari

| Maydon | Tur | Majburiy | Standart | Tavsif |
|--------|-----|----------|---------|---------|
| `title` | `textarea` | Ha | — | Dissertatsiya sarlavhasi |
| `direction_id` | `select` | Ha | — | Ilmiy yo'nalish (katalogdan) |
| `university_id` | `select` | Ha | TDYU | Universitet (katalogdan) |
| `country_id` | `select` | Ha | O'zbekiston | Mamlakat (katalogdan) |
| `region_id` | `select` | Ha | — | Region (country_id ga bog'liq) |
| `defense_date` | `date` | Ha | — | Himoya sanasi |
| `degree_type` | `select` | Ha | — | PhD / DSc |

### 2.3 Validatsiya

```typescript
const step1Schema = z.object({
  title: z.string()
    .min(10, "Sarlavha kamida 10 belgi bo'lishi kerak")
    .max(1000, "Sarlavha 1000 belgidan oshmasin"),
  direction_id: z.number().positive("Ilmiy yo'nalish tanlang"),
  university_id: z.number().positive("Universitet tanlang"),
  country_id: z.number().positive("Mamlakat tanlang"),
  region_id: z.number().positive("Region tanlang"),
  defense_date: z.string().refine(
    (date) => new Date(date) <= new Date(),
    "Himoya sanasi kelajakda bo'lishi mumkin emas"
  ),
  degree_type: z.enum(["PhD", "DSc"]),
});
```

### 2.4 Kaskad Select

Mamlakat tanlanganda Region ro'yxati avtomatik yangilanadi:

```typescript
// Mamlakat o'zgarganda
watch("country_id", (countryId) => {
  setValue("region_id", null); // Region tozalanadi
  fetchRegions(countryId);     // Yangi ro'yxat yuklash
});
```

---

## 3. Bosqich 2: Ilmiy Tasnif

### 3.1 Maqsad

Dissertatsiyaning ilmiy muammosi va takliflarini batafsil tavsiflash.

### 3.2 Forma Maydonlari

| Maydon | Tur | Majburiy | Min/Max | Tavsif |
|--------|-----|----------|---------|---------|
| `problem` | `textarea` | Ha | 50/5000 | Dissertatsiya muammosi |
| `proposal` | `textarea` | Ha | 50/5000 | Ilmiy takliflar |

### 3.3 Validatsiya

```typescript
const step2Schema = z.object({
  problem: z.string()
    .min(50, "Muammo ta'rifi kamida 50 belgi bo'lishi kerak")
    .max(5000, "Muammo ta'rifi 5000 belgidan oshmasin"),
  proposal: z.string()
    .min(50, "Takliflar kamida 50 belgi bo'lishi kerak")
    .max(5000, "Takliflar 5000 belgidan oshmasin"),
});
```

### 3.4 Belgilar Hisoblagichi

Har bir textarea ostida real vaqtda belgilar hisoblagichi ko'rsatiladi:

```
Muammo: [________________________]
                              245 / 5000
```

---

## 4. Bosqich 3: Kalit So'zlar va Annotatsiya

### 4.1 Maqsad

Qidiruv va kataloglashtirish uchun kalit so'zlar, annotatsiya va xulosa kiritish.

### 4.2 Forma Maydonlari

| Maydon | Tur | Majburiy | Tavsif |
|--------|-----|----------|---------|
| `keywords` | `TagInput` | Ha | Kalit so'zlar ro'yxati (5-20 ta) |
| `annotation` | `textarea` | Ha | Qisqacha mazmun (200-2000 belgi) |
| `conclusion` | `textarea` | Ha | Asosiy xulosalar (100-3000 belgi) |

### 4.3 TagInput Komponenti

`TagInput` — kalit so'zlarni tag formatida kiritish uchun maxsus komponent.

**Xususiyatlar:**
- Enter yoki vergul bossanda yangi tag qo'shiladi
- Har bir tagni × tugmasi bilan o'chirish mumkin
- Minimum 5 ta, maksimum 20 ta tag
- Bir xil kalit so'z ikki marta qo'shilmaydi
- Kalit so'z uzunligi: 2-50 belgi

**Komponent interfeysi:**
```typescript
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  minTags?: number;    // standart: 5
  maxTags?: number;    // standart: 20
  maxTagLength?: number; // standart: 50
}
```

**Ko'rinish:**
```
[huquq] [jinoyat] [jazo] [jarayon] [x]

Kalit so'z kiriting: [_______________]
                     Enter bosib qo'shing
5 ta kiriting (hozir: 4)
```

### 4.4 Validatsiya

```typescript
const step3Schema = z.object({
  keywords: z.array(z.string().min(2).max(50))
    .min(5, "Kamida 5 ta kalit so'z kiriting")
    .max(20, "Ko'pi bilan 20 ta kalit so'z mumkin"),
  annotation: z.string()
    .min(200, "Annotatsiya kamida 200 belgi bo'lishi kerak")
    .max(2000, "Annotatsiya 2000 belgidan oshmasin"),
  conclusion: z.string()
    .min(100, "Xulosa kamida 100 belgi bo'lishi kerak")
    .max(3000, "Xulosa 3000 belgidan oshmasin"),
});
```

---

## 5. Bosqich 4: Muallif

### 5.1 Maqsad

Dissertatsiya muallifini va ilmiy rahbarini belgilash.

### 5.2 Muallif Tanlash / Yaratish

Foydalanuvchiga ikkita variant taklif etiladi:

**Variant A: O'zini muallif qilish (selfSubmit)**
- "Men muallifman" tugmasi bosilganda joriy foydalanuvchi profili avtomatik muallif sifatida belgilanadi
- Profil ma'lumotlari (ism, JSHSHIR) foydalanuvchi akkauntidan olinadi

**Variant B: Muallif qidirish/yaratish**
- AuthorSelectModal oynasi ochiladi
- Mavjud mualliflarni JSHSHIR/ism bo'yicha qidirish
- Yangi muallif yaratish (3 usulda)

### 5.3 AuthorSelectModal

```
┌─────────────────────────────────────────────────────┐
│              Muallif Tanlash                    [×]  │
├─────────────────────────────────────────────────────┤
│  [Qidiruv: JSHSHIR yoki ism ___________________]    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Abdullayev Jasur Musayevich     [Tanlash]       │ │
│  │ JSHSHIR: 30101199500123456                     │ │
│  │ Toshkent Davlat Yuridik Universiteti           │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Yangi muallif yaratish:                            │
│  [To'liq ism]  [JSHSHIR]  [Pasport]                │
└─────────────────────────────────────────────────────┘
```

### 5.4 Ilmiy Rahbar

| Maydon | Tur | Majburiy | Tavsif |
|--------|-----|----------|---------|
| `supervisor_id` | `select/search` | Ha | Ilmiy rahbar muallif |
| `supervisor_degree` | `select` | — | Fan doktori / Fan nomzodi |

---

## 6. Bosqich 5: Fayllar

### 6.1 Maqsad

Dissertatsiya asosiy fayli va qo'shimcha materiallarni yuklash.

### 6.2 Qabul Qilinadigan Fayl Turlari

| Fayl turi | MIME turi | Maqsad | Hajm limiti |
|-----------|-----------|---------|-------------|
| PDF | `application/pdf` | Asosiy dissertatsiya fayli | 50 MB |
| DOCX | `application/vnd.openxmlformats...` | Word format | 50 MB |
| TXT | `text/plain` | Matn format | 10 MB |

### 6.3 Fayl Yuklash Interfeysi

```
┌────────────────────────────────────────────────────┐
│  Asosiy dissertatsiya fayli *                       │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │       Faylni bu yerga tashlang               │  │
│  │           yoki                               │  │
│  │        [Fayl tanlash]                        │  │
│  │                                              │  │
│  │   PDF, DOCX, TXT. Maksimum 50 MB            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Avtoreferat (ixtiyoriy)                           │
│  [+ Fayl qo'shish]                                 │
└────────────────────────────────────────────────────┘
```

### 6.4 Fayl Yuklash Pipeline

```
Foydalanuvchi fayl tanlaydi
         │
         ▼
Fayl validatsiyasi (tur, hajm)
         │
         ▼
Multipart POST /api/v1/files/upload
         │
         ▼
Backend: Fayl saqlash (local/MinIO)
         │
         ▼
Celery Task: Text Extraction
   ├── PDF → pdfplumber → plain text
   ├── DOCX → python-docx → plain text
   └── TXT → to'g'ridan-to'g'ri
         │
         ▼
Celery Task: ElasticSearch Indexing
   └── Matn va metadata ES ga yoziladi
         │
         ▼
Celery Task: AI Analysis
   ├── Embedding vektori generatsiya
   ├── Kalit so'zlar taklifi
   └── Annotatsiya taklifi
         │
         ▼
Wizard Step 5 da "Yuklandi" holati
```

### 6.5 Yuklash Holati Ko'rsatkichlari

| Holat | Ko'rinishi | Tavsif |
|-------|-----------|---------|
| `idle` | Bo'sh maydon | Hali yuklanmagan |
| `uploading` | Progress bar | Yuklash jarayoni |
| `processing` | Aylana indicator | Matn chiqarish |
| `ready` | Yashil belgi | Tayyor |
| `error` | Qizil belgi + xato | Yuklash xatosi |

---

## 7. Bosqich 6: Tasdiqlash va Yuborish

### 7.1 Maqsad

Barcha kiritilgan ma'lumotlarni ko'rib chiqish va dissertatsiyani yuborish.

### 7.2 Preview Ko'rinishi

Barcha bosqichlardagi ma'lumotlar to'liq ko'rsatiladi:

```
┌─────────────────────────────────────────────────────┐
│  DISSERTATSIYA MA'LUMOTLARI                         │
├─────────────────────────────────────────────────────┤
│  Sarlavha: Jinoyat huquqida jazo qo'llash...       │
│  Yo'nalish: 12.00.08 — Jinoyat huquqi              │
│  Universitet: Toshkent Davlat Yuridik Universiteti │
│  Mamlakat: O'zbekiston                              │
│  Region: Toshkent shahri                            │
│  Himoya sanasi: 15.03.2025                          │
│  Daraja: PhD                                        │
├─────────────────────────────────────────────────────┤
│  Muallif: Abdullayev Jasur Musayevich               │
│  Ilmiy rahbar: Prof. Nazarov B.T.                  │
├─────────────────────────────────────────────────────┤
│  Kalit so'zlar: [huquq] [jazo] [jinoyat] ...       │
├─────────────────────────────────────────────────────┤
│  Fayl: dissertation_abdullayev.pdf (2.3 MB) ✓      │
└─────────────────────────────────────────────────────┘
│  [← Orqaga]                    [Yuborish →]         │
└─────────────────────────────────────────────────────┘
```

### 7.3 Yuborish Jarayoni

```
"Yuborish" bosiladi
       │
       ▼
Final validatsiya (barcha bosqichlar)
       │
       ▼
POST /api/v1/dissertations
       │
       ├── Muvaffaqiyat → Status: "pending"
       │                → Redirect: /dashboard/dissertations/{id}
       │                → Notification: "Dissertatsiya yuborildi"
       │
       └── Xato → Xato xabari ko'rsatiladi
                → Wizard holati saqlanadi
```

---

## 8. Muallif Yaratish Usullari

### 8.1 Usul 1: To'liq Ism

Eng oddiy usul — faqat F.I.Sh. bilan muallif yaratish.

**Maydonlar:**
| Maydon | Majburiy | Tavsif |
|--------|----------|---------|
| `last_name` | Ha | Familiya |
| `first_name` | Ha | Ism |
| `middle_name` | — | Otasining ismi |

**Validatsiya:** Har bir maydon 2-100 belgi, faqat harflar va tire.

### 8.2 Usul 2: JSHSHIR (14 raqam)

O'zbekiston fuqarolarining yagona shaxsiy identifikatsion raqami orqali identifikatsiya.

**Jarayon:**
```
JSHSHIR kiritiladi (14 raqam)
       │
       ▼
POST /api/v1/integration/identify/jshshir
       │
       ├── Topildi → Shaxs ma'lumotlari to'ldiriladi
       │           → Tasdiqlash so'raladi
       │
       └── Topilmadi → Xato xabari
```

**Validatsiya:** Aynan 14 ta raqam, faqat sonlar.

### 8.3 Usul 3: Pasport

Pasport ma'lumotlari orqali IIV tizimiga so'rov yuborish.

**Maydonlar:**
| Maydon | Format | Misol |
|--------|--------|-------|
| `series` | 2 harf (AA-ZZ) | `AA` |
| `number` | 7 raqam | `1234567` |
| `birth_date` | YYYY-MM-DD | `1990-01-15` |

**Jarayon:**
```
Seria + raqam + tug'ilgan sana kiritiladi
       │
       ▼
POST /api/v1/integration/identify/passport
       │
       ├── Topildi → Shaxs ma'lumotlari to'ldiriladi
       │
       └── Topilmadi → Qo'lda to'ldirish taklifi
```

---

## 9. Standart Qiymatlar

| Maydon | Standart qiymat | Sabab |
|--------|----------------|-------|
| `country_id` | O'zbekiston (1) | Tizim asosan O'zbek dissertatsiyalari uchun |
| `university_id` | TDYU | Tizim Adliya vazirligi nazoratida |
| `degree_type` | PhD | Ko'pchilik PhD dissertatsiya yuklaydi |
| `language` | `uz` | Tizim standart tili O'zbekcha |

---

## 10. Xatolarni Boshqarish

| Holat | Xato | Yechim |
|-------|------|--------|
| Bosqich validatsiya muvaffaqiyatsiz | Xato maydonlar belgilanadi | To'g'rilash va qayta urinish |
| Fayl hajmi oshib ketdi | Toast notification | Kichikroq fayl yuklash |
| Noto'g'ri fayl turi | Toast notification | Ruxsat etilgan format tanlash |
| Server xatosi | Modal dialog | Keyinroq urinish yoki support |
| Tarmoq xatosi | Offline indicator | Ulanish tiklanishini kutish |

---

*Hujjat versiyasi: 1.0.0. So'nggi o'zgarishlar uchun Git tarixini tekshiring.*
