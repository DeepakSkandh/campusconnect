# CampusConnect: frontend

React + TypeScript + Vite single-page app for CampusConnect. Styling is Tailwind CSS v4 with shadcn/ui-style components; server state is TanStack Query; forms are React Hook Form + Zod; routing is React Router.

## Run it

```bash
cd frontend
cp .env.example .env      # optional: defaults already use mock data
npm install
npm run dev               # http://localhost:5173
```

Sign in with **LOGIN**, then pick one of the synthetic demo accounts (Student, Organizer, Department Admin, Campus Admin) to see role-aware screens.

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Dev server with hot reload           |
| `npm run build`     | Type-check (`tsc -b`) and build      |
| `npm run typecheck` | Type-check only                      |
| `npm run lint`      | ESLint                               |
| `npm run preview`   | Serve the production build locally   |

## Mock mode vs real backend

`VITE_USE_MOCKS=true` (default) serves synthetic data from `src/mocks/` with simulated latency. No backend needed.

`VITE_USE_MOCKS=false` makes every feature hook call the FastAPI backend at `VITE_API_BASE_URL` (default `/api/v1`). In development, Vite proxies `/api` to `http://localhost:8000`, so the browser talks to one origin and the backend can use an httpOnly session cookie. Sign-in then hands off to `GET /api/v1/auth/login`, and the current user comes from `GET /api/v1/auth/me`.

Page components never know which mode is active: the switch lives only in each feature's `api.ts`.

## Structure

```
src/
├── app/              App root, providers, router, query client, error pages
├── components/
│   ├── ui/           shadcn-style primitives (button, card, badge, input, …)
│   ├── layout/       App shell: crimson header, breadcrumbs, footer
│   └── common/       Shared pieces: status badges, portal tiles, page header,
│                     loading/empty/error states, form field, "coming soon"
├── config/           env access and navigation (main nav + dashboard tiles)
├── features/         One folder per domain module
│   ├── auth/         Auth context, route guards, login page
│   ├── dashboard/    Role-aware home with alerts and shortcut tiles
│   ├── resources/    Catalog with search/filters, resource details
│   ├── bookings/     My bookings, department approval queue
│   ├── events/       Event list, create-event form (Zod schema)
│   ├── skills/       Skill profile and volunteer roles with skill matching
│   ├── notifications/
│   └── admin/        Placeholders for admin areas
├── hooks/            Reusable hooks
├── lib/              API client, date formatting, utilities
├── mocks/            Synthetic data + in-browser mock API
└── types/            Domain types mirroring the backend schemas
```

Each feature folder follows the same pattern: `api.ts` (query keys + TanStack Query hooks), page components, and feature-specific components.

## Conventions

- **Server state goes through TanStack Query hooks** in `features/*/api.ts`. Components never call `fetch` directly.
- **All HTTP goes through `lib/api-client.ts`.** It normalises FastAPI errors into `ApiError` (`isConflict` for 409, `fieldErrors` for 422) and sends an `Idempotency-Key` header on writes that need it.
- **Status display lives in one place:** `components/common/status-badge.tsx`. Only an `approved` booking is shown as "Confirmed".
- **Role checks in the UI are hints.** `RequireRole` and role-filtered navigation only hide things; the backend must authorize every request.
- **Dates:** the API sends UTC ISO strings, and `lib/format.ts` displays them in `Asia/Kolkata`.
- **Types:** `types/domain.ts` mirrors the backend. Once the backend exists, generate these from its OpenAPI schema (`npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts`).
- **Adding shadcn components:** `npx shadcn@latest add dialog` (config in `components.json`). They pick up the CampusConnect theme from `src/index.css`.

## Status

| Area | State |
| --- | --- |
| Login (demo accounts), app shell, role-aware dashboard | Working on mock data |
| Resource catalog, search, filters, detail page | Working on mock data |
| Events list, create-event form with validation | Working on mock data (saves a draft in memory) |
| My bookings, approval queue (read-only) | Working on mock data |
| Skills profile, volunteer roles with skill-match explanation | Working on mock data |
| Booking requests, availability calendar, approve/reject | Planned: Phase 2 |
| Matching recommendations, volunteer applications, profile editing | Planned: Phase 3 |
| Admin resource management, reports, campus admin, audit log | Placeholder pages |
