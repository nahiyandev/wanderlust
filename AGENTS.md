<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- npm only (`package-lock.json` present): `npm run dev` / `npm run build` / `npm run lint`.
- No test suite exists. Verify changes with `npm run lint` plus `npx tsc --noEmit`. On a fresh clone run `next build` (or `next dev`) first — tsconfig includes generated types from `.next/types/**` and `.next/dev/types/**` that don't exist until then.
- Path alias: `@/*` → `./src/*`.

## shadcn/ui (v4 CLI, preset `base-nova`)

- Components are Base UI primitives, NOT Radix — the API is the `render` prop (e.g. `<SheetTrigger render={<Button variant="ghost" size="icon" />}>`), and there is no `asChild`. When a `Button` renders a non-button element (`render={<a/>}`/`<Link/>`), pass `nativeButton={false}` or Base UI logs a console error about native button semantics. Icon library is lucide-react; base color neutral (see `components.json`).
- The `cn` utility comes from the `cn` package (`import { cn } from "cn"`) — not `clsx`/`tailwind-merge`.
- Add components with `npx shadcn@latest add <name>`. Files are copied into `src/components/ui` and owned by this repo — edit them freely.
- Do not remove the `shadcn` npm dependency: `globals.css` imports `shadcn/tailwind.css` from it at build time.
- The v4 CLI has no `--base-color`/`--style` flags. Change base color via `npx shadcn@latest migrate base-color --to <color> -y`.
- Re-running `init`/`apply` rewrites fonts and has corrupted them before (wrote a self-referential `--font-sans: var(--font-sans)`). After any CLI theme operation, verify the theme in `src/app/globals.css` still resolves the Geist variables (`var(--font-geist-sans)` / `var(--font-geist-mono)`).

## Config flags that change how you write code

- `reactCompiler: true`: never hand-write `useMemo`/`useCallback`/`memo` for performance, and strictly follow the Rules of React (no side effects in render, no prop mutation) or the compiler misoptimizes.
- `cacheComponents: true`: request-time data (`cookies()`, `headers()`, uncached `fetch`, dynamic params) must live in a `use cache` scope or be rendered inside a `<Suspense>` boundary, or the build errors.
- Turbopack is the only bundler; Tailwind v4 is CSS-first — there is no `postcss.config` or `tailwind.config`. Theme tokens live in `src/app/globals.css` (`@theme inline`).

## Backend integration

