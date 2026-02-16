# Contributing to DCR Builder

Thanks for your interest in contributing! This document covers the conventions and workflow for this project.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Development Workflow

### Commands

```bash
npm run dev        # Dev server
npm run build      # Production build
npm run test       # Run tests (Vitest, no watch)
npm run lint       # ESLint check
npm run format     # Prettier check (read-only)
npm run check      # Prettier write + ESLint fix
```

### Before Submitting a PR

1. Run `npm run check` to fix formatting and lint issues
2. Run `npm run test` to ensure all tests pass
3. Run `npm run build` to verify the production build succeeds

## Code Style

- **No semicolons**, single quotes, trailing commas (enforced by Prettier)
- ESLint uses `@tanstack/eslint-config`
- Path alias: `@/` maps to `src/`

## Architecture

### Routing

File-based routing via TanStack Router. Routes live in `src/routes/`. The route tree is auto-generated at build time.

### State Management

The app uses React Context + `useReducer` (in `src/store/`) for DCR builder state. The provider wraps the main page, not the root layout.

Key state includes: source JSON, DCR form data, generated output, validation errors, and UI state (active tab, mobile section).

### Styling

Tailwind CSS v4 with CSS-first configuration. All design tokens are defined in `src/styles.css` using `@theme inline` blocks with `oklch` color values. The color palette uses an indigo/violet family.

Dark mode is toggled via the `.dark` class on `<html>`, managed by `src/hooks/use-theme.ts`.

### Component Structure

```
src/components/
├── editor/      # DCR form editor, JSON viewer, deployment instructions
├── source/      # JSON source input, fetch controls, origin badge
├── layout/      # TopBar, BuilderLayout, PanePanel, MobileSectionToggle
└── ui/          # Shadcn components (project-owned, not a dependency)
```

- **`PanePanel`** is the reusable panel wrapper with rounded borders and a sticky header
- **`JsonEditor`** is a custom textarea with line numbers (no external editor dependency)
- Shadcn components use the unified `radix-ui` package

### DCR Utilities

Core logic lives in `src/lib/dcr-utils.ts`:

- `inferColumnsFromJson()` — maps JSON values to DCR column types
- `generateDcr()` — builds the full DCR JSON from form data
- `validateDcr()` — checks required fields and references
- `generateArmTemplate()` / `generateBicep()` — alternative output formats

### Adding Shadcn Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are added to `src/components/ui/` and become part of the project source.

## DCR Domain Reference

If you're unfamiliar with Azure Data Collection Rules, the key concepts are:

- **Stream declarations** define the schema of incoming data (column names and types)
- **Destinations** specify where data goes (Log Analytics workspaces)
- **Data flows** connect streams to destinations with optional KQL transformations
- Stream names must start with `Custom-`
- Column types: `string`, `int`, `long`, `real`, `boolean`, `dynamic`, `datetime`

Full reference: [Data Collection Rule Structure](https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure)
