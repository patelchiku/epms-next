# EPMS — Estate Property Management System

A full-featured property CRM for real-estate brokers built with Next.js 16, Prisma, and MySQL. Manages enquiries, properties, deals, master data, users, and portal lead imports (MagicBricks, Housing.com, 99Acres).

**Live URL:** https://epms-next.vercel.app  
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 5 · MySQL (Railway) · Tailwind CSS v4 · NextAuth v5

---

## Features

| Module | Capabilities |
|---|---|
| **Dashboard** | Stat cards (enquiries today/tomorrow/pending, properties, deals), portal lead tiles, recent enquiries table |
| **Enquiries** | List with filter tabs (All / Today / Tomorrow / Pending), search, add, edit, detail view, activity comments, NFD tracking |
| **Properties** | List with Rent/Buy filter, search, add, edit, detail view with WhatsApp deep link |
| **Property Deals** | Deal list, add deal with payment installments, deal detail with payment progress |
| **Master Data** | Inline CRUD for Areas, Buildings, Property Types, Segments, BHK/Office, Budget ranges, Sources, Statuses, Activities, Furniture, Measurements, Non-Use Reasons, Draft Reasons |
| **Users** | Card-based user list, add user, edit user (personal info + work details + password) |
| **Approvals** | IP-based login approval for new device logins |
| **Settings** | API credential management for MagicBricks, 99Acres, and Housing.com portals |
| **Portal Leads** | Fetch and import leads from Housing.com (HMAC-signed), 99Acres (XML), MagicBricks (XML) |

---

## Tech Stack

```
Frontend:   Next.js 16 (App Router), React 19, TypeScript
Styling:    Tailwind CSS v4, Lucide React icons
Forms:      React Hook Form v7 + Zod v4 validation
HTTP:       Axios, Sonner (toasts)
Backend:    Next.js API Routes (route handlers)
ORM:        Prisma v5 with MySQL adapter
Auth:       NextAuth v5 (beta) with credentials provider
Database:   MySQL on Railway
Deploy:     Vercel (auto-deploy from GitHub main branch)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MySQL database (Railway, PlanetScale, or local)
- Git

### 1. Clone and install

```bash
git clone https://github.com/patelchiku/epms-next.git
cd epms-next
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
DATABASE_URL="mysql://user:password@host:port/dbname"
AUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

For production on Vercel, set these in Project → Settings → Environment Variables.

### 3. Run database migrations

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed the database (optional)

```bash
npm run seed
```

