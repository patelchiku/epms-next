# CLAUDE.md — Developer Guide for EPMS

This file gives Claude Code (and human developers) the context needed to work effectively on this codebase.

---

## Project Overview

EPMS (Estate Property Management System) is a property CRM for Top Space real-estate agency. It is a Next.js 16 App Router application deployed on Vercel with a Railway MySQL backend.

**Live:** https://epms-next.vercel.app  
**Repo:** https://github.com/patelchiku/epms-next  
**DB:** Railway MySQL — connection string in `DATABASE_URL` env var

---

## Key Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (runs on Vercel automatically)
npm run seed         # Seed development data (ts-node prisma/seed.ts)
npx prisma studio    # Open Prisma Studio (DB browser)
npx prisma db push   # Push schema changes to DB (no migration files used)
npx prisma generate  # Regenerate Prisma client after schema changes
git push origin main # Triggers Vercel auto-deploy (~45 seconds build time)
```

---

## Architecture Decisions

### No migration files — use `prisma db push`
Schema changes go directly to the Railway MySQL database via `npx prisma db push`. There are no migration files in this project. This is intentional for a single-environment setup.

### App Router with client components
All dashboard pages are `"use client"` components that fetch data via Axios from their own API routes. There are no server components fetching data directly from Prisma (except auth). This keeps the data-fetching pattern consistent and avoids React hydration issues.

### Generic master data API
All master data tables share a single API handler at `src/app/api/master/[resource]/route.ts`. The `resource` param maps to a Prisma model name. Adding a new master table requires:
1. Adding the model to `prisma/schema.prisma`
2. Running `npx prisma db push && npx prisma generate`
3. Adding the resource name to the map in `src/app/api/master/[resource]/route.ts`
4. Creating a new page at `src/app/(dashboard)/master/[resource-name]/page.tsx` using the `MasterPage` component

### String amounts in deals
`PropertyDeal.dealAmount` and `PropertyDealPayment.amount` are stored as plain strings (e.g., "1.2 Cr", "₹2,40,000"). Never call `Number()` on these directly — use the `parseAmount` helper defined in the deal detail page, which strips commas before parsing.

### Mobile numbers stored as JSON string
`Enquiry.mobileNos` is stored as a JSON string array in MySQL (e.g., `'["9876543210","9876543211"]'`). Always use `parseMobiles()` from `src/lib/utils.ts` to read it and `stringifyMobiles()` to write it.

### Zod validation on API PUT routes
Form selects send string values for FK fields (e.g., `"3"` instead of `3`). API PUT handlers must coerce these to integers. The enquiry PUT uses a Zod schema with union types. The property PUT uses an inline `toIntOrNull` helper. **Do not spread `...body` directly into Prisma `data:` without coercion — this causes silent type errors.**

---

## Common Patterns

### API route pattern
```typescript
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... Prisma query
}
```

### Integer coercion for FK fields (property pattern)
```typescript
const toIntOrNull = (v: any) => (v === "" || v == null || isNaN(Number(v))) ? null : Number(v);
// then in data:
propertyTypeId: toIntOrNull(body.propertyTypeId),
```

### Enquiry Zod coercion pattern
```typescript
const toIntOrNull = z.union([z.number().int(), z.string().transform(v => v === "" ? null : parseInt(v, 10))]).nullable().optional();
```

### Mobile input (enquiry forms)
Uses `useFieldArray` from React Hook Form. The array is sent as `mobileNos: string[]` and stored via `stringifyMobiles()`.

### Pagination
All list APIs return `{ data, total, page, pageSize, totalPages }`. List pages implement client-side pagination by changing the `page` state variable inside a `useCallback` fetchData function.

### Filter tabs (enquiries)
The enquiry API supports a `filter` query param: `today` (nfd = today), `tomorrow` (nfd = tomorrow), `pending` (nfd < today). The enquiry list page reads the initial `filter` value from `useSearchParams` so that dashboard quick-links work correctly.

---

## File Reference

| File | Purpose |
|---|---|
| `src/middleware.ts` | Protects all routes except `/login` and `/api/auth` |
| `src/lib/auth.ts` | NextAuth config with credentials provider and IP approval check |
| `src/lib/auth.config.ts` | Auth callbacks (session, jwt) |
| `src/lib/prisma.ts` | Singleton Prisma client (`global.__prisma`) |
| `src/lib/utils.ts` | `formatDate`, `parseMobiles`, `stringifyMobiles`, `cn` |
| `src/components/master/MasterPage.tsx` | Reusable inline CRUD UI for all master pages |
| `src/app/api/master/[resource]/route.ts` | Generic master CRUD handler |
| `src/app/api/enquiries/[id]/route.ts` | Enquiry CRUD — Zod-validated PUT |
| `src/app/api/properties/route.ts` | Property list + create with toIntOrNull |
| `src/app/api/properties/[id]/route.ts` | Property CRUD with toIntOrNull coercion |
| `prisma/schema.prisma` | Full DB schema — all models and field mappings |
| `prisma/seed.ts` | Comprehensive seed for development |

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel + local `.env.local` | Railway MySQL connection string |
| `AUTH_SECRET` | Vercel + local `.env.local` | NextAuth signing secret (32+ chars) |
| `NEXTAUTH_URL` | Vercel | Canonical URL for NextAuth redirects |

**Do not commit `.env.local`.** It is in `.gitignore`.

---

## Deploy Workflow

1. Make changes locally
2. `git add` specific files (avoid `git add .` to prevent committing `.env.local`)
3. `git commit -m "message"`
4. `git push origin main`
5. Vercel auto-deploys in ~45 seconds
6. Check https://vercel.com/patelchiku-2077s-projects/epms-next/deployments for status

---

## Known Issues / Gotchas

### INP (Interaction to Next Paint) Warnings
The Chrome DevTools extension shows "INP Issue" popups during interactions in the browser testing environment. These are **instrumentation overhead from the DevTools extension itself**, not application performance bugs. The app works correctly. Use `javascript_tool` with `document.querySelector('button[type="submit"]').click()` to submit forms when the INP popup blocks browser click tools.

### MagicBricks "Access Denied"
MagicBricks whitelists IPs at their end. Vercel's shared egress IPs are not whitelisted. The `/api/leads/magicbricks` route detects the HTML "Access Denied" response and returns a clear error message. This is a platform limitation, not a bug.

### React Hook Form + DOM value setting
Setting input values via `element.value = "..."` in JavaScript does not update React Hook Form's internal state. Use `element.dispatchEvent(new Event('input', {bubbles: true}))` after setting the value, or use the `setValue` function from `useForm` instead.

### Prisma client on Vercel
The Prisma client is generated at build time. After schema changes, you must push to GitHub (not just run `prisma generate` locally) for Vercel to regenerate the client in the build environment.

---

## Seed Credentials

After running `npm run seed`:

| Role | Mobile | Password |
|---|---|---|
| Admin | 9999999999 | Admin@123 |
| Agent1 | 9876543210 | Agent@123 |
| Agent2 | 9876543211 | Agent@123 |
