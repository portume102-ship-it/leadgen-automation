# Contributing Guidelines - Lead Intelligence Backend V3

Welcome to the Lead Intelligence Backend contributor guide. Follow these modular coding paradigms.

---

## 1. Modular Coding Style

1. **Decouple Modules**: Do not import Express inside providers or business modules. Business logic must return normalized models, keeping APIs solely as a gateway interface layer.
2. **Use Repository Patterns**: All database selections, insertions, and updates must go through repository classes (e.g. `scrapeJobRepository.js`, `leadsRepository.js`) instead of writing duplicate REST requests inside random scripts.
3. **Pino Logging**: Use Pino logger for all logs. Prefix logs with structured tags: `[Job Manager]`, `[Browser Manager]`, `[Session Manager]`.
4. **Intelligent Waits**: Never use static sleep/timeout logic unless doing rate-limiting pauses. Wait for DOM selectors.

---

## 2. Commit Rules

Every commit must be incrementally compilable and leaves the core backend deployable and working.
Before pushing, run a syntax validity check:
```bash
node -c index.js
```
