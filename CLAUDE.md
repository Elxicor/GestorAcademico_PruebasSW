# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StudyMate ("GestorAcadémico") — a React + TypeScript SPA for students to manage tasks, subjects, grades, schedule, notes, and GPA, with an AI study assistant. Backed by Supabase (Postgres + Auth). This is a fork/derivative of `mintahandrews/studymate`, being adapted for a software testing course (Spanish UI strings, Cypress E2E suite added).

## Commands

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # tsc typecheck + vite build
npm run lint      # eslint src, --max-warnings 0
npm run preview   # preview production build
```

There is no unit test runner configured — testing is done via Cypress E2E only.

### Cypress E2E

```bash
npx cypress open              # interactive runner
npx cypress run                # headless, all specs
npx cypress run --spec "cypress/e2e/tasks.cy.js"   # single spec
```

The dev server (`npm run dev`) must be running on port 5173 before running Cypress, since `cypress.config.js` sets `baseUrl: 'http://localhost:5173'` and does not auto-start it.

## Architecture

### Data layer: localStorage-shaped API over Supabase

The app was originally built around `localStorage` (see the camelCase interfaces in [src/types.ts](src/types.ts): `Task`, `StudySession`, `Subject`, `Grade`, `ScheduleEntry`, etc.) and has since been migrated to Supabase without changing call sites. [src/utils/storage.ts](src/utils/storage.ts) exports `getFromStorage<T>(key, defaultValue)` / `setToStorage<T>(key, value)` — pages still call these with the old localStorage keys (`'tasks'`, `'studyTime'`, `'streak'`, subject/profile/etc. keys), but under the hood they resolve the current user via Supabase auth and read/write Supabase tables (`tasks`, `study_sessions`, `streaks`, or a generic `user_settings` key/value table for everything else). When touching any page-level data logic, check `utils/storage.ts` first to see how a given key is actually persisted — it is not real localStorage.

[src/lib/api.ts](src/lib/api.ts) additionally exposes direct snake_case Supabase-shaped functions (`createTask`, `getTasks`, `updateTask`, `deleteTask`, `getStudySessions`) with their own `Task`/`StudySession`/`UserProfile` interfaces — these are a separate, newer set of types from the camelCase ones in `types.ts`. Don't conflate the two type families when editing storage/data code.

[src/lib/supabase.ts](src/lib/supabase.ts) creates the singleton Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars (throws at import time if missing). [src/types/supabase.ts](src/types/supabase.ts) has the generated-style `Database` type for the `storage`, `users`, `streaks` tables.

### Auth & routing

[src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) wraps Supabase auth (`signInWithPassword`, `signUp`, `signOut`, `resetPasswordForEmail`, `updateUser`) and exposes `useAuth()`. All user-facing error/success messages are in Spanish and surfaced via `react-hot-toast`.

[src/App.tsx](src/App.tsx) defines all routes and gates everything except `/login` and `/signup` behind a `PrivateRoute` that checks `useAuth().user`. Each route maps 1:1 to a page in `src/pages/`. When adding a new page, register it in both the `<Routes>` block and (for authenticated users) `Navbar`.

### Env vars

Required in `.env` (see [src/env.d.ts](src/env.d.ts)): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY` (used by the AI Assistant feature, via `@google/generative-ai`).

## Testing conventions (Cypress)

- Specs live in `cypress/e2e/*.cy.js`, one per feature area (auth, tasks, subjects, grades, schedule, notes, profile, navigation), each with a `TC-<AREA>-NN` test-case naming convention and a Spanish doc comment at the top explaining what/why is covered.
- `cy.loginMock()` (defined in [cypress/support/commands.js](cypress/support/commands.js)) is the standard way to authenticate in tests: it intercepts Supabase auth/REST calls (`**/auth/v1/user`, `**/auth/v1/token*`, `**/rest/v1/**`) and drives the real login form with fixture credentials — it does not hit a real Supabase backend. Call it in `beforeEach` for any spec that needs an authenticated session.
- `cy.setupLocalStorageData(key, data)` seeds `window.localStorage` directly for tests that don't go through the mocked REST intercepts.
- [cypress/support/e2e.js](cypress/support/e2e.js) globally swallows uncaught exceptions containing `Supabase`/`fetch`/`NetworkError` so real network failures against the (intercepted) backend don't fail unrelated UI assertions — keep this in mind when a test seems to pass despite a broken data call.
- Fixture data is in [cypress/fixtures/user.json](cypress/fixtures/user.json) (valid/invalid users, sample subjects/tasks/grades/schedule/notes matching the `types.ts` shapes).
- UI strings and form labels/placeholders are in Spanish; selectors in specs match Spanish text (e.g. `'Nueva Tarea'`, `'Fecha Límite'`) and `#email`/`#password` ids on the login form.
