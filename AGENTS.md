# AGENTS

This repository is a Next.js App Router project using TypeScript, Clerk authentication, Supabase, Tailwind CSS, and Jest.

## Key commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run type-check`
- `npm test`
- `npm run test:watch`

## Architecture
- `app/` contains the main UI and App Router pages.
- `(auth)` and `(dashboard)` are Next.js segment groups.
- `app/api/` contains route handlers for project CRUD, API keys, test connection, health, and Clerk webhooks.
- `lib/` contains shared helpers for Clerk and Supabase clients.
- `supabase/schema.sql` defines the database schema.

## Configuration conventions
This repository does not currently include a top-level `config.json` file.
Configuration is managed through existing repo config files:
- `next.config.js` — Next.js runtime settings
- `tailwind.config.ts` — Tailwind CSS content paths and theme
- `tsconfig.json` — TypeScript compiler options and `@/*` path alias
- `jest.config.js` — Jest test configuration
- `package.json` — scripts and dependencies

If a new configuration file is needed, prefer extending the existing config files instead of introducing `config.json` unless the project explicitly requires it.

## Environment variables
Use environment files such as `.env.local` and `.env.example`.
Important variables include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_WEBHOOK_SECRET`

## Agent guidance
- Use `@/` import paths from `tsconfig.json`.
- Keep new features aligned with the App Router structure.
- Prefer small changes in `app/api/*` and `lib/*` for backend behavior.
- Do not modify production secrets or commit environment values.
- Do not create a root `config.json` file unless it is explicitly part of the project requirements.
