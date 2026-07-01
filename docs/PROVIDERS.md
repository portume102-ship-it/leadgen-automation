# Providers Plugin System - Lead Intelligence Backend V3

This document describes how to implement and register new scraper providers inside the platform.

---

## 1. Creating a New Scraper Provider

All scraper providers must inherit the basic provider structure and implement five core methods:

```javascript
class CustomProvider {
  constructor() {
    this.name = 'custom_provider_name';
  }

  // 1. Search query hook
  async search(page, query) { ... }

  // 2. Scroll and collect results list
  async collect(page, maxLeads) { ... }

  // 3. Extract properties from detail page
  async extract(page, target) { ... }

  // 4. Normalize raw details into Unified Lead schema
  normalize(raw, city) { ... }
}
```

---

## 2. Registering a Provider

To register the provider, append it to the constructor of `ScraperEngine` inside `backend/worker/scraperEngine.js`:

```javascript
const CustomProvider = require('./providers/custom_provider');

class ScraperEngine {
  constructor() {
    this.providers = {
      'google_maps': new GoogleMapsProvider(),
      'custom_provider': new CustomProvider(),
    };
  }
}
```
Provider modules must reside under the `backend/providers/` directory.
