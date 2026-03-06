# Dissertation Registry Architecture

Core services:
- `front` (Next.js UI)
- `back` (FastAPI API service)
- `services/search-service` (ElasticSearch adapter)
- `services/ai-service` (RAG style Q&A API)
- `services/integration-service` (HR and passport integration stubs)

Data services:
- PostgreSQL
- ElasticSearch
- Redis

Networks:
- `proxy_network`
- `backend_network`
- `services_network`
- `database_network`

Deployment targets:
- Local Docker Compose
- Docker Swarm stack (`infra/docker/stacks/core-stack.yml`)
