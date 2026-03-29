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
```

## Architecture

### Auth Flow
Supabase Auth handles authentication. The middleware at `src/middleware.ts` calls `updateSession()` on every request to refresh the session cookie, redirect unauthenticated users away from `/dashboard/*`, and redirect authenticated users away from `/login` and `/register`.

The app maintains two parallel user records:
- **Supabase `auth.users`** — managed by Supabase, stores credentials
- **Prisma `users` + `profiles`** — app-level data, created on register in `src/services/auth.ts`

The `User.id` in Prisma matches `auth.users.id` from Supabase (UUID).

### Data Access Pattern
All DB access goes through `src/services/`. Server Actions in `src/services/auth.ts` handle login/register/logout. `src/services/user.ts` exports `getCurrentUser()` (cached with React `cache()`) which fetches from both Supabase auth and Prisma.

Prisma v7 requires a driver adapter — `src/lib/prisma.ts` uses `PrismaPg` from `@prisma/adapter-pg`. The singleton pattern prevents multiple client instances during hot reload.

### Prisma Client Location
Generated client is at `src/generated/prisma/client` (not the default `@prisma/client`). Always import from `@/generated/prisma/client`:
```ts
import { PrismaClient } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/client";
```

### RBAC
Role filtering happens entirely in the frontend sidebar (`src/components/shared/app-sidebar.tsx`) by filtering `navItems` from `src/lib/navigation.ts` against `user.role`. Roles: `Admin`, `Profesional`, `Recepcion`. Server-side route protection is only by authentication (logged in / not logged in) — per-route role protection must be added per module.

### UI System
- **Shadcn/UI** style: `base-nova` (uses `@base-ui/react` primitives, not Radix UI — `asChild` prop does not exist, use `render` prop instead)
- **Radius**: forced to `0` globally via `--radius: 0rem` and `border-radius: 0 !important` on `*`
- **3D buttons**: `.btn-bevel` class in `globals.css` applied automatically via `buttonVariants` base. Ghost and link variants suppress it.
- **Theme**: CSS variables in `globals.css` using oklch. Sidebar has separate `--sidebar-*` variables — light mode uses white/light values, dark mode uses near-black.
- **Dark/light mode**: `next-themes` with `attribute="class"`, toggled via `src/components/shared/theme-toggle.tsx`

### Route Groups
- `(auth)` — unauthenticated pages, centered card layout
- `(dashboard)` — protected pages, full sidebar+navbar shell, fetches `getCurrentUser()` in layout
