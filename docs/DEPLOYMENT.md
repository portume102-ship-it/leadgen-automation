# Deployment Guide - Lead Intelligence Backend V3

This document lists environment configurations and setup guidelines to run the V3 backend on Railway.

---

## 1. Environment Variables

* **`PORT`**: `3001` (express app listener)
* **`API_SECRET`**: Authentication header token value matched with Next.js Vercel's `WHATSAPP_API_SECRET`
* **`SUPABASE_URL`**: Supabase public endpoint URL
* **`SUPABASE_SERVICE_ROLE_KEY`**: Supabase administrative key used for direct upserts

---

## 2. Nixpacks Setup

The container executes on Railway using Nixpacks.
Ensure the following system libraries (required for headless Playwright Chromium execution) are specified in the setup:
* Nixpkgs: `nss`, `nspr`, `atk`, `at-spi2-atk`, `cups`, `libdrm`, `dbus`, `xcb-util`, `libxkbcommon`, `mesa`.
* Install command: `npm install`
* Start command: `npm start`
