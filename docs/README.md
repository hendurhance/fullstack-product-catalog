# Docs

Architecture notes, ADRs, and the contract change checklist live here.

- `contracts.md` — the contract change checklist (when schema changes, do these steps in order). Filled in Phase 1 once Scramble + openapi-typescript are wired.
- `cache-topology.md` — diagram of the three-cache system (Laravel Redis ↔ HTTP `Cache-Control` ↔ Next.js Data Cache). Filled in Phase 1 after the revalidation webhook closes the loop.
- `decisions/` — ADR per major decision. Working drafts in `PLAN.md` §3 (D1–D14); they get promoted here as they ship.

The README at the repo root is the reviewer-facing entry point. This folder is for depth.
