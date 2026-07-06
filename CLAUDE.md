# CLAUDE.md

This file gives Claude Code (and other agents) context for working in this repository.

## What this is

A minimal React SPA that controls WiZ (Philips/Signify) smart bulbs over the local
network: bulb discovery, a one-click preset bar (relaxing multi-color combos applied to
all bulbs), a per-bulb card (on/off, brightness, RGB color, white color-temp, scenes),
and bulb rename.

This app has no functionality of its own — it is a pure UI client for the sibling
`wiz_control_backend` repo, which must be running on `localhost:3001` and does the
actual UDP communication with the bulbs. In dev, `/api/*` is proxied to that backend
(see `vite.config.ts`) so there's no CORS setup needed.

## Stack

- React 19 (function components + hooks only), TypeScript 6, Vite 8
- `oxlint` is the linter — there is no ESLint or Prettier config
- No test framework (no Vitest/Jest/RTL) — there are no existing tests to run
- No state-management library, no routing library, no CSS framework, no HTTP client
  library (raw `fetch`) — keep it that way unless the user asks to add one

## Commands

```bash
npm install       # setup
npm run dev       # vite dev server on :5173, proxies /api -> localhost:3001
                  # (start wiz_control_backend first)
npm run build     # tsc -b && vite build -> dist/
npm run lint      # oxlint
npm run preview   # serve the production build locally
```

There is no test script. Use `npm run build` (type-check via `tsc -b`) and
`npm run lint` to validate changes.

## Structure

```
src/
├── main.tsx              # React entry point (createRoot + StrictMode)
├── App.tsx               # top-level screen: header, discover button, preset bar, bulb grid
├── App.css
├── index.css              # global styles + CSS custom properties (light/dark theme)
├── api.ts                # all backend fetch calls live here — components never call fetch directly
├── types.ts               # shared domain types: Bulb, PilotState, Scene, Preset, PresetColor
└── components/
    ├── BulbCard.tsx       # single bulb card: on/off, brightness, color/white/scenes tabs
    └── BulbCard.css
```

The codebase is intentionally flat (7 source files). `App.tsx` owns all list-level state
(bulbs, scenes, presets); `BulbCard.tsx` owns its own per-bulb pilot state. Cross-component
refresh after a preset apply is done via a `refreshSignal` counter prop, not a shared store.

## Conventions

- Type-only imports MUST use `import type { ... }` — enforced by `verbatimModuleSyntax`
  in both tsconfig files; the build fails otherwise.
- Neither tsconfig sets `strict: true` explicitly; instead a hand-picked set of flags is
  enabled (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, etc.) —
  don't assume full strict-mode guarantees.
- Components: PascalCase files/exports, one component per file with a colocated CSS file
  (e.g. `BulbCard.tsx` + `BulbCard.css`). Non-component modules: lowerCamelCase (`api.ts`,
  `types.ts`).
- All network access goes through `src/api.ts`. Add new backend calls there, not inline
  in components.
- Errors are caught and surfaced as a string in local component state
  (`.catch((err: Error) => setError(err.message))`), never thrown to an error boundary.
- Styling is plain CSS per component, kebab-case class names, theming via CSS custom
  properties in `index.css` with a `prefers-color-scheme: dark` override. No CSS
  modules/Tailwind/CSS-in-JS.
- Polling and debouncing (e.g. `BulbCard`'s 5s pilot-state poll, the local `useDebounced`
  hook for sliders) are done with plain `useState`/`useEffect`, not a library.

## Notes for making changes

- This app is non-functional without `wiz_control_backend` running on port 3001 — when
  verifying UI changes, start the backend first.
- Match the existing plain-`fetch` + `.then/.catch` pattern in `api.ts` and components
  rather than introducing axios/react-query/SWR.
