# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-09

Security hardening release.

### Security

- Server-side sessions stored in MongoDB: httpOnly `pd_session` cookie
  (SameSite=Lax, Secure in production), SHA-256 token hash, origin check,
  `/api/auth/me` and `/api/auth/logout`; every API route reads the session and
  checks ownership (401/403). `COOKIE_SECURE=false` allows plain-HTTP testing.
- Persistent login and sign-up attempt limiting: HTTP 429 with `Retry-After`,
  per-pseudo limit without a trusted proxy, per pseudo + IP and per IP limits
  with `TRUST_PROXY=true`, HMAC keys with `THROTTLE_SECRET`.
- The translation Web Worker ignores messages with an untrusted origin or an
  invalid shape (CodeQL `js/missing-origin-check`, alert #89).

### Added

- Direct French ↔ Arabic translation with the official Helsinki-NLP Opus-MT
  models converted to ONNX, with a fallback through English.
- Playwright + axe accessibility suite (`pnpm test:e2e`) and its CI workflow.
- Complete accessibility statement page, `SECURITY.md` and this changelog.

### Fixed

- Accessibility: unique dashboard region name, `dir="auto"` on member
  content, distinct sidebar toggle labels, a single translated 404 title,
  reaction button names that contain the visible count, footer without a
  compliance status.
- Sign-out redirect, JSON errors from session checks, session cookie cleared on
  account deletion.

### CI

- The e2e job runs on `ubuntu-22.04`: `mongo:8.0` refuses to start on Linux
  6.19 and newer (SERVER-121912).
- `next-devtools-mcp` pinned to `0.4.0` in `.mcp.json`.

### Dependencies

- `undici` 6.29.0 → 6.29.1 (GHSA-2m5v-pch6-74hx, GHSA-qrxm-fqhp-jwvm,
  GHSA-xjj6-f33q-929c, GHSA-9fm3-97px-rjf6, GHSA-4qv8-2p9j-2685).
- `zod` 4.6.5 → 4.6.6 (GHSA-mrhx-c7xc-m3w5).
- `minimatch` 10.2.6 → 11.0.1 (GHSA-g3hv-75wg-m249).
- Conversion tool: `torch` 2.7.1 → 2.13.0 (GHSA-63cw-57p8-fm3p,
  GHSA-vgrw-7cvw-pwgx, GHSA-887c-mr87-cxwp, GHSA-rrmf-rvhw-rf47,
  GHSA-qfhq-4f3w-5fph), `optimum` 1.27.0 → `optimum-onnx` 0.1.0,
  `transformers` 4.53.3 → 4.57.6.
- Dependabot updates of `next`, `@huggingface/transformers`, ESLint plugins and
  GitHub Actions.

### Known issues

- `transformers` (offline conversion tool only, not shipped) stays below 4.58
  because `optimum-onnx` requires it: GHSA-x9r9-c232-4q39, GHSA-xrqw-3rrv-vx5w,
  GHSA-fgcw-684q-jj6r, GHSA-29pf-2h5f-8g72 and GHSA-69w3-r845-3855 remain open
  as an accepted risk.

## [0.2.0] - 2026-10-19

Accessible UI, dark mode and internationalisation in four languages.

## [0.1.0] - 2026-10-19

Core community blog: articles, comments, reactions and member dashboard.

[0.3.0]: https://github.com/Alexandre-Gouraud/Projet-Blog-Pattes-Douces/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Alexandre-Gouraud/Projet-Blog-Pattes-Douces/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Alexandre-Gouraud/Projet-Blog-Pattes-Douces/releases/tag/v0.1.0
