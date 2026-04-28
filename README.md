# Full-Stack Product Catalog & Review Platform

A full-stack product catalog with a Laravel 13 API backend, Next.js 16 frontend, MySQL 8.4, and Redis — featuring three-layer cache coherence, typed API contracts, and an admin CRUD dashboard.

---

## Quickstart

```bash
make up      # bring up the full stack (MySQL, Redis, backend, frontend)
make seed    # run migrations and seeders
make test    # run backend + frontend test suites
make down    # tear down
```

After `make up`:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api/v1
- **Health**: http://localhost:8000/api/v1/health
- **Admin login**: `admin@example.com` / `password`

### Development Commands

| Command | What it does |
|---|---|
| `make seed` | Run migrations + seeders (3 categories, 8 products, 10 reviews) |
| `make fresh` | Drop all data, remigrate + seed, flush Redis |
| `make test` | Run both backend and frontend test suites |
| `make lint` | Pint (backend) + ESLint (frontend) |
| `make typecheck` | PHPStan (backend) + `tsc --noEmit` (frontend) |
| `make openapi` | Regenerate `backend/api.json` from Scramble |
| `make types` | Regenerate `frontend/src/types/openapi.ts` from the OpenAPI spec |
| `make contract` | `openapi` + `types` + `typecheck` — full drift gate |

The `make contract` command is the key CI gate: it regenerates the OpenAPI spec (`backend/api.json`) from the Laravel codebase, regenerates the TypeScript types from that spec, then runs `tsc --noEmit` to verify the frontend still compiles against the latest contract.

---

## Architecture

```
[Browser] ─ HTTP(Cache-Control, ETag) ─▶ [Next.js 16 App Router]
                                              │
                 Public pages (SSG + ISR, tagged fetch)
                                              │
                                              ▼
                                     [Laravel API /api/v1]
                                              │
                                 Controller (thin)
                                              │
                                 Service ── Cache wrapper (Redis tags)
                                              │
                                 Repository ── Eloquent
                                              │
                                        [MySQL 8.4]

Mutation flow:  Service.write() ─▶ DB tx
                                ─▶ Cache::tags([...])->flush()
                                ─▶ POST /api/revalidate (HMAC) ─▶ Next revalidateTag(...)
```

Three caches kept coherent by **tag-based invalidation + an HMAC-signed revalidation webhook**. TTLs are a safety net; tag flush is the primary correctness mechanism.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Database | MySQL 8.4 | Spec bonus requirement |
| Cache | Redis 7 | Required for Laravel cache tags — file/database cache cannot do tag-based flush |
| Backend | Laravel 13, PHP 8.4 | Sanctum token auth, Eloquent, Scramble OpenAPI |
| Frontend | Next.js 16, React 19 | App Router, Server Components, `'use cache'` with `cacheLife`/`cacheTag` |
| Admin | TanStack Query + React Hook Form + Zod | Optimistic updates with rollback, client-side validation mirroring server rules |
| Styling | Tailwind CSS v4 | Custom Acme/Untitled-inspired palette with dark mode |
| Testing | PHPUnit (26 tests) + Jest/RTL (10 tests) | Cache invalidation tests are the centerpiece |

---

## Caching Strategy

The spec requires caching all GET responses at the service layer with consistent key naming and mutation-driven invalidation, plus `Cache-Control` headers with documented TTLs. Here is how it is implemented:

### Cache Key Convention
```
{domain}.{shape}.{identifier}
```
Examples: `products.list`, `products.detail.my-widget`, `reviews.product.abc-123`.

### TTL Decisions

| Domain | List | Detail | Rationale |
|---|---|---|---|
| Categories | 60s | 300s | Categories change rarely; longer TTL is safe |
| Products | 60s | 120s | Products change more often; shorter TTL keeps listing fresh per spec |
| Reviews | 60s | — | Reviews change on approve/reject/delete; 60s matches product listing |

### Layer 1: Redis (Service Layer)
Tag-based caching via `Cache::tags()`. Every cached read is tagged by domain and entity (e.g. `['products', 'product:slug:my-widget']`). Mutations flush by tag — never enumerate individual keys. This means adding a new product automatically invalidates the product list cache without knowing its key.

Centralized in `backend/config/cache-policy.php` — single source of truth for all TTLs, tag names, and HTTP header templates.

