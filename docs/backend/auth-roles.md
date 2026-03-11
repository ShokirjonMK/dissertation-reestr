# Autentifikatsiya va Rollar

## JWT Token tizimi

Tizim JWT (JSON Web Token) asosida ishlaydi.

**Token konfiguratsiyasi (.env):**
```
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=120
JWT_SECRET=<maxfiy kalit>
```

**Token tuzilishi (payload):**
```json
{
  "sub": "1",
  "username": "admin",
  "role": "admin",
  "exp": 1735000000
}
```

---

## Login jarayoni

```
1. POST /api/v1/auth/login → {username, password}
2. Backend tekshiradi: username, password_hash, is_active
3. JWT token yaratiladi va qaytariladi
4. Frontend: Authorization: Bearer <token>
```

---

## OneID integratsiyasi (stub)

```
1. GET /api/v1/auth/oneid/login  → redirect OneID'ga
2. Foydalanuvchi OneID'da login qiladi
3. GET /api/v1/auth/oneid/callback → kod oladi, foydalanuvchi yaratadi
4. JWT token qaytariladi
```

---

## Rol-asosida kirishni boshqarish (RBAC)

| Operatsiya | Admin | Moderator | Doctorant | Supervisor | Employee |
|------------|:-----:|:---------:|:---------:|:----------:|:-------:|
| Dissertatsiya yaratish | ✅ | ❌ | ✅ | ❌ | ❌ |
| O'z dissertatsiyasini tahrirlash | ✅ | ❌ | ✅ | ❌ | ❌ |
| Istalgan dissertatsiyani tahrirlash | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dissertatsiya o'chirish | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dissertatsiya tasdiqlash/rad etish | ✅ | ✅ | ❌ | ❌ | ❌ |
| Barcha dissertatsiyalarni ko'rish | ✅ | ✅ | ✅ | ✅ | ✅ |
| Foydalanuvchi yaratish | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kataloglarni boshqarish | ✅ | ❌ | ❌ | ❌ | ❌ |
| Qidiruv va AI | ✅ | ✅ | ✅ | ✅ | ✅ |

### Maxsus qoidalar

1. Doctorant dissertatsiya yaratganda `author_id` avtomatik o'zi
2. Admin boshqa `author_id` bera oladi
3. Doctorant faqat o'z dissertatsiyasini tahrirlaydi
4. Moderatsiya faqat: `approved`, `rejected`, `pending`
5. `defended` holati — Admin tomonidan PUT orqali

---

## Dependency Injection (back/app/api/deps.py)

```python
get_current_user      # JWT token tekshiradi, User qaytaradi
get_db_dep            # SQLAlchemy Session
require_roles(...)    # Bir yoki ko'p rol talab qiladi
```

**Misol:**
```python
# Faqat admin
@router.delete("/{id}")
def delete(_user = Depends(require_roles(RoleName.ADMIN))):
    ...

# Admin yoki moderator
@router.patch("/{id}/moderate")
def moderate(_user = Depends(require_roles(RoleName.MODERATOR, RoleName.ADMIN))):
    ...
```

---

## Parol xavfsizligi

Parollar `bcrypt` bilan hashlangan (passlib).

---

## Standart hisoblar

| Username | Email | Parol | Rol |
|----------|-------|-------|-----|
| admin | admin@registry.uz | admin12345 | Admin |
| moderator | moderator@adliya.uz | moderator123 | Moderator |
| doctorant | doctorant@registry.uz | doctorant123 | Doctorant |
| supervisor | supervisor@registry.uz | supervisor123 | Supervisor |
| employee | employee@adliya.uz | employee123 | Employee |

> **Ishlab chiqarish muhitida bu parollarni albatta o'zgartiring!**
