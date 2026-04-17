# 01 – TECH STACK

## Frontend

| Schicht       | Wahl                                          | Begründung                               |
|---------------|-----------------------------------------------|------------------------------------------|
| Build         | Vite 5                                        | schnelles HMR, ESM-first                 |
| Framework     | React 18 + TypeScript 5                       | Standard, breite Community               |
| Routing       | React Router 6                                | keine SSR nötig, SPA reicht              |
| Styling       | Tailwind CSS 3 + shadcn/ui                    | mobile-first, dark mode via `class`      |
| Icons         | lucide-react                                  | shadcn-nativ                             |
| Server-State  | @tanstack/react-query v5                      | Caching, Retry, Offline-Queue            |
| Forms         | react-hook-form + zod                         | typsicher, minimale Re-Renders           |
| Charts        | recharts                                      | deklarativ, dark-mode-fähig              |
| Datum         | date-fns + date-fns-tz                        | tree-shakeable, locale `de-CH`           |
| PWA           | vite-plugin-pwa                               | Offline + installierbar                  |
| Offline-Store | Dexie (IndexedDB)                             | Workout-Logger ohne Netz                 |

## Backend (Phase 2)

| Schicht       | Wahl                          | Begründung                                   |
|---------------|-------------------------------|----------------------------------------------|
| DB            | Supabase Postgres + RLS       | Auth + RLS in einem, keine eigene API nötig  |
| Auth          | Supabase Auth (magic link)    | passwortlos, kein eigenes User-Management    |
| Edge          | Supabase Edge Functions       | OAuth-Callbacks für Withings etc.            |
| Secrets       | Supabase Vault                | Provider-Keys nie im Client                  |

## Dev-Tooling

- **pnpm** als Package-Manager
- **ESLint** + **Prettier** (shadcn-Konfiguration)
- **Vitest** für Unit-Tests (Phase 3)
- **Playwright** für E2E (Phase 4)

## Dark Mode

- `next-themes` ähnliches Pattern selbst implementiert in
  `src/components/theme-provider.tsx`
- 3-Weg-Toggle: `system | light | dark`
- Persistiert in `localStorage` unter Key `fittracker-theme`
- Tailwind `darkMode: 'class'`, Toggle setzt `class="dark"` auf `<html>`

## Path Alias

`@/*` → `src/*` (tsconfig.json + vite.config.ts).

## Locale

- `lang="de-CH"` auf `<html>`
- Datum `TT.MM.JJJJ` via date-fns `format(d, 'dd.MM.yyyy', { locale: deCH })`
- Zahlen `toLocaleString('de-CH')` → Komma als Dezimaltrenner

## Versionen-Pin

Exakte Versionen kommen aus `package.json`. Kein `^`, kein `~` für production
deps – nur devDeps dürfen auto-updaten. Reproducible builds > bleeding edge.
