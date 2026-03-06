# Dissertatsiyalar muammolari va takliflari reestri axborot tizimi

## TEXNIK TOPSHIRIQ (TZ)

------------------------------------------------------------------------

# 1. Loyiha haqida umumiy ma'lumot

Ushbu loyiha dissertatsiya ishlarida ko'tarilgan muammolar, takliflar va
xulosalarni markazlashgan elektron bazada yuritish uchun mo'ljallangan
axborot tizimini yaratishni nazarda tutadi.

Tizim orqali:

-   doktorantlar dissertatsiya mavzularini joylashtiradi
-   dissertatsiyada ko'tarilgan muammolar va takliflar kiritiladi
-   Adliya vazirligi mutaxassislari mavzularni ko'rib chiqadi va ruxsat
    beradi
-   himoya qilingan ishlar reestri yuritiladi
-   ilmiy ishlar amaliyotga tadbiq qilish imkoniyati bo'yicha tahlil
    qilinadi

------------------------------------------------------------------------

# 2. Tizim foydalanuvchilari va rollar

## Admin

-   tizim konfiguratsiyasini boshqarish
-   foydalanuvchilarni yaratish
-   rollarni boshqarish
-   kataloglarni boshqarish

## Moderator (Adliya ekspertlari)

-   dissertatsiyalarni ko'rib chiqish
-   tasdiqlash yoki rad etish
-   tavsiyalar berish
-   amaliyotga joriy qilishni baholash

## Doktorant

-   dissertatsiya ma'lumotlarini kiritish
-   muammo va takliflarni yozish
-   annotatsiya va kalit so'zlarni kiritish

## Ilmiy rahbar

-   doktorant ishlarini ko'rib chiqish
-   izoh va tavsiyalar berish

## Foydalanuvchi (Adliya xodimlari)

-   qidirish
-   ko'rish
-   tahlil qilish

------------------------------------------------------------------------

# 3. Foydalanuvchi profili (barcha foydalanuvchilar uchun)

Har bir foydalanuvchi tizimda shaxsiy profilga ega bo'ladi.

### Profil maydonlari

-   id
-   image
-   last_name
-   first_name
-   middle_name
-   passport_seria
-   passport_number
-   passport_pin
-   passport_given_date
-   passport_issued_date
-   passport_given_by
-   birthday
-   phone
-   phone_secondary
-   passport_file
-   country_id
-   is_foreign
-   region_id (CRUD)
-   area_id (CRUD)
-   address
-   gender

### Integratsiya

Pasport ma'lumotlari Ichki Ishlar Vazirligi passport tizimi orqali
tekshiriladi.

------------------------------------------------------------------------

# 4. Autentifikatsiya

## OneID integratsiyasi

Tizimga kirish OneID orqali amalga oshiriladi.

Boshlanish bosqichida: - login - parol

orqali kirish imkoniyati ham mavjud bo'ladi.

------------------------------------------------------------------------

# 5. HR tizimi bilan integratsiya

Tizim hr.adliya.uz bilan integratsiya qilinadi.

Maqsad:

-   Adliya xodimlarini avtomatik aniqlash
-   tizimdan foydalanish huquqini tekshirish

Boshlanishida foydalanuvchilar administrator tomonidan yaratiladi.

------------------------------------------------------------------------

# 6. Dissertatsiya ma'lumotlari

Har bir dissertatsiya quyidagi ma'lumotlardan iborat:

-   dissertatsiya nomi
-   ilmiy yo'nalish
-   universitet
-   muallif
-   ilmiy rahbar
-   dissertatsiya muammosi
-   dissertatsiya taklifi
-   dissertatsiya annotatsiyasi
-   dissertatsiya xulosasi
-   kalit so'zlar
-   himoya sanasi
-   status

------------------------------------------------------------------------

# 7. Filtrlash tizimi

Quyidagi parametrlar bo'yicha filtrlash mumkin:

-   ilmiy yo'nalish
-   universitet
-   dissertatsiya muallifi
-   dissertatsiya rahbari
-   dissertatsiya muammosi
-   dissertatsiya taklifi
-   dissertatsiya xulosasi
-   dissertatsiya annotatsiyasi
-   dissertatsiya kalit so'zlar
-   yil
-   status

------------------------------------------------------------------------

# 8. Qidiruv tizimi

Qidiruv ElasticSearch asosida ishlaydi.

Talablar:

-   full text search
-   context based search
-   synonym search
-   typo tolerant search

Qidiruv quyidagi maydonlarda ishlaydi:

-   dissertatsiya nomi
-   muammo
-   taklif
-   annotatsiya
-   xulosa
-   kalit so'zlar

------------------------------------------------------------------------

# 9. AI qidiruv va savol-javob

Tizimda AI asosidagi savol-javob tizimi bo'ladi.

Texnologiya:

RAG (Retrieval Augmented Generation)

AI dissertatsiya bazasidan:

-   kontekstli javob beradi
-   tegishli ishlarni tavsiya qiladi

------------------------------------------------------------------------

# 10. Kataloglar (CRUD)

## Ilmiy yo'nalishlar

-   create
-   read
-   update
-   delete

Har bir dissertatsiya ilmiy yo'nalishga biriktiriladi.

## Universitetlar

-   create
-   read
-   update
-   delete

## Regionlar

-   CRUD

## Tumanlar

-   CRUD

------------------------------------------------------------------------

# 11. Tizim ochiqligi

Tizim ochiq platforma bo'lmaydi.

Ochiq qismida:

Landing Page:

-   loyiha haqida
-   tizim maqsadi
-   aloqa ma'lumotlari

Asosiy tizim faqat avtorizatsiya orqali ishlaydi.

------------------------------------------------------------------------

# 12. UI / UX talablar

## Dizayn printsiplari

macOS va iOS Human Interface Guidelines asosida minimalistik dizayn.

## Layout

-   Header
-   Sidebar
-   Main Content
-   Footer

Sidebar collapsible bo'lishi kerak.

## Ranglar

Primary: #4A90E2\
Background: #F5F7FA\
Surface: #FFFFFF\
Border: #E5E7EB\
Text: #1F2933

Status:

Success: #34C759\
Warning: #FF9500\
Error: #FF3B30

## Tipografiya

Fonts:

-   SF Pro
-   Inter
-   Roboto

Sizes:

Title: 22--24px\
Subtitle: 18px\
Body: 14--16px

## UI komponentlar

-   Button
-   Input
-   Select
-   Checkbox
-   Radio
-   Modal
-   Dropdown
-   Tabs
-   Table
-   Card
-   Notification

## Table funksiyalari

-   sorting
-   filtering
-   pagination
-   status indicators

## Animatsiya

transition: 200--300ms

## Dark mode

Tizim dark mode qo'llab-quvvatlaydi.

------------------------------------------------------------------------

# STACK (Texnologiyalar)

## Backend

Python FastAPI

## Frontend

React + Next.js

## Database

PostgreSQL

## Search

ElasticSearch

## AI

LLM + RAG (Llama / Mistral)

## Cache

Redis

## Container

Docker

## Reverse Proxy

NGINX

------------------------------------------------------------------------

# ARXITEKTURA

Tizim microservice arxitekturasi asosida quriladi.

Asosiy servislar:

1.  API Service (FastAPI)
2.  Search Service (ElasticSearch)
3.  AI Service (LLM + RAG)
4.  Auth Service (OneID integratsiya)
5.  Integration Service (HR + Passport)
6.  Database Service (PostgreSQL)
7.  Cache Service (Redis)

Infra:

-   Docker
-   Nginx
-   CI/CD
