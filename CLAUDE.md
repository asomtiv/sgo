# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This project uses **Next.js 16.2.1** — a version with breaking changes from what you may know. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices. Key differences:
- `src/middleware.ts` is deprecated in favor of `src/proxy.ts` (a warning appears but still works)
- Type imports: use `import type { Metadata } from "next"` (not `"next/types"`)
- Turbopack is the default bundler

## Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build (also runs TypeScript check)
npm run lint       # ESLint
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db push           # Push schema to Supabase (no migration files)
npx prisma migrate dev       # Create migration + push (generates SQL history)
npx prisma db seed            # Run seed script (specialities, provincias, obras sociales)
```

## Tech Stack

- **Framework**: Next.js 16.2.1, React 19.2.4, TypeScript 5
- **Database**: PostgreSQL via Supabase, accessed through Prisma 7 with `PrismaPg` adapter
- **Auth**: Supabase Auth (`@supabase/ssr` for SSR cookie handling)
- **Dates**: `date-fns` for date manipulation and validation
- **Validation**: Zod v4 (`import { z } from "zod/v4"` — NOT v3)
- **UI**: Shadcn/UI `base-nova` style (uses `@base-ui/react`, NOT Radix UI), Tailwind CSS v4, Lucide icons
- **Toasts**: `sonner`
- **Dark mode**: `next-themes` with `attribute="class"`

## Architecture

### Auth Flow
Supabase Auth handles authentication. The middleware at `src/middleware.ts` calls `updateSession()` on every request to refresh the session cookie, redirect unauthenticated users away from `/dashboard/*`, and redirect authenticated users away from `/login` and `/register`.

The app maintains **two parallel user records** — both must exist for the app to work:
- **Supabase `auth.users`** — managed by Supabase, stores credentials
- **Prisma `users` + `profiles`** — app-level data, created on register in `src/services/auth.ts`

The `User.id` in Prisma matches `auth.users.id` from Supabase (UUID). If one exists without the other, the dashboard layout redirect loop occurs (middleware sees a session, but `getCurrentUser()` returns `null` because the Prisma record is missing).

### Data Access Pattern
All DB access goes through `src/services/`. Server Actions in `src/services/auth.ts` handle login/register/logout. `src/services/user.ts` exports `getCurrentUser()` (cached with React `cache()`) which fetches from both Supabase auth and Prisma.

Services return `{ error: string }` or `{ success: true }` and call `revalidatePath()` after mutations.

**Service files:**
- `src/services/auth.ts` — login, register, logout, forgotPassword, updatePassword
- `src/services/user.ts` — getCurrentUser, getAllUsers, createUser, updateUserRole, updateUserProfile, deleteUser, toggleUserActive, adminResetPassword
- `src/services/patient.ts` — getAllPatients (with search), createPatient, updatePatient, deletePatient
- `src/services/professional.ts` — getAllProfessionals, getAvailableUsersForProfessional, createProfessional, updateProfessional, toggleProfessionalActive
- `src/services/availability.ts` — getProfessionalAvailability, createAvailability, deleteAvailability, updateSlotDuration, createLeave, deleteLeave
- `src/services/availability-check.ts` — checkProfessionalAvailability (verification engine for Agenda module)
- `src/services/appointment.ts` — getAgendaData, searchPatients, createAppointment, updateAppointmentStatus, rescheduleAppointment
- `src/services/data.ts` — getAllSpecialities, getAllProvincias, getAllObrasSociales

### Prisma Setup
Prisma v7 requires a driver adapter — `src/lib/prisma.ts` uses `PrismaPg` from `@prisma/adapter-pg` with a singleton pattern to prevent multiple client instances during hot reload. Connection URLs are configured in `prisma.config.ts` (NOT in `schema.prisma` — Prisma 7 removed `url`/`directUrl` from schema files).

### Prisma Client Location
Generated client is at `src/generated/prisma/client` (not the default `@prisma/client`). Always import from `@/generated/prisma/client`:
```ts
import { PrismaClient } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/client";
```

### Database Schema
10 models: `User`, `Profile`, `Speciality`, `Professional`, `Availability`, `Leave`, `Appointment`, `Provincia`, `ObraSocial`, `Patient`.
- All use UUID primary keys
- `User` ↔ `Profile` (one-to-one, cascade delete)
- `User` ↔ `Professional` (one-to-one, cascade delete)
- `Professional` → `Speciality` (many-to-one)
- `Professional` ↔ `Availability` (one-to-many, cascade delete) — recurring weekly time blocks
- `Professional` ↔ `Leave` (one-to-many, cascade delete) — date-range absences
- `Professional` ↔ `Appointment` (one-to-many, cascade delete)
- `Patient` ↔ `Appointment` (one-to-many, restrict delete — must cancel appointments first)
- `Patient` → `Provincia`, `ObraSocial` (optional many-to-one)
- Enums: `Role` (Admin, Profesional, Recepcion), `TipoAusencia` (Vacaciones, Enfermedad, Personal, Congreso, Otro), `EstadoTurno` (Pendiente, Confirmado, Cancelado, Completado, Ausente)
- `Professional.slotDuration` (Int, default 30) — appointment duration in minutes

### RBAC
Role filtering happens in the frontend sidebar (`src/components/shared/app-sidebar.tsx`) by filtering `navItems` from `src/lib/navigation.ts` against `user.role`.

**Navigation access by role:**
| Route | Admin | Profesional | Recepcion |
|-------|-------|-------------|-----------|
| Dashboard | yes | yes | yes |
| Agenda | yes | yes | yes |
| Pacientes | yes | yes | yes |
| Profesionales | yes | no | yes |
| Insumos | yes | no | no |
| Usuarios | yes | no | no |

Server-side role checks exist in page.tsx for `/dashboard/usuarios` and `/dashboard/profesionales` only. No middleware-level role enforcement — per-route role protection must be added per module.

### UI System
- **Shadcn/UI** style: `base-nova` (uses `@base-ui/react` primitives, not Radix UI — `asChild` prop does not exist, use `render` prop instead)
- **Radius**: forced to `0` globally via `--radius: 0rem` and `border-radius: 0 !important` on `*`
- **3D buttons**: `.btn-bevel` class in `globals.css` applied automatically via `buttonVariants` base. Ghost and link variants suppress it.
- **Theme**: CSS variables in `globals.css` using oklch. Sidebar has separate `--sidebar-*` variables — light mode uses white/light values, dark mode uses near-black.
- **Dark/light mode**: `next-themes` with `attribute="class"`, toggled via `src/components/shared/theme-toggle.tsx`

### Route Groups
- `(auth)` — unauthenticated pages (login, register, forgot-password, update-password), centered card layout
- `(dashboard)` — protected pages, full sidebar+navbar shell, fetches `getCurrentUser()` in layout and redirects to `/login` if null

### Supabase Clients
- `src/lib/supabase/client.ts` — browser client (`createBrowserClient` with anon key)
- `src/lib/supabase/server.ts` — server client (`createServerClient` with cookie handling)
- `src/lib/supabase/admin.ts` — admin client (`getSupabaseAdmin()`, lazy singleton using `SUPABASE_SERVICE_ROLE_KEY`). Used server-side only for admin operations (`auth.admin.createUser`, `auth.admin.updateUserById`, `auth.admin.deleteUser`). Always call the function, never instantiate at module level.
- `src/lib/supabase/middleware.ts` — session refresh + route protection logic

### Auth Callback
`src/app/auth/callback/route.ts` handles OAuth/magic-link callbacks. Exchanges code for session and redirects to `next` param or `/dashboard`.

### Validation
All input validation uses Zod v4 schemas in `src/types/schemas.ts`. Key formats:
- Phone: `^\d{3}-\d{3}-\d{4}$` (123-456-7890)
- DNI: `^\d{7,8}$` (Argentine national ID)
- Password: min 6 characters
- Types exported: `LoginInput`, `RegisterInput`, `CreateUserInput`, `CreatePatientInput`, etc.

### Custom Types
`src/types/index.ts` defines composite types: `UserWithProfile`, `PatientWithProvincia`, `ProfessionalWithDetails`, `AvailabilityBlock`, `LeaveRecord`, `ProfessionalAvailabilityData`, `AppointmentWithDetails`, `AgendaProfessional`, `AgendaDayData`, `PatientSearchResult`.

### Constants
`src/lib/constants.ts` defines: `DAYS_OF_WEEK`, `WORK_DAYS`, `LEAVE_TYPE_LABELS`, `SLOT_DURATION_OPTIONS`, `APPOINTMENT_STATUS_LABELS`, `APPOINTMENT_STATUS_COLORS`, `GRID_BASE_INTERVAL`.

### Timezone Helpers
`src/lib/timezone.ts` provides Argentina timezone utilities: `toArgentinaTime`, `extractTime`, `extractDayOfWeek`, `todayInArgentina`, `dayStartEnd`. Used by both `availability-check.ts` and `appointment.ts`.

### @base-ui/react API Notes
- **DropdownMenuItem**: use `onClick` (not `onSelect` — that prop doesn't exist). Add `closeOnClick` to close the menu on click.
- **Select**: accepts `name` prop and renders a hidden input for form submission. Use `defaultValue` for uncontrolled or `value`+`onValueChange` for controlled.
- **Dialog/Trigger with render prop**: `<DialogTrigger render={<Button />}>children</DialogTrigger>` — children are forwarded into the rendered element.

### Confirmations — Never use `window.confirm()`
Always use a custom `Dialog`-based confirmation. Pattern used in `src/app/(dashboard)/dashboard/usuarios/users-table.tsx`:
- Separate `confirmOpen` + `confirmUser` state
- `Dialog` with `DialogHeader`, `DialogDescription` describing the action and its consequences
- Two buttons: `variant="outline"` to cancel, `variant="destructive"` (or `"default"`) to confirm
- Loading state (`disabled` + label change) while the async action runs

## Environment Variables

Required in `.env` (already in `.gitignore`):
```
DATABASE_URL          # Supabase pooled connection (port 6543, ?pgbouncer=true)
DIRECT_URL            # Supabase direct connection (port 5432, used for migrations)
NEXT_PUBLIC_SUPABASE_URL       # https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role key (server-side only)
NEXT_PUBLIC_SITE_URL           # Base URL for password reset emails (default: http://localhost:3000)
```

## Current Status

**Implemented modules:**
- Auth (login, register, logout, forgot/reset password)
- Usuarios (CRUD, role management, activate/deactivate, admin password reset)
- Pacientes (CRUD with search by DNI/name)
- Profesionales (CRUD, link to user with Profesional role)
- Disponibilidad y Ausencias (availability blocks per day, leaves, slot duration, verification engine)

- Agenda (calendar grid with appointment CRUD, reschedule, status management, patient search combobox, role-based filtering)

**Stub modules (not yet implemented):**
- Dashboard stats (page exists, shows placeholder "—" values)
- Insumos (empty page)