### Layer 2: HTTP (Cache-Control + ETag)
All public GET responses include `Cache-Control: public, max-age=<TTL>, stale-while-revalidate=<TTL*2>`. Detail endpoints include `ETag` for conditional `304` responses.

### Layer 3: Next.js Data Cache
Every server-side fetch is tagged with `next: { tags: [...] }`. On mutation, Laravel sends an HMAC-signed `POST /api/revalidate` to Next.js which calls `revalidateTag()` for each affected tag. `cacheLife` profiles in `next.config.ts` mirror the backend TTLs so both layers agree on freshness.

### Invalidation Flow
```
Admin creates a product
  → ProductService::create() wraps in DB transaction
  → Cache::tags(['products'])->flush()
  → POST /api/revalidate with tags ['products']
  → Next.js revalidateTag('products')
  → Next visitor gets fresh data
```

---

## SSG / ISR Decisions

Per the spec, products revalidate at 60s and categories at 300s:

| Route | Mode | `revalidate` | Notes |
|---|---|---|---|
| `/` | SSG + ISR | 60s | Featured products |
| `/products` | SSG + ISR | 60s | Category filter via `?category=slug` query param |
| `/products/[slug]` | SSG + ISR | 60s | `generateStaticParams` returns published slugs only; `notFound()` for unpublished |
| `/categories` | SSG + ISR | 60s | Category cards |
| `/categories/[slug]` | SSG + ISR | 300s | Category detail with filtered product list |
| `/admin/*` | CSR | — | Server Component shell does auth check + first-paint data; client takes over for interactions |

`generateStaticParams` is used on `/products/[slug]` and `/categories/[slug]` to pre-render all published slugs at build time. ISR TTLs act as a safety net — the revalidation webhook provides immediate invalidation on mutations.

---

## Implementation Details

### Service/Repository Pattern
`Controller → Service → CacheWrapper → Repository → Eloquent`. Cache concerns live in the wrapper. Controllers are thin — they handle HTTP concerns and delegate to services. Models have no service locator; controllers resolve services explicitly.

### Slug Auto-Generation
`HasSlug` trait generates slugs from `name` on `creating` and `updating`. Route model binding uses `getRouteKeyName() → 'slug'`. Name changes regenerate the slug and invalidate both old and new cache tags.

### Review Moderation
Per the spec's seed requirement (mixed approved/unapproved reviews), new submissions default to `is_approved: false` — set in the service layer. Admin approve/reject via dedicated endpoints. Only approved reviews appear in public listings and product average ratings.

### Price Handling
Stored as integer cents in the `price` column. Formatted via `Money` class on backend and `lib/money.ts` on frontend to avoid floating-point rounding issues.

### Cursor Pagination
Product listings use `cursorPaginate()` — offset pagination degrades at depth under inserts. Cursor is stable and index-friendly.

### Auth Boundary
The Next.js admin layout is a Server Component that reads the Sanctum token from an HttpOnly cookie. Edge middleware redirects unauthenticated requests to `/admin/login` — no admin JS chunks leak to anonymous users.

### Frontend Validation
Zod schemas in `frontend/src/types/forms.ts` mirror the Laravel Form Request rules exactly — same constraints, same error messages. Client-side validation catches errors before the network round-trip while server-side Form Requests remain the authoritative gate.

### Typed API Contract
Drizzle schemas at `frontend/src/db/schema.ts` use `InferSelectModel`/`InferInsertModel` as required by the spec. Additionally, OpenAPI types are auto-generated via Scramble + `openapi-typescript` — the runtime contract used by the typed SDK in `frontend/src/lib/api/`. The `make contract` command verifies both sources stay in sync.
---

## Project Structure

