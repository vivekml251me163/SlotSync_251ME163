# SlotSync - Campus Infrastructure Booking System

SlotSync is a campus booking platform for managing facility reservations, approval workflows, availability visibility, and waitlist handling across departments and roles.

## Project Demo

### Video Recording


[DEMO VIDEO : https://drive.google.com/file/d/1SIOGsORwtDpHwsvF3CJ-WYtP6xT9K0ro/view?usp=sharing](https://drive.google.com/file/d/1SIOGsORwtDpHwsvF3CJ-WYtP6xT9K0ro/view?usp=sharing)

### Screenshots


| Screen | Image |
| --- | --- |
| Login | <img width="1899" height="1029" alt="image" src="https://github.com/user-attachments/assets/d8bd8c64-f0e3-4fb3-9a12-b7e32d1e3a44" />|
| Faculty booking flow | <img width="1899" height="1029" alt="image" src="https://github.com/user-attachments/assets/c7afa82b-eca6-42c9-9aa3-3a2cdcf69d91" />|
| Admin analytics | <img width="1904" height="1032" alt="image" src="https://github.com/user-attachments/assets/43deb9a9-3323-4cd9-9b17-8943df64c6b3" />|

## Features

- Role-based access control for `ADMIN`, `FACULTY`, `CONVENOR`, and `STUDENT`.
- Facility management for auditoriums, labs, classrooms, seminar halls, and sports complexes.
- Availability calendar and slot browsing for quick booking decisions.
- Booking approval, rejection, cancellation, and waitlist handling.
- Auth.js-powered authentication and route protection.
- Drizzle ORM-backed persistence with background workflows through Inngest and notifications through Resend.

## Architecture

### High-Level Flow

1. The user authenticates through the auth routes in `app/(auth)/`.
2. Role checks and route protection are enforced through `proxy.ts` and server-side permission helpers.
3. Dashboard experiences are split by role under `app/(dashboard)/`.
4. UI actions are composed from feature components in `components/`.
5. API routes in `app/api/` handle bookings, facilities, availability, analytics, waitlist, auth callbacks, and event ingestion.
6. Data access and schema logic live in `lib/db/` and `drizzle/`.

### Folder Mapping

```text
slotsync/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout wrapper
│   ├── page.tsx                  # Home page
│   ├── globals.css                # Global styles
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Role-based dashboard routes
│   │   ├── admin/
│   │   ├── faculty/
│   │   └── student/
│   └── api/                      # API routes
│       ├── auth/
│       ├── analytics/
│       ├── availability/
│       ├── bookings/
│       ├── facilities/
│       ├── inngest/
│       └── waitlist/
├── components/                   # React components
│   ├── admin/                    # Admin UI building blocks
│   ├── auth/                     # Authentication UI
│   ├── booking-form/             # Booking and facility forms
│   ├── dashboard/                # Shared dashboard shell
│   ├── slot-grid/                # Slot selection dialogs
│   ├── student/                  # Student-specific components
│   └── ui/                       # Reusable UI primitives
├── hooks/                        # Shared React hooks
├── lib/                          # Utility functions and configs
│   ├── auth.ts                   # Authentication helpers
│   ├── db/                       # Database connection and schema helpers
│   ├── email/                    # Email templates and transport
│   ├── inngest/                  # Background jobs and event clients
│   ├── permissions.ts            # Role and permission logic
│   └── validations/              # Zod schemas and form validation
├── drizzle/                      # Database migrations and seed data
├── public/                       # Static assets
├── types/                        # Shared TypeScript declarations
├── proxy.ts                      # Route protection and middleware logic
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── drizzle.config.ts             # Drizzle CLI configuration
├── package.json                  # Scripts and dependencies
└── README.md                     # Project documentation
```

The tree above shows the main structure only. Deeper leaf nodes can be added later if the documentation needs to cover a specific feature area in more detail.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Auth.js / NextAuth beta
- Inngest
- Resend
- shadcn/ui and Radix UI primitives

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd slotsync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file and set the following values:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - secret used for session encryption
- `NEXTAUTH_URL` - canonical application URL, for example `http://localhost:3000`
- `RESEND_API_KEY` - Resend API key for transactional email
- `INNGEST_EVENT_KEY` - Inngest event key
- `INNGEST_SIGNING_KEY` - Inngest signing key

### 4. Prepare the database

Generate schema output and run the migrations:

```bash
npm run db:generate
npm run db:migrate
```

Optional seed step:

```bash
npm run db:seed
```

## Usage

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

### Database studio

```bash
npm run db:studio
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply migrations using the migration runner |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:studio` | Open Drizzle Studio |

## Good Practices Followed

- Components and routes are separated by responsibility to keep the codebase maintainable.
- Shared logic lives in `lib/` instead of being duplicated across pages.
- Validation is centralized with Zod schemas.
- Database changes are handled through Drizzle migrations rather than ad hoc SQL.
- Role-aware routing keeps access control aligned with the user experience.

## References

The following official sources were used while building and documenting this project:

- Next.js Documentation: https://nextjs.org/docs
- Auth.js Documentation: https://authjs.dev
- Drizzle ORM Documentation: https://orm.drizzle.team
- shadcn/ui Documentation: https://ui.shadcn.com
- Tailwind CSS Documentation: https://tailwindcss.com
- Inngest Documentation: https://www.inngest.com/docs
- Resend Documentation: https://resend.com/docs

If you refer to external tutorials, starter kits, or open-source repositories in future updates, add the project link, maintainer name, and GitHub star count here for proper attribution.
