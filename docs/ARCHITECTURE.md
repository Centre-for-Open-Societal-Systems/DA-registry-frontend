# Architecture: what goes where

The import rules below are enforced by `eslint-plugin-boundaries` (see `eslint.config.mjs`), so `npm run lint` fails on a violation.

## Folders

| Folder | Holds | May import |
| --- | --- | --- |
| `src/app/` | Routes only: `page.tsx`, `layout.tsx`, `loading.tsx`, plus a `components/` folder next to a page for UI used by that route alone. | everything below |
| `src/features/<name>/` | One business domain (farmers, visits, agents, grievances…): its types, data access (mock `data.ts` today, API calls later), domain logic, and components reused by more than one route. | other features (via their `index.ts`), `components`, `store`, `contexts`, `lib` |
| `src/components/` | App-wide building blocks with no domain knowledge: `ui/` (Button, Modal, DataTable, BackLink…), `layout/` (Sidebar, Header), `auth/` (AuthGuard). | `components`, `store`, `contexts`, `lib` |
| `src/store/` | Global client state (Zustand). | `lib` |
| `src/contexts/` | Scoped React context providers. | `lib` |
| `src/lib/` | Framework-free helpers: `rbac`, `drafts`, `download`, `search`, `utils`. | `lib` only |

Imports flow one way: `app → features → components / store / contexts → lib`. Nothing imports from `app/`.

## Features have a public API

Each feature has an `index.ts` that re-exports what the rest of the app may use. Outside the feature, always import `@/features/<name>`, never a file inside it:

```ts
import { FarmerAvatar, getFarmer } from "@/features/farmers";      // ✅
import { getFarmer } from "@/features/farmers/data";                // ❌ lint error
```

Inside a feature, files import each other with relative paths (`./data`, `../types`), never through their own `index.ts`, which would create a cycle.

**Where does a new component go?** If only one route uses it, put it in `components/` next to that route's `page.tsx`. When a second route needs it, move it into the owning feature's `components/` and export it from the feature's `index.ts`. If it knows nothing about any domain (no farmers, agents, visits…), it belongs in `src/components/ui/`.

## Server and client components

Pages and layouts are server components. Put `"use client"` only on the component that actually needs it (hooks, event handlers, browser APIs, `useAuthStore`), as deep in the tree as possible. A component with no hooks or handlers needs no directive and works on either side.

## Styling

Colors come from theme tokens in `src/app/globals.css` (`@theme`): `text-ink`, `text-ink-soft`, `text-muted`, `text-subtle`, `bg-surface`, `border-line`, `border-line-soft`, `text-danger`, `bg-brand-tint`, `bg-brand-green`, … Never write a hex value in a class (`text-[#1a2b3c]`). A new color gets a named token in `@theme` first.

## Personal data in the browser

Form drafts (farmer registration, KPI entry, issues, visit outcomes) go through `src/lib/drafts.ts`. That module uses `sessionStorage` and is wiped on sign-out. Don't write personal data to `localStorage`. The persisted auth store holds only identity and role.

## State management: decision pending

This project uses Zustand (`src/store/useAuthStore.ts`, the only global store today). Other OAN projects use Redux Toolkit. Before code is shared between projects, the team should agree on one library. Until then, keep global state minimal and in `src/store/` so a switch touches one folder.

## Checks

`npm run check` runs lint, typecheck and unit tests. CI (`.github/workflows/ci.yml`) runs those plus `npm run build` on every PR. Unit tests live next to the code as `*.test.ts` (Vitest).
