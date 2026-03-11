# UI/UX TEXNIK TOPSHIRIQ

## Ilmiy Dissertatsiyalar Reestri va AI Qidiruv Tizimi

---

# 1. UI Dizayn konsepsiyasi

Tizim interfeysi minimalistik, intuitiv va foydalanish uchun qulay bo‘lishi kerak. Dizayn ilmiy muhitga mos, sokin va professional uslubda ishlab chiqiladi.

Interfeys quyidagi printsiplarga asoslanadi:

* minimal elementlar
* sokin rang palitrasi
* ko‘zni charchatmaydigan dizayn
* tez navigatsiya
* katta hajmdagi ilmiy ma'lumotlar bilan ishlash uchun qulaylik

Dizayn **macOS / iOS Human Interface Guidelines** va zamonaviy **dashboard UX standartlari** asosida ishlab chiqiladi.

---

# 2. Umumiy layout struktura

Interfeys quyidagi asosiy bloklardan iborat bo‘ladi:

### Sidebar Navigation

Chap tomonda joylashgan asosiy navigatsiya paneli.

### Header

Yuqori panel tizim qidiruvi va bildirishnomalar uchun.

### Main Content

Asosiy ishchi maydon.

### Footer

Tizim versiyasi va tizim holati ko‘rsatiladi.

Layout struktura:

```
Sidebar | Header
        | Main Content
        | Footer
```

---

# 3. Sidebar navigatsiya

Sidebar tizimning asosiy navigatsiya elementi hisoblanadi.

Unda quyidagi bo‘limlar bo‘ladi:

* Dashboard
* Registry
* New Proposal
* AI Assistant
* Settings

Sidebar xususiyatlari:

* icon + text
* active element highlight
* collapsible mode
* scrollable navigation

---

# 4. Header (Top panel)

Header tizimning global boshqaruv elementlarini o‘z ichiga oladi.

Header komponentlari:

* sahifa nomi
* global search
* notifications
* user profile

Global qidiruv tizimi orqali foydalanuvchi quyidagilarni topishi mumkin:

* dissertatsiya mavzulari
* ilmiy muammolar
* mualliflar
* ilmiy yo‘nalishlar

---

# 5. Dashboard UI

Dashboard tizimning umumiy statistik ko‘rsatkichlarini aks ettiradi.

Dashboard quyidagi elementlardan iborat:

### Statistik kartalar

* Total Registry
* Under Review
* Defense Rate

Har bir karta quyidagilarni ko‘rsatadi:

* asosiy statistika
* o‘zgarish trendi
* status indikator

---

### Activity panel

Recent Activity paneli tizimdagi so‘nggi o‘zgarishlarni ko‘rsatadi:

* yangi dissertatsiya qo‘shilishi
* tasdiqlash
* ilmiy rahbar tayinlanishi

---

# 6. Registry sahifasi UI

Registry sahifasi dissertatsiyalar bazasini ko‘rsatadi.

Bu sahifa **asosiy ishchi interfeys** hisoblanadi.

Table quyidagi ustunlardan iborat bo‘ladi:

* Reference ID
* Candidate
* Status
* Field
* Submission date

Table imkoniyatlari:

* sorting
* filtering
* pagination
* qidiruv

Status ranglari:

* Validated — yashil
* Pending — sariq
* Archived — kulrang

---

# 7. New Proposal UI

Bu sahifa yangi dissertatsiya mavzusini kiritish uchun ishlatiladi.

Forma quyidagi maydonlardan iborat:

* Research Title
* Scientific Field
* Proposed Mentor
* Research Abstract
* Confirmation checkbox

Form dizayni:

* minimal elementlar
* katta input maydonlar
* real-time validation

---

# 8. AI Assistant UI

AI Assistant tizimning intellektual qidiruv modulidir.

Bu modul foydalanuvchiga quyidagi imkoniyatlarni beradi:

* ilmiy mavzularni qidirish
* mavjud dissertatsiyalarni tahlil qilish
* ilmiy bo‘shliqlarni aniqlash
* o‘xshash mavzularni topish

AI interfeysi **chat ko‘rinishida** bo‘ladi.

Chat komponentlari:

* user message
* AI response
* suggested actions

AI javoblari quyidagilarni ko‘rsatishi mumkin:

* o‘xshash dissertatsiyalar
* ilmiy bo‘shliqlar
* tavsiya etilgan mavzular

---

# 9. Global Search UI

Global qidiruv tizimi barcha sahifalarda ishlaydi.

Qidiruv orqali quyidagilar topilishi mumkin:

* dissertatsiya mavzulari
* mualliflar
* ilmiy yo‘nalishlar
* ilmiy muammolar

Qidiruv natijalari real-time ko‘rsatiladi.

---

# 10. Ranglar tizimi

Interfeysda sokin ranglar ishlatiladi.

Asosiy ranglar:

Primary
`#3B82F6`

Background
`#F8FAFC`

Surface
`#FFFFFF`

Border
`#E5E7EB`

Text
`#0F172A`

Status ranglari:

Success
`#22C55E`

Warning
`#F59E0B`

Error
`#EF4444`

---

# 11. Tipografiya

Interfeys quyidagi fontlardan foydalanadi:

Heading font
Noto Sans Mono

Body font
IBM Plex Serif

Font o‘lchamlari:

Heading
24–32px

Body text
14–16px

Metadata
10–12px

---

# 12. UI komponentlari

Tizim quyidagi UI komponentlarini o‘z ichiga oladi:

* Buttons
* Inputs
* Select
* Checkbox
* Table
* Cards
* Notifications
* Modals
* Tooltips
* Status badges

Barcha komponentlar yagona **Design System** asosida ishlaydi.

---

# 13. Animatsiyalar

Animatsiyalar minimal va silliq bo‘lishi kerak.

Transition vaqt:

200–300ms

Animatsiyalar:

* sahifa almashinuvi
* hover effect
* modal ochilishi

---

# 14. Responsive dizayn

Interfeys quyidagi ekranlarga moslashadi:

Desktop
≥1280px

Tablet
≥768px

Mobile
≥360px

---

# 15. UX talablari

Tizim quyidagi UX printsiplarga amal qilishi kerak:

* foydalanuvchi maksimal 2–3 bosqichda amalni bajarishi
* qidiruv tizimi tez ishlashi
* katta ma'lumotlar bazasi bilan ishlash qulay bo‘lishi
* ilmiy ma'lumotlarni o‘qish uchun qulay tipografiya
