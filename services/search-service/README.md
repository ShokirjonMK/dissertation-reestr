# Search Service

FastAPI service wrapping ElasticSearch for dissertation search.

Features:
- Full-text search
- Context-style phrase matching
- Synonym-ready analyzer
- Typo tolerance via `fuzziness: AUTO`
- Memory fallback if ElasticSearch is unavailable
