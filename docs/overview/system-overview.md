# System Overview

## Goal
Dissertation muammolari, takliflari va xulosalarini markazlashgan reestrda yuritish, ekspertiza jarayonini avtomatlashtirish va AI yordamida tahlil qilish.

## High-level Architecture
- `front/`: Next.js (TypeScript) dashboard UI.
- `back/`: FastAPI API service (auth, users, catalogs, dissertations).
- `services/search-service/`: ElasticSearch qidiruv adapteri.
- `services/ai-service/`: RAG-style savol-javob xizmati.
- `services/integration-service/`: HR va passport integratsiya adapterlari.
- `databases/`: PostgreSQL, ElasticSearch, Redis konfiguratsiyalari.
- `infra/`: local compose, swarm, portainer, NGINX Proxy Manager.

## Key Workflows
1. Foydalanuvchi login qiladi (`/auth/login` yoki OneID callback).
2. Doktorant dissertatsiya ma'lumotlarini kiritadi.
3. Moderator ko'rib chiqadi, statusni yangilaydi.
4. Search service full-text/context/fuzzy qidiruv beradi.
5. AI service qidiruv natijasidan kontekstli javob generatsiya qiladi.

## Security Model
- JWT token (`Authorization: Bearer ...`).
- Role-based access (`admin`, `moderator`, `doctorant`, `supervisor`, `employee`).
- Passport va HR tekshiruvi integration-service orqali.

## Deployment Targets
- Docker Compose (local).
- Docker Swarm stack (`infra/docker/stacks/core-stack.yml`).