```
backend/
  app/
    Http/Controllers/Api/V1/   # Thin controllers
    Http/Requests/             # Form Requests (validation)
    Http/Resources/            # API Resources (response shaping)
    Models/                    # Eloquent models + HasSlug trait
    Policies/                  # Laravel Policies
    Repositories/              # Data access
    Services/                  # Business logic + cache orchestration
    Support/
      Cache/                   # CachePolicy, CacheWrapper, RevalidationService
      Http/                    # CacheableResponse helper
      Money/                   # Money formatting
  config/cache-policy.php      # Centralized cache config
  database/
    factories/                 # Model factories
    migrations/                # Schema migrations
    seeders/                   # Demo data (3 cats, 8 products, 10 reviews)
  tests/Feature/               # 26 PHPUnit tests (cache invalidation focus)

frontend/
  src/
    app/
      (public)/                # Public pages (SSG + ISR)
        products/              # Products listing + detail + reviews
        categories/            # Categories listing + detail
      admin/                   # Admin CRUD (CSR with server shell)
    components/                # Shared UI components
    db/schema.ts               # Drizzle schemas with type inference
    lib/
      api/                     # Typed SDK (one function per endpoint)
      actions.ts               # Shared server action helpers
      auth/                    # Cookie-based token management
    types/
      forms.ts                 # Zod schemas mirroring backend validation
      index.ts                 # Reconciled types from OpenAPI + Drizzle
  jest.config.ts               # Jest configured per Next.js docs
  next.config.ts               # cacheLife profiles mirroring backend TTLs

infra/
  docker-compose.yml           # MySQL 8.4 + Redis 7 + backend + frontend
  backend.Dockerfile
  frontend.Dockerfile
```

---

## API Endpoints

The full machine-readable spec lives at [`backend/api.json`](backend/api.json) (OpenAPI 3.1.0, auto-generated by [Scramble](https://scramble.dedoc.co/)). Regenerate with `make openapi`.

### Public (no auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/{slug}` | Category detail |
| GET | `/api/v1/products` | Products list (cursor-paginated, `?category_id=` filter) |
| GET | `/api/v1/products/{slug}` | Product detail (published only) |
| POST | `/api/v1/reviews` | Submit review (throttled 5/min) |

### Authenticated (Sanctum token)
| Method | Endpoint | Abilities |
|---|---|---|
| POST | `/api/v1/categories` | `categories:write` |
| PATCH | `/api/v1/categories/{slug}` | `categories:write` |
| DELETE | `/api/v1/categories/{slug}` | `categories:write` |
| POST | `/api/v1/products` | `products:write` |
| PATCH | `/api/v1/products/{slug}` | `products:write` |
| DELETE | `/api/v1/products/{slug}` | `products:write` |
| POST | `/api/v1/reviews/{id}/approve` | `reviews:moderate` |
| POST | `/api/v1/reviews/{id}/reject` | `reviews:moderate` |
| DELETE | `/api/v1/reviews/{id}` | `reviews:moderate` |

---

## Rendering Modes

| Route | Mode | Notes |
|---|---|---|
| `/` | SSG + ISR | Featured products, 60s revalidate |
| `/products` | SSG + ISR (60s) | Category filter via `?category=slug` |
| `/products/[slug]` | SSG + ISR (60s) | `generateStaticParams` for published only, `notFound()` for unpublished |
| `/categories` | SSG + ISR (60s) | Category listing |
| `/categories/[slug]` | SSG + ISR (300s) | Category detail with products |
| `/admin/*` | CSR (server shell) | Auth-gated, TanStack Query, optimistic updates |

---

## Testing

### Backend (26 tests, 87 assertions)
```
make test-backend
```
- **CategoryCacheInvalidationTest** (6 tests): fresh data after create/update/delete, slug regeneration, webhook verification, public reads don't fire webhook
- **ProductCacheInvalidationTest** (6 tests): same pattern for products
- **ReviewCacheInvalidationTest** (7 tests): fresh data after create/approve/reject/delete, webhook verification
- **ReviewTest** (7 tests): CRUD, validation, auth gating, webhook

Tests run against MySQL `product_catalog_testing` database — same engine as production, no SQLite discrepancies.

### Frontend (10 tests, Jest + RTL)
```
make test-frontend
```
- **ThemeToggle**: default state, toggle, localStorage persistence
- **ReviewForm**: renders fields, validation errors, valid submission
- **ConfirmDialog**: renders, callbacks, loading state

---

## Mobile Responsiveness

- Product grid: 1-col (mobile) → 2-col (tablet) → 3-4 col (desktop)
- Navigation collapses to hamburger menu on mobile
- Admin tables scroll horizontally with sticky first column
- Dark mode toggle in both public and admin headers

Tested breakpoints: 375px (iPhone SE), 768px (iPad), 1280px (desktop).
