# Search Service

## Purpose
ElasticSearch gateway for dissertation corpus search.

## Endpoints
- `GET /health`
- `POST /index/dissertation`
- `POST /search`

## Search Features
- full text search
- context-style phrase match
- synonym analyzer (`uz_synonyms`)
- typo tolerance (`fuzziness: AUTO`)

## Indexed Fields
- main text: title/problem/proposal/annotation/conclusion/keywords
- people/context: author_name/supervisor_name/university_name/scientific_direction_name
- filters: status/category/visibility/expert_rating/ids/date

## Resilience
If ElasticSearch is unavailable, in-memory fallback index is used for minimal continuity.
