# System Architecture - Lead Intelligence Backend V3

This document describes the high-level architecture, flow systems, and components of the Lead Intelligence Backend V3 service.

---

## 1. Modular Components

The backend operates as a single unified service running on Node.js + Express, containing three decoupled systems:

```
                  ┌─────────────────────────────────┐
                  │      Express API Router         │
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │       Job & Queue Manager       │
                  └────────────────┬────────────────┘
                                   │
                  ┌────────────────▼────────────────┐
                  │    Browser & Session Manager    │
                  └────────────────┬────────────────┘
                                   │
     ┌───────────────────┬─────────┴─────────┬──────────────────┐
     ▼                   ▼                   ▼                  ▼
[Google Maps]     [Google Search]       [Instagram]         [Website]
  Provider          Provider             Analyzer           Analyzer
```

### Key Modules

1. **BrowserManager**: Orchestrates Chromium browser contexts, tabs (pages), recycling parameters, memory optimization, and browser lifecycle.
2. **SessionManager**: Controls auth parameters, session persistence (cookies, local storage caches), and login expiration tracking for social engines (Google, Instagram).
3. **JobManager & QueueManager**: Sequentially coordinates queued scrape requests, prioritizes jobs, tracks errors, schedules retries, and resets interrupted runs.
4. **Provider Plugins**: Generic adapter handlers implementing normalized Lead data returns across Maps, Search, Instagram, and website auditing.

---

## 2. Process Flow (Scraping & Analysis)

```
[API /start] ──> Queue Job ──> Trigger Manager ──> Request Context ──> Run Provider ──> Upsert Lead (Supabase)
```

1. **API Ingress**: Dashboard calls `POST /scraper/start` or individual analyzer test runs.
2. **Priority Queuing**: Job is inserted into Supabase `scrape_jobs` table and scheduled in local memory `queueManager`.
3. **Execution Setup**: `BrowserManager` checks out a pooled page. `SessionManager` applies relevant cookies.
4. **Active Collection**: The provider opens target URL pages (reusing the open tab context where possible) and scrapes raw profiles.
5. **Direct DB Upsert**: Extracted details are normalized to the Unified Lead schema, pushed to a background thread queue, and `UPSERT`ed to Supabase.
6. **Outreach Handshake**: n8n monitors Supabase changes via cron triggers to initiate automated campaigns.
