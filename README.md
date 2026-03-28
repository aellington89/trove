# Trove

A cross-platform desktop application for tracking your personal media library — books, music, movies, TV, games, and custom types.

Built with Electron, React, TypeScript, and SQLite. Local-first, no accounts, no cloud dependency.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Electron |
| Frontend | React 19 + TypeScript |
| Bundler | Vite (via electron-vite) |
| Styling | Tailwind CSS v4 + CSS Modules |
| State | Zustand |
| Database | SQLite (via better-sqlite3) |
| Icons | lucide-react |
| Typography | Syne (display) + DM Sans (body) |
| Packaging | electron-builder |

## Project Structure

```
src/
├── shared/                        # Shared TypeScript interfaces (main + renderer)
│   └── types.ts                   # Item, MediaType, IPC result types, filters
├── main/                          # Electron main process (Node.js)
│   ├── index.ts                   # Window management, app lifecycle, handler registration
│   ├── ipc/
│   │   └── handlers.ts            # IPC channel registration (7 CRUD + count handlers)
│   └── database/
│       ├── index.ts               # setupDatabase() orchestrator
│       ├── connection.ts          # Singleton DB connection, path helpers
│       ├── migrate.ts             # Migration runner and rollback system
│       ├── migrations/
│       │   ├── index.ts           # Migration registry (allMigrations[])
│       │   ├── 001_create_items.ts        # Items table schema + indexes
│       │   └── 002_create_media_types.ts  # Media types table schema
│       ├── repositories/
│       │   ├── items.ts           # Item CRUD + countItemsByType operations
│       │   └── media-types.ts     # Media type queries
│       ├── seeds/
│       │   └── media-types.ts     # 5 built-in media type definitions + seeder
│       └── __tests__/
│           └── database.test.ts   # Database integration tests
├── preload/                       # Secure bridge between main and renderer
│   ├── index.ts                   # contextBridge API exposed to renderer
│   └── index.d.ts                 # Type declarations for window.trove
└── renderer/                      # React SPA (Chromium)
    ├── index.html                 # HTML entry point
    ├── assets/
    │   └── fonts/                 # Syne + DM Sans (local, no CDN)
    └── src/
        ├── main.tsx               # React entry point + store initialization
        ├── App.tsx                # Root component (renders AppShell)
        ├── app.css                # Tailwind imports, CSS custom properties, font faces
        ├── hooks/
        │   └── useMediaQuery.ts   # Responsive breakpoint hook (matchMedia API)
        ├── components/
        │   └── layout/
        │       ├── AppShell.tsx       # Root layout: sidebar + main column
        │       ├── Sidebar.tsx        # Collapsible sidebar with media type navigation
        │       ├── SidebarItem.tsx    # Single sidebar row (icon + label + count)
        │       ├── TopBar.tsx         # Search, view toggles, sort, add, theme
        │       ├── ViewToggle.tsx     # Grid/list/table icon button group
        │       ├── SortDropdown.tsx   # Sort field + direction dropdown
        │       ├── MainContent.tsx    # Scrollable content host + empty/loading states
        │       └── Sidebar.module.css # Sidebar collapse/expand animation
        ├── lib/
        │   └── trove-api.ts       # Typed renderer API wrapper (IPC client)
        └── stores/
            ├── index.ts           # Barrel export for all stores + subscriptions
            ├── items-store.ts     # Items CRUD state + item counts + actions
            ├── media-types-store.ts # Media type list state + lookup helper
            ├── ui-store.ts        # View, filter, sort, search, sidebar state
            └── subscriptions.ts   # Cross-store wiring (filter changes → refetch)
```

Build output goes to `out/` (Vite bundles) and `dist/` (packaged binaries). Database is stored at `{userData}/library.trove` with a sibling `/covers` directory for cover art.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```sh
npm install
```

`npm install` automatically rebuilds `better-sqlite3` against Electron's Node.js headers via the `postinstall` script.

> **Native module note:** `better-sqlite3` is always compiled for Electron's Node.js ABI. Test scripts use `ELECTRON_RUN_AS_NODE=1` to run Vitest under Electron's Node.js runtime (in plain Node mode, no Chromium), so the same binary works for both `npm run dev` and `npm run test`. If you ever see a `NODE_MODULE_VERSION` mismatch error, run:
>
> ```sh
> npx electron-rebuild -f -w better-sqlite3
> ```

### Development

```sh
npm run dev
```

Launches Electron with Vite HMR for the renderer. Main process rebuilds automatically on change.

### Build

```sh
npm run build          # Vite build only (out/)
npm run package        # Build + package for current platform (dist/)
npm run package:win    # Package for Windows (.exe)
npm run package:mac    # Package for macOS (.dmg)
npm run package:linux  # Package for Linux (.AppImage, .deb)
```

Note: `package:mac` requires macOS. `package:win` requires Windows (or Wine on Linux).

### Code Quality

```sh
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm run typecheck      # TypeScript strict mode
npm run test           # Vitest (run once)
npm run test:watch     # Vitest (watch mode)
npm run test:coverage  # Vitest with coverage
```

## Changelog

Phase 1: Foundation — app shell, browsing views, and theming.

### v0.0.3 (in progress)

- **1.5 App Shell and Layout** (2026-03-27) — Collapsible sidebar with media type navigation and item counts, top bar with search/view toggles/sort/add controls, responsive auto-collapse at 1280px, dark-first CSS custom property token system, `lucide-react` icons, `countItemsByType` IPC channel, empty and loading states

### v0.0.2

- **1.4 Zustand Store Setup** (2026-03-27) — Three Zustand stores (items, media types, UI state), cross-store subscriptions with debounced search, devtools middleware, store unit tests
- **Hotfix** (2026-03-22) — Added `.gitattributes` to normalize line endings, fixing phantom CRLF/LF diffs on Windows (#22)
- **1.3 Data Access Layer** (2026-03-21) — IPC handlers for CRUD operations, typed renderer API, shared TypeScript interfaces, repository pattern with tests
- **1.2 SQLite Integration** (2026-03-21) — better-sqlite3, migration system, items/media_types schema, 5 built-in media type seeds, Vitest setup
- **Hotfix** (2026-03-22) — Added `postinstall` script to rebuild `better-sqlite3` against Electron's Node.js headers, fixing NODE_MODULE_VERSION mismatch

### v0.0.1

- **1.1 Project Scaffolding** (2026-03-16) — Electron + React + TypeScript + Vite + Tailwind project structure
