# AI Service

## Purpose
RAG-style assistant over dissertation search context.

## Endpoint
- `POST /ask`

## Request
```json
{
  "question": "...",
  "top_k": 5
}
```

## Behavior
1. Calls `search-service`.
2. Collects top matching dissertations.
3. Builds concise context-aware answer.
4. Returns references.

## Response
```json
{
  "answer": "...",
  "references": [ ... ]
}
```

## Extension Path
Can be connected to Llama/Mistral/OpenAI provider for full LLM generation.
