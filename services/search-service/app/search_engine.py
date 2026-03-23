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
                    "problems": {
                        "type": "nested",
                        "properties": {
                            "order_num": {"type": "integer"},
                            "problem_text": {"type": "text", "analyzer": "custom_uz_analyzer"},
                            "source_page": {"type": "keyword"},
                        },
                    },
                    "proposal_contents": {
                        "type": "nested",
                        "properties": {
                            "order_num": {"type": "integer"},
                            "proposal_text": {"type": "text", "analyzer": "custom_uz_analyzer"},
                            "source_page": {"type": "keyword"},
                        },
                    },
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

    def search_problems_proposals(
        self,
        *,
        q: str,
        search_type: str = "both",
        field: str | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        degree: str | None = None,
        university_id: str | None = None,
        page: int = 1,
        size: int = 10,
    ) -> dict[str, Any]:
        if not self.is_available():
            return self._memory_search_problems_proposals(
                q=q,
                search_type=search_type,
                field=field,
                year_from=year_from,
                year_to=year_to,
                degree=degree,
                university_id=university_id,
                page=page,
                size=size,
            )

        should_clauses: list[dict[str, Any]] = []
        if search_type in {"problems", "both"}:
            should_clauses.append(
                {
                    "nested": {
                        "path": "problems",
                        "query": {
                            "multi_match": {
                                "query": q,
                                "fields": ["problems.problem_text^2"],
                                "fuzziness": "AUTO",
                            }
                        },
                        "inner_hits": {
                            "size": 3,
                            "highlight": {"fields": {"problems.problem_text": {}}},
                        },
                    }
                }
            )
        if search_type in {"proposals", "both"}:
            should_clauses.append(
                {
                    "nested": {
                        "path": "proposal_contents",
                        "query": {
                            "multi_match": {
                                "query": q,
                                "fields": ["proposal_contents.proposal_text^2"],
                                "fuzziness": "AUTO",
                            }
                        },
                        "inner_hits": {
                            "size": 3,
                            "highlight": {"fields": {"proposal_contents.proposal_text": {}}},
                        },
                    }
                }
            )

        filters: list[dict[str, Any]] = []
        if field:
            filters.append({"match": {"scientific_direction_name": {"query": field, "operator": "and"}}})
        date_range: dict[str, str] = {}
        if year_from is not None:
            date_range["gte"] = f"{year_from}-01-01"
        if year_to is not None:
            date_range["lte"] = f"{year_to}-12-31"
        if date_range:
            filters.append({"range": {"defense_date": date_range}})
        if degree:
            filters.append({"term": {"category": degree}})
        if university_id:
            try:
                filters.append({"term": {"university_id": int(university_id)}})
            except ValueError:
                pass

        query_body: dict[str, Any] = {
            "bool": {
                "should": should_clauses,
                "minimum_should_match": 1,
                "filter": filters,
            }
        }

        result = self.client.search(
            index=settings.index_name,
            from_=(page - 1) * size,
            size=size,
            query=query_body,
        )

        hits_raw = result["hits"]["hits"]
        total_raw = result["hits"]["total"]
        total = total_raw["value"] if isinstance(total_raw, dict) else int(total_raw)

        items: list[dict[str, Any]] = []
        for hit in hits_raw:
            src = hit.get("_source", {})
            item: dict[str, Any] = {
                "id": hit["_id"],
                "title": src.get("title"),
                "author": src.get("author_name"),
                "university": src.get("university_name"),
                "year": None,
                "degree": src.get("category"),
                "matched_problems": [],
                "matched_proposals": [],
            }
            dd = src.get("defense_date")
            if isinstance(dd, str) and len(dd) >= 4:
                try:
                    item["year"] = int(dd[:4])
                except ValueError:
                    item["year"] = None

            inner = hit.get("inner_hits", {})
            prob = inner.get("problems")
            if prob and prob.get("hits", {}).get("hits"):
                for ph in prob["hits"]["hits"]:
                    highlight = ph.get("highlight", {})
                    src_inner = ph.get("_source", {})
                    hl_text = highlight.get("problems.problem_text", [src_inner.get("problem_text", "")])[0]
                    item["matched_problems"].append(
                        {"text": hl_text, "page": src_inner.get("source_page")}
                    )

            prop = inner.get("proposal_contents")
            if prop and prop.get("hits", {}).get("hits"):
                for ph in prop["hits"]["hits"]:
                    highlight = ph.get("highlight", {})
                    src_inner = ph.get("_source", {})
                    hl_text = highlight.get(
                        "proposal_contents.proposal_text",
                        [src_inner.get("proposal_text", "")],
                    )[0]
                    item["matched_proposals"].append(
                        {"text": hl_text, "page": src_inner.get("source_page")}
                    )

            items.append(item)

        pages = (total + size - 1) // size if total else 0
        return {"items": items, "total": total, "page": page, "size": size, "pages": pages, "query": q}

    def _memory_search_problems_proposals(
        self,
        *,
        q: str,
        search_type: str,
        field: str | None,
        year_from: int | None,
        year_to: int | None,
        degree: str | None,
        university_id: str | None,
        page: int,
        size: int,
    ) -> dict[str, Any]:
        q_lower = q.lower()
        matched: list[tuple[str, dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]] = []

        for doc_id, doc in self.memory_index.items():
            if field and field.lower() not in str(doc.get("scientific_direction_name", "")).lower():
                continue
            if degree and str(doc.get("category", "")).lower() != degree.lower():
                continue
            if university_id is not None:
                try:
                    if doc.get("university_id") != int(university_id):
                        continue
                except ValueError:
                    continue
            dd = doc.get("defense_date")
            if year_from is not None and dd:
                try:
                    y = int(str(dd)[:4])
                    if y < year_from:
                        continue
                except ValueError:
                    pass
            if year_to is not None and dd:
                try:
                    y = int(str(dd)[:4])
                    if y > year_to:
                        continue
                except ValueError:
                    pass

            m_probs: list[dict[str, Any]] = []
            m_props: list[dict[str, Any]] = []
            if search_type in {"problems", "both"}:
                for p in doc.get("problems") or []:
                    text = str(p.get("problem_text", ""))
                    if q_lower in text.lower():
                        m_probs.append({"text": text, "page": p.get("source_page")})
            if search_type in {"proposals", "both"}:
                for p in doc.get("proposal_contents") or []:
                    text = str(p.get("proposal_text", ""))
                    if q_lower in text.lower():
                        m_props.append({"text": text, "page": p.get("source_page")})

            if not m_probs and not m_props:
                continue

            year_val = None
            if isinstance(dd, str) and len(dd) >= 4:
                try:
                    year_val = int(dd[:4])
                except ValueError:
                    year_val = None

            matched.append(
                (
                    doc_id,
                    doc,
                    m_probs[:3],
                    m_props[:3],
                )
            )

        total = len(matched)
        start = (page - 1) * size
        slice_docs = matched[start : start + size]
        items: list[dict[str, Any]] = []
        for doc_id, doc, m_probs, m_props in slice_docs:
            dd = doc.get("defense_date")
            year_val = None
            if isinstance(dd, str) and len(dd) >= 4:
                try:
                    year_val = int(dd[:4])
                except ValueError:
                    year_val = None
            items.append(
                {
                    "id": doc_id,
                    "title": doc.get("title"),
                    "author": doc.get("author_name"),
                    "university": doc.get("university_name"),
                    "year": year_val,
                    "degree": doc.get("category"),
                    "matched_problems": m_probs,
                    "matched_proposals": m_props,
                }
            )

        pages = (total + size - 1) // size if total else 0
        return {"items": items, "total": total, "page": page, "size": size, "pages": pages, "query": q}