This creates:
- 3 users: Admin (`9999999999` / `Admin@123`), Agent1 (`9876543210` / `Agent@123`), Agent2 (`9876543211` / `Agent@123`)
- 10 Areas, 10 Buildings, 4 Property Types, 10 Segments, 8 BHK/Office options
- 13 Budget ranges, 10 Sources, 8 Enquiry Statuses, 6 Property Statuses, 9 Activities
- 4 Furniture types, 5 Measurement types, 7 Non-Use reasons, 5 Draft reasons
- 15 sample Enquiries with 8 comments, 8 Properties, 3 Deals with 5 payments

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/            # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/           # Dashboard with stat cards + portal tiles
│   │   ├── enquiries/           # List, add, [id] detail, [id]/edit
│   │   ├── properties/          # List, add, [id] detail, [id]/edit
│   │   ├── deals/               # List, add, [id] detail
│   │   ├── master/              # All master data pages (areas, buildings, etc.)
│   │   ├── users/               # List, add, [id]/edit
│   │   ├── approvals/           # IP approval list
│   │   └── settings/            # API credentials for portal integrations
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth handler
│       ├── enquiries/           # CRUD + comments sub-route
│       ├── properties/          # CRUD
│       ├── deals/               # CRUD with payments
│       ├── master/[resource]/   # Generic CRUD for all master tables
│       ├── users/               # CRUD
│       ├── approvals/           # IP approval management
│       ├── settings/            # API credential read/write
│       └── leads/               # magicbricks, housing, 99acres, count
├── components/
│   ├── layout/Header.tsx        # Page header with breadcrumbs + actions slot
│   ├── layout/Sidebar.tsx       # Navigation sidebar with Master submenu
│   ├── master/MasterPage.tsx    # Reusable inline CRUD for master data
│   └── ui/DataTable.tsx         # Generic paginated table
├── lib/
│   ├── auth.ts / auth.config.ts # NextAuth + IP approval callback
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # formatDate, parseMobiles, stringifyMobiles, cn
├── middleware.ts                 # Route protection
└── types/index.ts               # Shared TypeScript types
prisma/
├── schema.prisma                # Full database schema
└── seed.ts                      # Development seed data
```

---

## Database Models

| Model | Table | Purpose |
|---|---|---|
| `User` | `he_users` | Staff accounts |
| `Role` | `he_role` | Admin / Staff / Agent roles |
| `UserApproval` | `he_userapproval` | IP-based device approval records |
| `Enquiry` | `he_enquiry` | Client enquiries with NFD, status, draft/non-use flags |
| `EnquiryComment` | `he_enquirycomment` | Activity log on enquiries |
| `Property` | `he_property` | Property listings with full specs |
| `PropertyDeal` | `he_propertydeal` | Closed deals with buyer + owner info |
| `PropertyDealPayment` | `he_propertydealpayment` | Payment installments per deal |
| `Area` | `he_area` | Location master |
| `Building` | `he_building` | Building/society master |
| `PropertyType` | `he_propertytype` | Residential, Commercial, Office, etc. |
| `Segment` | `he_segment` | Flat, Shop, Godown, Penthouse, etc. |
| `BhkOffice` | `he_bhkoffice` | 1/2/3 BHK, Studio, Cabin, etc. |
| `Budget` | `he_budget` | Budget range labels |
| `Source` | `he_source` | Lead sources (MagicBricks, Walk-in, etc.) |
| `EnquiryStatus` | `he_enquirystatus` | Open, Close, Draft, Follow Up, etc. |
| `PropertyStatus` | `he_propertystatus` | Available, Rented, Sold, etc. |
| `Activity` | `he_activity` | Comment activity types |
| `ApiSetting` | `he_apisetting` | Portal API credentials |
| `HousingEnquiry` | `he_housingenquiry` | Leads imported from Housing.com |
| `AcresEnquiry` | `he_acresenquiry` | Leads imported from 99Acres |

---

## API Reference

### Authentication
All API routes require a valid NextAuth session. Unauthenticated requests return `401`.

### Enquiries — `/api/enquiries`

| Method | Params / Body | Description |
|---|---|---|
| GET | `page`, `pageSize`, `search`, `filter` (today/tomorrow/pending) | Paginated list |
| POST | `clientName`, `mobileNos[]`, `forType`, `propertyTypeId`, ... | Create enquiry |
| GET `/[id]` | — | Detail with comments |
| PUT `/[id]` | Same as POST | Update (Zod-validated, string→int coercion) |
| DELETE `/[id]` | — | Delete |
| POST `/[id]/comments` | `activityId`, `comment`, `nfd` | Add activity comment |

### Properties — `/api/properties`

| Method | Params / Body | Description |
|---|---|---|
| GET | `page`, `pageSize`, `search`, `forType` | Paginated list |
| POST | `ownerName`, `ownerMobile`, `forType`, `propertyTypeId`, ... | Create property |
| GET `/[id]` | — | Detail with all relations |
| PUT `/[id]` | Same as POST | Update (int coercion for all FK fields) |
| DELETE `/[id]` | — | Delete |

### Deals — `/api/deals`

| Method | Body | Description |
|---|---|---|
| GET | `page`, `pageSize` | List with employee + payment count |
| POST | `propertyName`, `ownerName`, `buyerName`, `dealAmount`, `payments[]` | Create with installments |
| GET `/[id]` | — | Detail with payments |
| PUT `/[id]` | Deal fields | Update |
| DELETE `/[id]` | — | Delete |

### Master Data — `/api/master/[resource]`

Generic CRUD. Resources: `areas`, `buildings`, `property-types`, `segments`, `bhk-office`, `budget`, `sources`, `statuses`, `activities`, `furniture`, `measurements`, `non-use`, `draft-reasons`, `roles`

### Portal Leads — `/api/leads/[portal]`

| Route | Description |
|---|---|
| `GET /api/leads/housing` | Fetch from Housing.com (HMAC-SHA256 signed) |
| `GET /api/leads/99acres` | Fetch from 99Acres (XML) |
| `GET /api/leads/magicbricks` | Fetch from MagicBricks (XML, IP-whitelisted) |
| `GET /api/leads/count` | Count of imported portal leads in DB |

---

## Authentication Flow

1. User visits any protected route → middleware redirects to `/login`
2. User submits mobile + password
3. NextAuth credentials provider verifies with bcrypt
4. On success, checks `he_userapproval` for the current IP
5. Unknown IP → redirect to approval-pending page
6. Admin approves from the Approvals dashboard
7. Subsequent logins from the same IP proceed without re-approval

---

## Portal Integrations

### MagicBricks
Fetches XML from `leads.magicbricks.com`. **Requires IP whitelisting by MagicBricks.** Vercel's shared dynamic IPs are not whitelisted — the API returns "Access Denied" until a static IP is configured.

### 99Acres
Fetches XML from the configured URL using HTTP basic auth. Parsed with `fast-xml-parser`.

### Housing.com
Calls the Housing.com Builder API. The API Key is used as the HMAC-SHA256 secret to sign the Unix timestamp sent in the `X-TS` request header.

---

## Deployment

### Vercel

The repo is linked to Vercel. Every push to `main` triggers a build (~45s).

**Required Vercel env vars:**
```
DATABASE_URL      # Railway MySQL URL
AUTH_SECRET       # Random 32+ char string
NEXTAUTH_URL      # https://epms-next.vercel.app
```

### Railway (MySQL)

Production database. Schema is managed via `prisma db push` (no migration files).

---

## Known Limitations

1. **MagicBricks IP whitelist** — Vercel's dynamic IPs cannot be whitelisted by MagicBricks. Needs a static egress IP or proxy.
2. **Deal amount is free-text** — `dealAmount` and payment `amount` are stored as plain strings (e.g. "1.2 Cr", "2,40,000"). Numeric calculations strip commas and fall back to zero for non-numeric values.
3. **No file uploads** — Profile pictures and property images are not implemented.
4. **Single-tenant** — Designed for one agency. No multi-tenancy.

---

## License

Private — Top Space Property Management. All rights reserved.
