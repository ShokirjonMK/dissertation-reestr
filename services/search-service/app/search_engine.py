from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import ConnectionError as ElasticConnectionError

from app.config import settings


class SearchEngine:
    def __init__(self) -> None:
        self.client = Elasticsearch(settings.elastic_url, request_timeout=5)
        self.memory_index: dict[str, dict[str, Any]] = {}

    def ensure_index(self) -> None:
        if not self.is_available():
            return
        if self.client.indices.exists(index=settings.index_name):
            return

        body = {
            "settings": {
                "analysis": {
                    "filter": {
                        "uz_synonyms": {
                            "type": "synonym",
                            "synonyms": [
                                "taklif, tavsiya",
                                "muammo, masala",
                                "dissertatsiya, ilmiy ish",
                            ],
                        }
                    },
                    "analyzer": {
                        "custom_uz_analyzer": {
                            "tokenizer": "standard",
                            "filter": ["lowercase", "uz_synonyms"],
                        }
                    },
                }
            },
            "mappings": {
                "properties": {
                    "title": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "problem": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "proposal": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "annotation": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "conclusion": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "keywords": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "autoreferat_text": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "dissertation_word_text": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "author_name": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "supervisor_name": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "university_name": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "scientific_direction_name": {"type": "text", "analyzer": "custom_uz_analyzer"},
                    "status": {"type": "keyword"},
                    "category": {"type": "keyword"},
                    "visibility": {"type": "keyword"},
                    "expert_rating": {"type": "float"},
                    "scientific_direction_id": {"type": "integer"},
                    "university_id": {"type": "integer"},
                    "author_id": {"type": "integer"},
                    "supervisor_id": {"type": "integer"},
                    "region_id": {"type": "integer"},
                    "defense_date": {"type": "date"},
                }
            },
        }
        self.client.indices.create(index=settings.index_name, body=body)

    def is_available(self) -> bool:
        try:
            return bool(self.client.ping())
        except ElasticConnectionError:
            return False

    def index_document(self, doc_id: str, payload: dict[str, Any]) -> None:
        self.memory_index[doc_id] = payload
        if not self.is_available():
            return
        self.client.index(index=settings.index_name, id=doc_id, document=payload, refresh=True)

    def search(self, query: str, filters: dict[str, Any] | None = None, size: int = 20) -> dict[str, Any]:
        if not self.is_available():
            return self._memory_search(query=query, filters=filters, size=size)

        bool_query: dict[str, Any] = {
            "must": [
                {
                    "multi_match": {
                        "query": query,
                        "fields": [
                            "title^3",
                            "problem",
                            "proposal",
                            "annotation",
                            "conclusion",
                            "keywords",
                            "autoreferat_text",
                            "dissertation_word_text",
                            "author_name",
                            "supervisor_name",
                            "university_name",
                            "scientific_direction_name",
                        ],
                        "fuzziness": "AUTO",
                    }
                }
            ],
            "should": [
                {
                    "multi_match": {
                        "query": query,
                        "fields": ["title", "annotation", "conclusion"],
                        "type": "phrase",
                        "boost": 2,
                    }
                }
            ],
            "minimum_should_match": 0,
            "filter": [],
        }

        for key, value in (filters or {}).items():
            bool_query["filter"].append({"term": {key: value}})

        result = self.client.search(
            index=settings.index_name,
            size=size,
            query={"bool": bool_query},
        )

        hits = [
            {
                "id": hit["_id"],
                "score": hit.get("_score", 0.0),
                "source": hit.get("_source", {}),
            }
            for hit in result["hits"]["hits"]
        ]
        return {"total": result["hits"]["total"]["value"], "hits": hits}

    def _memory_search(self, query: str, filters: dict[str, Any] | None, size: int) -> dict[str, Any]:
        query_lower = query.lower()

        fields = [
            "title",
            "problem",
            "proposal",
            "annotation",
            "conclusion",
            "keywords",
            "autoreferat_text",
            "dissertation_word_text",
            "author_name",
            "supervisor_name",
            "university_name",
            "scientific_direction_name",
        ]

        def matched(doc: dict[str, Any]) -> bool:
            haystack = " ".join(str(doc.get(field, "")) for field in fields)
            if query_lower not in haystack.lower():
                return False
            if not filters:
                return True
            for key, value in filters.items():
                if doc.get(key) != value:
                    return False
            return True

        matched_docs: Iterable[tuple[str, dict[str, Any]]] = [
            (doc_id, doc) for doc_id, doc in self.memory_index.items() if matched(doc)
        ]
        hits = [{"id": doc_id, "score": 1.0, "source": doc} for doc_id, doc in list(matched_docs)[:size]]
        return {"total": len(hits), "hits": hits}
