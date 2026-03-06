# Data Model

## Core Entities
- `roles`
- `users`
- `user_profiles`
- `scientific_directions`
- `universities`
- `regions`
- `districts`
- `dissertations`

## Dissertation Fields
- identity: `id`, `title`
- relations: `scientific_direction_id`, `university_id`, `author_id`, `supervisor_id`, `region_id`
- text corpus: `problem`, `proposal`, `annotation`, `conclusion`, `keywords`
- lifecycle: `status`, `defense_date`
- advanced filters: `category`, `expert_rating`, `visibility`
- audit: `created_at`, `updated_at`

## Computed Read Fields
- `author_name`
- `supervisor_name`
- `university_name`
- `scientific_direction_name`

## Seed Data
Startup seed creates:
- all roles
- default users (`admin`, `moderator`, `doctorant`, `supervisor`, `employee`)
- base catalogs
- sample dissertations