- The backend source is a SIBLING repo: `../wanderlust-server/` (`npm run dev` = `node --watch index.js`, `.env` holds `MONGODB_URI` + `NEXT_APP_URL`). It runs at `http://localhost:5000` (CORS-friendly). Read `index.js` there for the authoritative route list: `GET /destinations`, `GET /destinations/:id` (public), `POST /add-destination`, `PATCH /destinations/:id`, `DELETE /destinations/:id` (all three admin-guarded — see below).
- Backend PATCH/DELETE/POST-destination are now role-guarded SERVER-side: `requireAdmin` in `../wanderlust-server/index.js` proxies the request's session cookie to `NEXT_APP_URL` (= the Next app) `/api/auth/get-session` and demands `role: admin`. Because browsers don't attach the session cookie to cross-port (`:5000`) requests, mutations go through the Next proxy routes `POST /api/destinations` and `PATCH|DELETE /api/destinations/[id]` (admin-checked, cookie forwarded) — client components must call these, never `localhost:5000` directly.
- **Auth runs in THIS repo via better-auth** (v1.7): `src/lib/auth.ts` (server instance — mongodbAdapter on the shared `wanderlust` DB), `src/lib/auth-client.ts` (react client with `inferAdditionalFields<typeof auth>()` + `adminClient()`), catch-all handler at `src/app/api/auth/[...all]/route.ts`. Secrets live in `.env.local` (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET` — Google social login is configured). Email/password min length is **6**. Extra user fields via additionalFields: `location`, `nationality`, `memberSince`.
- All pages read auth through the `useAuth()` facade (`src/context/auth-context.tsx`) — it wraps better-auth + the bookings API. **Never reintroduce localStorage for auth/session/bookings**; everything is real DB state now.
- Make an admin with `node scripts/set-admin.mjs <email>` (sets `role: "admin"` on the user doc; that user must sign in again). Header shows Add Destination/Admin links only for admins.
- Bookings route list lives in the SIBLING backend now: `POST /bookings`, `GET /bookings` (session user's list, newest first), `DELETE /bookings/:id` (ownership-checked) on `../wanderlust-server/index.js` behind a login-only `requireAuth` middleware (cookie → Next `/api/auth/get-session`). Price/name/total are read server-side from the `destinations` collection — never trust the client. The Next routes `POST /api/bookings`, `GET /api/bookings`, `DELETE /api/bookings/[id]` are thin same-origin proxies (cookie forwarded; GET maps raw backend docs to the `ClientBooking` shape exported from `src/app/api/bookings/route.ts`). Docs live in the shared `bookings` collection with a `BK-XXXXXXXX` bookingCode, exact field names: `bookingCode, userId, userEmail, destinationId, destinationName, imageUrl, country, departureDate, travelers, pricePerPerson, total, status, createdAt`. Client components keep calling the Next `/api/bookings*` paths, never `localhost:5000` directly.
- The backend returns TWO record shapes depending on record age: newer records use `destinationName` + `image` (Unsplash URL), older ones use `name` + `imageUrl` (can be empty). Every mapper must handle both. `price` can be string or number — always `Number()`.
- `next.config.ts` `images.remotePatterns` already whitelists `localhost:5000`, `images.unsplash.com` and `lh3.googleusercontent.com` (Google avatars); add more hosts there when new image sources appear, or `next/image` blocks them. Changes to `next.config.ts` require a dev-server restart — Turbopack does not hot-reload the config.
- All backend fetches must live inside `<Suspense>` (uncached runtime data + `cacheComponents`) — use the static-shell + streamed-content pattern already in use on `/destinations` and `/destinations/[id]`, with skeleton `animate-pulse` fallbacks so layout doesn't jump.
- cacheComponents traps: `usePathname()`/`useSession()` in the root-layout `<SiteHeader />` blocked prerendering — it must stay wrapped in `<Suspense>` inside `src/app/layout.tsx` (don't remove the wrapper). Same rule for any client hook that reads runtime data from a statically prerendered route.
- Page pattern: server component page fetches the data and passes mapped objects as props to client components for interactivity (see `src/app/destinations/page.tsx` → `src/components/destinations-grid.tsx`). Mappers live next to the fetch; keep the unified types in sync with the client component they feed.

## Design system & assets

- Design source of truth lives OUTSIDE this repo: `../b14-wanderlust-resources/` (Figma/Penpot files plus `assets/`: Banner.png hero, Wanderlast.png teal logo, Wanderlast-1.png white logo, `destinations/image1-6.png`, person avatars, misc icons).
- Copy needed assets into `public/images/` (the stock create-next-app svgs in `public/` root are disposable).
- Brand color: `--color-brand: #1ca3cc` token in `globals.css` → `bg-brand` / `text-brand` classes.
- Dark mode is class-based (`.dark` custom variant) with nothing toggling the class yet — there is no `prefers-color-scheme` fallback.
- Site-wide chrome lives in `src/app/layout.tsx`: `<SiteHeader />` renders above `{children}`, so every new page gets the navbar automatically. All nav links live in `src/components/site-header.tsx`.

## Gotchas

- The USER edits this repo in VS Code during agent sessions. Their unsaved editor buffers can resurrect deleted files (a mistyped `[id}` route folder came back twice this way) or silently revert changes. Always re-read files immediately before editing them; if a deleted file reappears or an edit vanishes, ask the user to save/discard their editor tabs first instead of fighting the file system.
- They reply in Banglish (Bengali words in Latin letters) — reply in Banglish, never Bengali script.
- Pending wirings: none left — destination create (`add-destination`, admin-guarded, POSTs to backend), package edit (PATCH dialog), detail Delete, bookings, and the entire better-auth flow are all wired real. The category option list is duplicated in `add-destination/page.tsx` and `update-package-dialog.tsx` — keep the two in sync.
- Admin dashboard (`/admin`, admin-only): overview data comes from `GET /api/admin/overview` (status 403 for non-admins) — ALL users' bookings + distinct traveler count + destination list from the shared MongoDB `destinations` collection. "Manage Travel Packages" table reuses `EditDestinationDialog` (wraps `UpdatePackageDialog`, real PATCH) and `DeleteDestinationButton` (both accept `onSaved`/`onDeleted` callbacks to refetch the overview). Backend PATCH/DELETE are open endpoints (no role check server-side) — client-side guards only.
- lucide-react in this version ships NO brand icons (X/LinkedIn/Instagram/Google) — inline SVGs are used: `site-footer.tsx` for socials, `src/components/google-icon.tsx` for the Google "G" (reuse that component).
- `next dev` refuses to start a second server for the same directory ("Another next dev server is already running"). If port 3000 is busy, a server is likely already serving the site — don't assume the dev setup is broken.
