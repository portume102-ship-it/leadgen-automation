# Dashboard Integration - Lead Intelligence Backend V3

This document lists dashboard integration steps and Next.js routes alignment.

---

## 1. Next.js API Routes

The Next.js dashboard acts as an interface that proxies endpoints using the catch-all dynamic proxy router `dashboard/src/app/api/scraper/[...path]/route.ts`:

* Client calls `/api/scraper/jobs` ──> Next.js proxies to `${WHATSAPP_SERVICE_URL}/scraper/jobs`
* Authorizes via header: `x-api-secret` matching `process.env.WHATSAPP_API_SECRET`.

---

## 2. Metrics Widgets and Logs

* **Real-time logs viewer**: Pulls array of strings from `scrape_job.logs` inside the Supabase database.
* **Server Performance Metrics**: Dashboard polls the server `/api/metrics` to draw graphs representing active workers, browser page context counts, CPU usage, and RAM occupancy.
