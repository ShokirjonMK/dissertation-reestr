# ElasticSearch

## Role
Text retrieval engine for registry search.

## Config
- `databases/elasticsearch/elasticsearch.yml`
- single-node in local setup
- security enabled (`xpack.security.enabled: true`)

## Index
Default index: `dissertations`

## Search Modes
- full text
- phrase/context match
- synonym
- typo tolerant
