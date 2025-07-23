# Copilot Instructions for AI Coding Agents

## Project Overview
- **Framework:** Next.js (App Router)
- **UI Library:** shadcn/ui (Radix + Tailwind)
- **Auth/Data:** Supabase, Google OAuth
- **Deployment:** Cloudflare Workers via OpenNext

## Directory Structure & Conventions
- `src/app/`: Next.js app router pages, layouts, API routes
  - `dashboard/`: Main dashboard page and data
  - `api/`: Backend API routes (currently empty)
- `src/components/`: Shared React components
  - `ui/`: shadcn/ui primitives and custom UI
- `src/features/`: Feature modules (google-sheets, oauth, supabase)
- `src/hooks/`: Custom React hooks
- `src/lib/`: Service modules (googleDrive, googleOAuth, utils)
- `public/`: Static assets
- `scripts/`: Utility scripts

## Coding Standards
- Use TypeScript for all source files
- Prefer functional React components
- Use shadcn/ui and Radix primitives for UI
- Use custom hooks for logic reuse
- Organize feature code in `src/features/`
- Place API routes in `src/app/api/`
- Use environment variables for secrets (`.env.local`)
- Follow Next.js file-based routing conventions

## Integration Points
- **Google OAuth:** via `src/lib/googleOAuth.ts` and `src/app/api/oauth/`
- **Supabase:** via `src/features/supabase/` and `src/lib/services/`
- **UI:** via `src/components/ui/` and shadcn/ui

## Workflow Guidance
- Add new pages to `src/app/`
- Add new API routes to `src/app/api/`
- Add new features to `src/features/`
- Add shared components to `src/components/`
- Add custom hooks to `src/hooks/`
- Add service modules to `src/lib/`

## Best Practices
- Keep code modular and maintainable
- Avoid placing business logic in UI components
- Use feature folders for domain logic
- Keep API routes stateless and secure
- Document new features and modules

## Onboarding Checklist for AI Agents
- Review `README.md` for setup and deployment
- Follow directory and coding conventions above
- Reference this file for architecture and workflow
- Ensure new code matches project standards
- Update this file if conventions change
