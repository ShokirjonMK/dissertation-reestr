# Muallif Boshqaruv Moduli — Texnik Hujjat

> **Versiya:** 1.0.0
> **Yangilangan:** 2026-03-11
> **Modul:** `authors`
> **API Marshrut:** `/api/v1/authors/`
> **Frontend:** `/dashboard/authors/`

---

## 1. Umumiy Ma'lumot

Muallif boshqaruv moduli dissertatsiya mualliflarini identifikatsiya qilish, profil yaratish va boshqarish uchun mo'ljallangan. Modul uch xil identifikatsiya usulini qo'llab-quvvatlaydi: to'liq ism, JSHSHIR va pasport ma'lumotlari.

### 1.1 Asosiy Kontseptsiyalar

- **Muallif (Author)** — Dissertatsiya yozgan shaxs. Tizimda foydalanuvchi akkaunti bo'lmasligi ham mumkin.
- **Foydalanuvchi (User)** — Tizimga kirish huquqiga ega shaxs.
- **Bog'liqlik** — Muallif va foydalanuvchi `user_id` orqali bog'lanishi mumkin (ixtiyoriy).

---

## 2. Database Sxemasi

### 2.1 user_profiles Jadvali

**Jadval nomi:** `user_profiles`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Unikal identifikator |
| `user_id` | `INTEGER` | FK → users.id, UNIQUE, NULLABLE | Tizim foydalanuvchisi bog'liqligi |
| `last_name` | `VARCHAR(100)` | NOT NULL | Familiya |
| `first_name` | `VARCHAR(100)` | NOT NULL | Ism |
| `middle_name` | `VARCHAR(100)` | NULLABLE | Otasining ismi |
| `jshshir` | `VARCHAR(14)` | UNIQUE, NULLABLE | Shaxsiy identifikatsion raqam |
| `passport_series` | `VARCHAR(2)` | NULLABLE | Pasport seriyasi (AA) |
| `passport_number` | `VARCHAR(7)` | NULLABLE | Pasport raqami (1234567) |
| `birth_date` | `DATE` | NULLABLE | Tug'ilgan sana |
| `phone` | `VARCHAR(20)` | NULLABLE | Telefon raqami |
| `email` | `VARCHAR(255)` | NULLABLE | Elektron pochta |
| `academic_degree` | `VARCHAR(50)` | NULLABLE | Ilmiy daraja (PhD, DSc, Prof...) |
| `workplace` | `VARCHAR(500)` | NULLABLE | Ish joyi |
| `position` | `VARCHAR(255)` | NULLABLE | Lavozim |
| `is_verified` | `BOOLEAN` | DEFAULT FALSE | Davlat tizimi orqali tasdiqlangan |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Yaratilgan vaqt |
| `updated_at` | `TIMESTAMP` | ON UPDATE | Yangilangan vaqt |

### 2.2 dissertation_authors Jadvali (Ko'p-ko'p)

**Jadval nomi:** `dissertation_authors`

| Ustun | Tur | Cheklov | Tavsif |
|-------|-----|---------|---------|
| `id` | `INTEGER` | PRIMARY KEY | Unikal identifikator |
| `dissertation_id` | `INTEGER` | FK → dissertations.id | Dissertatsiya |
| `author_id` | `INTEGER` | FK → user_profiles.id | Muallif |
| `role` | `VARCHAR(20)` | DEFAULT 'author' | Rol: author / supervisor |
| `order` | `INTEGER` | DEFAULT 1 | Mualliflar tartibi |

### 2.3 SQLAlchemy Model

```python
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=True
    )
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(100))
    jshshir: Mapped[Optional[str]] = mapped_column(String(14), unique=True)
    passport_series: Mapped[Optional[str]] = mapped_column(String(2))
    passport_number: Mapped[Optional[str]] = mapped_column(String(7))
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    academic_degree: Mapped[Optional[str]] = mapped_column(String(50))
    workplace: Mapped[Optional[str]] = mapped_column(String(500))
    position: Mapped[Optional[str]] = mapped_column(String(255))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now())

    # Relationship
    user: Mapped[Optional["User"]] = relationship(back_populates="profile")
    dissertations: Mapped[list["Dissertation"]] = relationship(
        secondary="dissertation_authors", back_populates="authors"
    )

    @property
    def full_name(self) -> str:
        parts = [self.last_name, self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        return " ".join(parts)
```

---

## 3. AuthorSelectModal Komponenti

### 3.1 Komponent Tavsifi

`AuthorSelectModal` — Wizard ning 4-bosqichida muallif tanlash yoki yangi muallif yaratish uchun ishlatiladigan modal dialog.

**Props:**
```typescript
interface AuthorSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (author: AuthorProfile) => void;
  mode: 'author' | 'supervisor';
  currentUserId?: number; // selfSubmit uchun
}
```

