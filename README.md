# Trove

A cross-platform desktop application for tracking your personal media library — books, music, movies, TV, games, podcasts, and custom types.

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
├── main/           # Electron main process (Node.js)
│   └── index.ts    # Window management, IPC handlers
├── preload/        # Secure bridge between main and renderer
│   ├── index.ts    # contextBridge API exposed to renderer
│   └── index.d.ts  # Type declarations for window.trove
└── renderer/       # React SPA (Chromium)
    ├── index.html  # HTML entry point
    ├── assets/     # Fonts, images
    └── src/
        ├── main.tsx   # React entry point
        ├── App.tsx    # Root component
        └── app.css    # Tailwind imports, font faces, theme
```

Build output goes to `out/` (Vite bundles) and `dist/` (packaged binaries).

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```sh
npm install
```

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
```

## Changelog

### v0.0.1 (in progress)

Phase 1: Foundation — core shell, database, browsing views, and media type system.

- **1.1 Project Scaffolding** (2026-03-16) — Electron + React + TypeScript + Vite + Tailwind project structure
