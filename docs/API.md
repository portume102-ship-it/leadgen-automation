# API Documentation - Lead Intelligence Backend V3

This document lists the REST API endpoints exposed by the backend service. All private endpoints require the `x-api-secret` header.

---

## 1. Job Control Endpoints

### POST `/api/jobs/start`
Queue a new scraping or enrichment job.
* **Headers**: `x-api-secret: <secret>`
* **Body**:
  ```json
  {
    "provider": "google_maps",
    "keyword": "dentist",
    "city": "Mumbai",
    "maxLeads": 50,
    "workerCount": 2
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "jobId": "uuid-here",
    "message": "Scrape job successfully queued."
  }
  ```

### POST `/api/jobs/pause`
Pause a running job.
* **Body**: `{ "jobId": "uuid-here" }`

### POST `/api/jobs/resume`
Resume a paused job.
* **Body**: `{ "jobId": "uuid-here" }`

### POST `/api/jobs/stop`
Cancel/stop a running job.
* **Body**: `{ "jobId": "uuid-here" }`

### POST `/api/jobs/retry`
Clone and retry a completed, failed, or stopped job.
* **Body**: `{ "jobId": "uuid-here" }`

---

## 2. Status & Monitoring Endpoints

### GET `/api/jobs/status`
Get statistics about the active queue and currently executing job.

### GET `/api/jobs`
Get a list of all historical scrape jobs.

### GET `/api/jobs/:id`
Get detailed status, statistics, and log entries of a specific job by ID.

---

## 3. Analyzer Testing (Individual Test Mode)

### POST `/api/test/website`
Audit a single website URL immediately without running a background job queue.
* **Body**: `{ "url": "https://acmedental.com" }`
* **Response**: Returns normalized scores, SEO headers, technology stack, and contact elements.

### POST `/api/test/instagram`
Audit a single Instagram profile username immediately.
* **Body**: `{ "username": "acmedental" }`

---

## 4. Session Controls

### POST `/api/sessions/login`
Execute an automated browser login flow for a provider (e.g. Instagram) to persist a session.
* **Body**: `{ "provider": "instagram", "username": "...", "password": "..." }`

### GET `/api/sessions/status`
Check active login states for session-based providers.
