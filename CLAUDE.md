# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

dcr-builder is a web tool for generating Azure Data Collection Rules (DCRs). Users can provide JSON input directly (paste/upload) or specify an API endpoint that returns JSON. The app analyzes the JSON structure and generates a valid DCR configuration from it.

## DCR Domain Knowledge

A DCR for the Logs Ingestion API (the primary use case for this tool) has `kind: "Direct"` and this structure inside `properties`:

- **streamDeclarations** — defines the schema of incoming data. Stream names must start with `Custom-`. Each stream has `columns` with `name` and `type` (`string`, `int`, `long`, `real`, `boolean`, `dynamic`, `datetime`).
- **destinations** — where data is sent (typically `logAnalytics` with `workspaceResourceId` and `name`).
- **dataFlows** — connects streams to destinations. Each flow has `streams`, `destinations`, `transformKql` (KQL transformation, use `"source"` for passthrough), and `outputStream` (`Custom-<TableName>_CL` for custom tables, `Microsoft-<TableName>` for standard).

The core job of this app is to infer `streamDeclarations` columns from a JSON sample: mapping JSON types to DCR types (string→string, number→real/int/long, boolean→boolean, object/array→dynamic, ISO date strings→datetime).

Reference: https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure

## Commands

```bash
npm run dev        # Dev server (port 3000)
npm run build      # Production build
npm run test       # Vitest (run mode, no watch)
npm run lint       # ESLint
npm run format     # Prettier check (read-only)
npm run check      # Prettier write + ESLint fix
```

## Tech Stack

TanStack Start (full-stack SSR) with React 19, TypeScript, Tailwind CSS v4, Shadcn/ui (New York style, zinc base), TanStack Router (file-based routing), TanStack Query v5, TanStack Form, TanStack Table v8, Zod v4, Vitest + @testing-library/react.

## Architecture

### Routing

File-based routing via TanStack Router. Routes live in `src/routes/`. The route tree is auto-generated at build time. Dots in filenames encode nested path segments (e.g., `form.simple.tsx` → `/demo/form/simple`). The root route (`__root.tsx`) owns the full HTML document shell and injects a `QueryClient` into every route's context.

Router config: scroll restoration enabled, preload on intent, always re-fetch on preload.

### Data Fetching

`QueryClient` is created via `getContext()` in `src/integrations/tanstack-query/root-provider.tsx` and shared through router context. Route loaders and client components share the same query client instance for SSR hydration.

### Forms

Uses TanStack Form's "app form" pattern:

- `src/hooks/demo.form-context.ts` — creates form contexts via `createFormHookContexts()`
- `src/hooks/demo.form.ts` — creates `useAppForm` hook via `createFormHook()` binding field components to type-safe form state
- Field components in `src/components/demo.FormComponents.tsx` consume context via `useFieldContext<T>()`

### UI Components

Shadcn components live in `src/components/ui/` and are project-owned (not a dependency). Add new ones with:

```bash
pnpm dlx shadcn@latest add <component>
```

Components use the unified `radix-ui` package (not individual `@radix-ui/*` packages).

### Styling

Tailwind v4 in CSS-first config mode — no `tailwind.config.js`. All customization is in `src/styles.css` using `@theme inline` blocks with `oklch` color values. Dark mode via `.dark` class.

### Path Aliases

`@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Code Style

- No semicolons, single quotes, trailing commas (Prettier config)
- ESLint uses `@tanstack/eslint-config`
- Files prefixed with `demo` are scaffolding and can be safely deleted/replaced
