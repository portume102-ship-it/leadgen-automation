# Database Schema - Lead Intelligence Backend V3

This document lists the Supabase database schemas, tables, index setups, and Row-Level Security (RLS) configurations.

---

## 1. Tables Overview

### `scrape_jobs`
Tracks scraping tasks.
* `id` (UUID, Primary Key)
* `created_at` (TIMESTAMPTZ)
* `keyword` (TEXT)
* `city` (TEXT)
* `max_leads` (INTEGER)
* `status` (TEXT: queued, running, paused, stopped, completed, failed)
* `progress` (INTEGER)
* `current_business` (TEXT)
* `current_provider` (TEXT)
* `error_count` (INTEGER)
* `logs` (TEXT[])

### `scraper_sessions`
Stores serialized session state (cookies, local storage).
* `id` (UUID, Primary Key)
* `provider` (TEXT: instagram, linkedin, google)
* `username` (TEXT)
* `session_data` (JSONB)
* `updated_at` (TIMESTAMPTZ)
* `is_valid` (BOOLEAN)

### `website_audits`
Stores detailed website audit scores.
* `id` (UUID, Primary Key)
* `url` (TEXT)
* `seo_score` (NUMERIC)
* `ux_score` (NUMERIC)
* `performance_score` (NUMERIC)
* `accessibility_score` (NUMERIC)
* `tech_stack` (JSONB)
* `social_links` (TEXT[])
* `screenshot_url` (TEXT)
* `emails` (TEXT[])
* `phone_numbers` (TEXT[])

---

## 2. Row Level Security (RLS)

All tables must have RLS enabled:
* **`service_role`**: Full read/write capability (used by backend worker on Railway).
* **`anon` / public keys**: Select-only access (used by dashboard client pages).