### 3.2 Modal Tuzilmasi

```
┌──────────────────────────────────────────────────────────┐
│  Muallif Tanlash                                    [×]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 [JSHSHIR yoki F.I.Sh. bo'yicha qidirish _______]    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Abdullayev Jasur Musayevich               [Tanlash]│ │
│  │ JSHSHIR: 30101199500123456                        │ │
│  │ TDYU, Doktorant                                   │ │
│  │ Tasdiqlangan ✓                                    │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Karimov Bobur Aliyevich                  [Tanlash]│ │
│  │ JSHSHIR: 14085200012345678                        │ │
│  │ NUUz, Professor                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ──────────── Yangi muallif yaratish ────────────       │
│                                                          │
│  [To'liq ism]    [JSHSHIR orqali]    [Pasport orqali]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Komponent Holatlari

| Holat | Ko'rinishi |
|-------|-----------|
| `idle` | Qidiruv maydoni bo'sh, yaratish tugmalari ko'rinadi |
| `searching` | Loader ko'rsatiladi |
| `results` | Qidiruv natijalari ro'yxati |
| `empty` | "Natija topilmadi, yangi muallif yarating" |
| `creating` | Yaratish formasi ko'rsatiladi |
| `loading` | Saqlash jarayoni |

---

## 4. Muallif Yaratish — 3 Usul

### 4.1 Usul 1: To'liq Ism

Eng oddiy va universal usul. Davlat tizimiga so'rov yuborilmaydi.

**UI:**
```
Yangi muallif (to'liq ism)
──────────────────────────────────────
Familiya *:    [_____________________]
Ism *:         [_____________________]
Otasining ismi:[_____________________]
Akademik daraja: [PhD ▼]
Ish joyi:      [_____________________]
──────────────────────────────────────
[Bekor qilish]              [Saqlash]
```

**Validatsiya:**
```typescript
const fullNameSchema = z.object({
  last_name: z.string()
    .min(2, "Familiya kamida 2 belgi")
    .max(100, "Familiya 100 belgidan oshmasin")
    .regex(/^[A-Za-zА-Яа-яЁёO'ʻ\-\s]+$/, "Faqat harflar va tire"),
  first_name: z.string()
    .min(2, "Ism kamida 2 belgi")
    .max(100),
  middle_name: z.string().max(100).optional(),
  academic_degree: z.enum(["", "PhD", "DSc", "Prof", "Ass.Prof"]).optional(),
  workplace: z.string().max(500).optional(),
});
```

**API So'rov:**
```json
POST /api/v1/authors
{
  "last_name": "Abdullayev",
  "first_name": "Jasur",
  "middle_name": "Musayevich",
  "academic_degree": "PhD",
  "workplace": "TDYU",
  "creation_method": "full_name"
}
```

**Natija:** `is_verified: false` — davlat tizimi orqali tasdiqlanmagan.

---

### 4.2 Usul 2: JSHSHIR (14 ta Raqam)

O'zbekiston fuqaroligidagi shaxslar uchun yagona identifikatsion raqam orqali avtomatik ma'lumot to'ldirish.

**JSHSHIR Formati:** 14 ta raqam

```
3 0 1 0 1 1 9 9 5 0 0 1 2 3
└─┘ └─────────┘ └───────────┘
Jins  Tug'ilgan    Tekshiruv
kodi    sana        raqami
```

**UI:**
```
JSHSHIR orqali identifikatsiya
──────────────────────────────────────────────────────
JSHSHIR (14 raqam) *:  [______________________________]
                        Masalan: 30101199500123456

[Tekshirish]
──────────────────────────────────────────────────────
```

Tekshirish tugmasi bosilganda:

```
✓ Shaxs topildi!
──────────────────────────────────────────────────────
Familiya:   Abdullayev
Ism:        Jasur
Otasining ismi: Musayevich
Tug'ilgan:  01.01.1995
──────────────────────────────────────────────────────
[Bekor qilish]          [Mualliflikni tasdiqlash]
```

**Backend Jarayon:**
```python
@router.post("/authors/identify/jshshir")
async def identify_by_jshshir(jshshir: str):
    # 1. Avval mahalliy bazada qidirish
    existing = await db.query(UserProfile).filter(
        UserProfile.jshshir == jshshir
    ).first()
    if existing:
        return existing

    # 2. Tashqi API ga so'rov
    response = await integration_service.lookup_jshshir(jshshir)
    if not response:
        raise HTTPException(404, "Shaxs topilmadi")

    # 3. Yangi profil yaratish (tasdiqlanmagan holda)
    new_profile = UserProfile(
        jshshir=jshshir,
        last_name=response.last_name,
        first_name=response.first_name,
        middle_name=response.middle_name,
        birth_date=response.birth_date,
        is_verified=True,  # Davlat tizimi orqali tasdiqlangan
        creation_method="jshshir"
    )
    return await db.save(new_profile)
```

**Validatsiya:**
```typescript
const jshshirSchema = z.object({
  jshshir: z.string()
    .length(14, "JSHSHIR aynan 14 ta raqamdan iborat bo'lishi kerak")
    .regex(/^\d{14}$/, "JSHSHIR faqat raqamlardan iborat bo'lishi kerak"),
});
```

---

### 4.3 Usul 3: Pasport

IIV (Ichki Ishlar Vazirligi) pasport tizimi orqali shaxsni identifikatsiya qilish.

**Pasport Formati:**
- **Seriya:** 2 lotin harfi (AA, AB, BA... ZZ)
- **Raqam:** 7 raqam (1234567)
- **Tug'ilgan sana:** Majburiy tekshiruv uchun

**UI:**
```
Pasport ma'lumotlari orqali identifikatsiya
────────────────────────────────────────────────────────
Seriya *:    [AA ▼]   Raqam *: [_______]
                                 (7 raqam)
Tug'ilgan sana *: [__/__/____]
────────────────────────────────────────────────────────
[Tekshirish]
────────────────────────────────────────────────────────
```

**Backend Jarayon:**
```python
@router.post("/authors/identify/passport")
async def identify_by_passport(
    series: str,      # "AA"
    number: str,      # "1234567"
    birth_date: date  # 1995-01-01
):
    # 1. Mahalliy bazada qidirish
    existing = await db.query(UserProfile).filter(
        UserProfile.passport_series == series.upper(),
        UserProfile.passport_number == number,
        UserProfile.birth_date == birth_date
    ).first()
    if existing:
        return existing

    # 2. IIV tizimiga so'rov (Integration Service orqali)
    response = await integration_service.lookup_passport(
        series=series,
        number=number,
        birth_date=birth_date
    )

    if response.found:
        profile = UserProfile(
            last_name=response.last_name,
            first_name=response.first_name,
            middle_name=response.middle_name,
            passport_series=series.upper(),
            passport_number=number,
            birth_date=birth_date,
            is_verified=True,
            creation_method="passport"
        )
        return await db.save(profile)

    # 3. Topilmasa — qo'lda to'ldirish taklifi
    raise HTTPException(404, "Pasport ma'lumotlari bo'yicha shaxs topilmadi")
```

**Validatsiya:**
```typescript
const passportSchema = z.object({
  series: z.string()
    .length(2, "Seriya 2 harfdan iborat")
    .regex(/^[A-Z]{2}$/, "Seriya faqat lotin harflari (AA-ZZ)"),
  number: z.string()
    .length(7, "Raqam 7 ta raqamdan iborat")
    .regex(/^\d{7}$/, "Raqam faqat sonlardan iborat"),
  birth_date: z.string().refine(
    (d) => {
      const date = new Date(d);
      const now = new Date();
      const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return age >= 18 && age <= 100;
    },
    "Tug'ilgan sana noto'g'ri"
  ),
});
```

---

## 5. O'zini Muallif Qilish (selfSubmit)

### 5.1 Mexanizm

Tizimga kirgan foydalanuvchi dissertatsiya yuklashda o'zini muallif sifatida belgilashi mumkin. Buning uchun maxsus "Men muallifman" tugmasi mavjud.

```typescript
// Wizard Step 4 da
function handleSelfSubmit() {
  const currentUser = useAuthStore.getState().user;

  // Foydalanuvchi profilini olish
  const profile = await fetchUserProfile(currentUser.id);

  if (!profile) {
    // Profil yo'q — yaratish dialogi
    openCreateProfileModal();
    return;
  }

  // Profilni muallif sifatida belgilash
  setWizardStepData(4, {
    author_id: profile.id,
    self_submitted: true,
  });
}
```

### 5.2 Profil To'liqlik Tekshiruvi

O'zini muallif qilishdan oldin profil to'liqligini tekshirish:

| Maydon | Kerakmi? |
|--------|---------|
| `last_name` | Ha |
| `first_name` | Ha |
| `jshshir` YOKI `passport_series+number` | Tavsiya etiladi |

Agar profil to'liq bo'lmasa, foydalanuvchi profil to'ldirish sahifasiga yo'naltiriladi.

---

## 6. API Endpointlar

**Bazaviy URL:** `/api/v1/authors`

| Method | Endpoint | Tavsif | Ruxsat |
|--------|----------|---------|--------|
| `GET` | `/api/v1/authors` | Mualliflar ro'yxati (qidiruv) | Auth kerak |
| `GET` | `/api/v1/authors/{id}` | Bitta muallif profili | Auth kerak |
| `POST` | `/api/v1/authors` | Yangi muallif yaratish | Auth kerak |
| `PUT` | `/api/v1/authors/{id}` | Profil yangilash | ADMIN yoki o'zi |
| `POST` | `/api/v1/authors/identify/jshshir` | JSHSHIR orqali topish | Auth kerak |
| `POST` | `/api/v1/authors/identify/passport` | Pasport orqali topish | Auth kerak |
| `GET` | `/api/v1/authors/me` | Joriy foydalanuvchi profili | Auth kerak |

**Qidiruv parametrlari:**
```
GET /api/v1/authors?search=abdullayev&is_verified=true&page=1&per_page=10
```

---

## 7. Tashqi API Integratsiya Rejalari

### 7.1 IIV Pasport Tizimi

**Integration Service** (`:8003`) orqali IIV pasport tizimiga ulanish rejalashtirilgan.

**Arxitektura:**
```
Frontend → Main API → Integration Service → IIV API
```

**Kutilayotgan javob formati (IIV):**
```json
{
  "status": "found",
  "data": {
    "last_name": "ABDULLAYEV",
    "first_name": "JASUR",
    "middle_name": "MUSAYEVICH",
    "birth_date": "1995-01-01",
    "gender": "male",
    "nationality": "O'zbek"
  }
}
```

**Integratsiya holati:**

| Tizim | Holat | Eslatma |
|-------|-------|---------|
| IIV Pasport tizimi | Rejalashtirilgan | API hujjatlari kutilmoqda |
| JSHSHIR bazasi | Rejalashtirilgan | Huquqiy tasdiqlash jarayonida |
| HR tizimi | Kelajak rejasi | Faza 2 da amalga oshiriladi |

**Fallback strategiya:** Agar tashqi API mavjud bo'lmasa yoki javob bermasa:
1. Xato xabari ko'rsatiladi
2. Foydalanuvchiga qo'lda to'ldirish taklif etiladi
3. `is_verified: false` bilan saqlash

### 7.2 Integratsiya Xavfsizligi

```python
# Integration service — tashqi API so'rovi
class IntegrationService:
    async def lookup_passport(
        self,
        series: str,
        number: str,
        birth_date: date,
        retry_count: int = 3
    ) -> Optional[PersonData]:
        for attempt in range(retry_count):
            try:
                response = await httpx.post(
                    settings.IIV_API_URL,
                    json={
                        "passport_series": series,
                        "passport_number": number,
                        "birth_date": birth_date.isoformat()
                    },
                    headers={"Authorization": f"Bearer {settings.IIV_API_KEY}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    return PersonData(**response.json())
            except httpx.TimeoutException:
                if attempt == retry_count - 1:
                    raise IntegrationTimeoutError()
                await asyncio.sleep(1)
        return None
```

---

## 8. Muallif Profili Ko'rinishi

Muallif profili sahifasida quyidagi ma'lumotlar ko'rsatiladi:

```
┌────────────────────────────────────────────────────────┐
│  👤  Abdullayev Jasur Musayevich                       │
│      PhD | TDYU                                        │
│      Tasdiqlangan ✓                                    │
├────────────────────────────────────────────────────────┤
│  Dissertatsiyalar:                                     │
│  • Jinoyat huquqida jazo qo'llash... (2025)           │
│  • Fuqarolik jarayonida dalillar... (2023)            │
├────────────────────────────────────────────────────────┤
│  Ilmiy rahbar bo'lgan ishlar:                         │
│  • Karimov B. dissertatsiyasi (2024)                  │
└────────────────────────────────────────────────────────┘
```

---

## 9. Xatolarni Boshqarish

| Holat | Xato kodi | Xabar |
|-------|-----------|-------|
| JSHSHIR noto'g'ri format | `400` | "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak" |
| JSHSHIR topilmadi | `404` | "Berilgan JSHSHIR bo'yicha shaxs topilmadi" |
| Pasport topilmadi | `404` | "Pasport ma'lumotlari bo'yicha shaxs topilmadi" |
| Tashqi API ishlamaydi | `503` | "Identifikatsiya tizimi hozir mavjud emas. Keyinroq urinib ko'ring." |
| Muallif allaqachon mavjud | `409` | "Bu JSHSHIR bilan muallif allaqachon ro'yxatda bor" |
| Ruxsat yo'q | `403` | "Boshqa foydalanuvchi profilini o'zgartirish mumkin emas" |

---

## 10. Kesh Strategiyasi

| Ma'lumot | Kesh | TTL |
|----------|------|-----|
| Muallif profili | Redis | 30 daqiqa |
| Qidiruv natijalari | Redis | 5 daqiqa |
| O'z profili (me) | React Query | Sessiya davomida |

---

*Hujjat versiyasi: 1.0.0. So'nggi o'zgarishlar uchun Git tarixini tekshiring.*
