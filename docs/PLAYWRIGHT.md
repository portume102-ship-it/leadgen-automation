# Playwright Best Practices - Lead Intelligence Backend V3

This document lists the browser optimization, tab recycling, and memory safety rules implemented inside `BrowserManager`.

---

## 1. Browser Lifecycle & Tab Recycling

To minimize RAM usage and prevent memory exhaustion (OOM crashes) on Railway containers:
1. **Single Launch**: Spawns only one Chromium instance inside `BrowserManager`.
2. **Context Sharing**: All worker tabs share a single `BrowserContext` to leverage cached assets, scripts, stylesheets, and DNS resolution.
3. **Tab Recycling**: Worker tabs are closed immediately after finishing detail extractions. 
4. **Browser Recycling**: The primary browser process is automatically restarted after executing 100 page loads or if the memory usage of the process exceeds 200MB.

---

## 2. Playwright Wait Strategies

* **Intelligent Wait selectors**: Avoid arbitrary timeouts (like `page.waitForTimeout(5000)`). Use selector-based waits with bounding bounds:
  ```javascript
  await page.waitForSelector('.DUwDvf', { state: 'visible', timeout: 5000 });
  ```
* **Network Settle-times**: Use `waitUntil: 'domcontentloaded'` during navigations to prevent hangs from slow media assets.
