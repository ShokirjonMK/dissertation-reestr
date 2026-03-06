# AI Service

RAG-style question answering service.

Current behavior:
- Retrieves relevant dissertations from `search-service`
- Generates a concise synthesized answer from retrieved context

This module is structured so a real LLM provider (Llama/Mistral/OpenAI) can be attached later.
