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
│   │   └── handlers.ts            # IPC channel registration (6 CRUD handlers)
│   └── database/
│       ├── index.ts               # setupDatabase() orchestrator
│       ├── connection.ts          # Singleton DB connection, path helpers
│       ├── migrate.ts             # Migration runner and rollback system
│       ├── migrations/
│       │   ├── index.ts           # Migration registry (allMigrations[])
│       │   ├── 001_create_items.ts        # Items table schema + indexes
│       │   └── 002_create_media_types.ts  # Media types table schema
│       ├── repositories/
│       │   ├── items.ts           # Item CRUD operations (find, insert, update, delete)
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
        ├── main.tsx               # React entry point
        ├── App.tsx                # Root component
        ├── app.css                # Tailwind imports, font faces, theme
        └── lib/
            └── trove-api.ts       # Typed renderer API wrapper (IPC client)
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

### v0.0.2 (in progress)

Phase 1: Foundation — core shell, database, browsing views, and media type system.

- **1.3 Data Access Layer** (2026-03-21) — IPC handlers for CRUD operations, typed renderer API, shared TypeScript interfaces, repository pattern with tests
- **1.2 SQLite Integration** (2026-03-21) — better-sqlite3, migration system, items/media_types schema, 5 built-in media type seeds, Vitest setup
- **Hotfix** (2026-03-22) — Added `postinstall` script to rebuild `better-sqlite3` against Electron's Node.js headers, fixing NODE_MODULE_VERSION mismatch

### v0.0.1

- **1.1 Project Scaffolding** (2026-03-16) — Electron + React + TypeScript + Vite + Tailwind project structure
