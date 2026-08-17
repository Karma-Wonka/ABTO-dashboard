# API Reference

This admin dashboard is the single source of truth for the public website
(`../web`). Every route lives under `src/app/api/`. There are three tiers:

1. **Public** (`/api/public/*` + the legacy `/api/site-content`) —
   unauthenticated, CORS-open (`Access-Control-Allow-Origin: *`), cached
   (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`).
   This is exactly what `web/` reads. No PII is ever returned here.
2. **Internal** (`/api/members`, `/api/events`, `/api/news`,
   `/api/documents`, `/api/committee`, `/api/destinations`,
   `/api/submissions`, `/api/users`) — used by this dashboard and the
   member self-service portal. Requires a signed-in session
   (`requireRole`/`requireSelfOrAdmin` in `src/lib/rbac.ts`).
3. **Auth** (`/api/auth/*`) — NextAuth + registration.

All responses are `{ success: boolean, message?: string, ...data }`. All
mutation routes validate their body against the same Zod schema used by
the corresponding dashboard form (`src/features/*/schemas/*.ts`).

Every write to a public-facing entity calls `notifyWebRevalidate(tags)`
(`src/lib/revalidate.ts`), which POSTs to `${WEB_REVALIDATE_URL}/api/revalidate`
so the public site's cache drops within moments instead of waiting out its
60s time-based revalidate window.

## Public routes (consumed by `web/`)

| Route | Method | Returns |
| --- | --- | --- |
| `/api/public/news` | GET | `{ news: NewsPost[] }` — `?search=` optional |
| `/api/public/events` | GET | `{ events: Event[] }` |
| `/api/public/members` | GET | `{ members: PublicMember[] }` — active members only, restricted to `{ id, name, region, specialties, languages, website, member_since }` (no email/phone) |
| `/api/public/committee` | GET | `{ committee: CommitteeMember[] }` |
| `/api/public/destinations` | GET | `{ destinations: Destination[] }` — `?kind=place\|druk_air\|tashi_air` optional |
| `/api/site-content` | GET | `{ content: Record<string, unknown> }` — full key→JSON map, see below |
| `/api/site-content` | PUT | admin-only write |
| `/api/public/submissions` | POST | `{ kind: 'contact'\|'membership', name, email, phone?, company?, message?, payload?, honeypot? }` → creates a submission. Rate-limited (5/hr/IP) + honeypot-guarded. |

### Site content keys

`site_content` is an open-ended `key → JSONB` table (`src/constants/site-content.ts`).
Every key the public site currently reads is listed in
`src/features/site-content/constants/sections.ts`, grouped by admin-dashboard
tab (Home, About, Membership, Travel, Contact, Nav & Footer, SEO). Adding a
new section is: add a `DEFAULTS` entry there + one `SectionConfig` entry in
`sections.ts` — no schema migration, no new route.

## Internal routes (dashboard + member portal, session required)

Each of `members`, `events`, `news`, `documents`, `committee`, `destinations`
follows the same shape:

| Route | Method | Auth |
| --- | --- | --- |
| `/api/{entity}` | GET | signed-in (`member` or `admin`) |
| `/api/{entity}` | POST | `admin` |
| `/api/{entity}/[id]` | GET | signed-in |
| `/api/{entity}/[id]` | PUT | `admin` (Members: self-or-admin — a member may edit only their own row) |
| `/api/{entity}/[id]` | DELETE | `admin` |

Extra: `/api/members/me` (GET, any signed-in user — returns the caller's own
member row by email match, or `null`).

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/submissions` | GET | `admin` | list contact/membership submissions |
| `/api/submissions/[id]` | DELETE | `admin` | |
| `/api/upload` | POST | `admin` | `multipart/form-data`, field `file`; image only, ≤8MB; uploads to Vercel Blob, returns `{ url }` |
| `/api/users` | GET/POST | none (mock data, unrelated to real `auth_users`) | leftover template code |
| `/api/users/[id]` | PUT/DELETE | none (mock) | leftover template code |

## Auth

| Route | Method | Notes |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth internal (sign-in/sign-out/session) |
| `/api/auth/register` | POST | public sign-up; `role` defaults to `member` unless the email is in `AUTO_ADMIN_EMAILS` |

## Environment variables this API surface depends on

| Var | Purpose |
| --- | --- |
| `POSTGRES_URL` | Neon/Vercel Postgres connection |
| `AUTH_SECRET`, `AUTO_ADMIN_EMAILS` | NextAuth / bootstrap admin |
| `BLOB_READ_WRITE_TOKEN` | `/api/upload` |
| `WEB_REVALIDATE_URL`, `REVALIDATE_SECRET` | on-demand cache purge on `../web` after a write |

See `env.example.txt` for the full list with descriptions.
