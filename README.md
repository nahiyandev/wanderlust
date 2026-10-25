<div align="center">
  <img src="./public/images/Wanderlast.png" alt="Wanderlust" width="220" />

  <h1>Wanderlust</h1>
  <p><strong>Find your next escape. Make the journey unforgettable.</strong></p>
  <p>A travel discovery and booking experience for exploring hand-picked destinations.</p>
  <p><a href="https://wanderlust-sigma-wine.vercel.app/">Visit the live site ↗</a></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-111111?logo=next.js&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  </p>
</div>

<p align="center">
  <img src="./public/images/Banner.png" alt="Explore your next adventure with Wanderlust" width="100%" />
</p>

## Explore

Wanderlust brings destination discovery, account management, and travel bookings together in one responsive web app. Browse destination details, save a booking to your account, and manage travel packages from the admin dashboard.

### What you can do

- **Discover destinations** — browse curated trips, view details, photos, prices, and durations.
- **Create an account** — register or sign in with email and password, or use Google.
- **Book a trip** — choose a departure date and traveler count; view and manage your bookings.
- **Manage packages** — admins can add, update, and remove destinations.
- **Manage your profile** — view and update account details.

## Built with

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Base UI |
| Authentication | Better Auth with Google OAuth |
| Data | MongoDB |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- MongoDB connection string
- Google OAuth credentials (optional; only needed for Google sign-in)
- A running Wanderlust backend, or the hosted backend URL

### Install and run

```bash
npm ci
```

Create `.env.local` in the project root:

```dotenv
MONGODB_URI="your-mongodb-connection-string"
BETTER_AUTH_SECRET="your-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
BACKEND_URL="https://wanderlust-server-nahiyan1.vercel.app"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

Generate a secure Better Auth secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Keep `.env.local` private. Never commit database credentials, OAuth secrets, or authentication secrets.

## Google sign-in setup

In Google Cloud Console, configure an OAuth client for a web application:

1. Add the app origin under **Authorized JavaScript origins**:
   - Local: `http://localhost:3000`
   - Production: `https://your-frontend-domain`
2. Add the Better Auth callback under **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-frontend-domain/api/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` and in the frontend deployment's environment variables.
4. Set `BETTER_AUTH_URL` to the origin of the app being served, then restart locally or redeploy.

The production frontend origin must be listed in the Better Auth `trustedOrigins` configuration in [`src/lib/auth.ts`](./src/lib/auth.ts).

## Backend

The frontend uses `BACKEND_URL` for backend requests. It defaults to the hosted Wanderlust API if the variable is not set.

- Public destination reads use `GET /destinations` and `GET /destinations/:id`.
- Booking requests are sent through same-origin Next.js API routes, which forward the signed-in user's session to the backend.
- Destination create, update, and delete requests also go through Next.js API routes so the session cookie can be forwarded.
- The backend is a separate service; configure `BACKEND_URL` in the frontend's deployment environment and redeploy after changing it.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |

## Project structure

```text
src/
├── app/                 # Pages, layouts, and Next.js API routes
│   ├── api/             # Auth, booking, destination, and admin endpoints
│   ├── destinations/    # Destination list and detail pages
│   ├── login/           # Sign-in
│   ├── signup/          # Registration
│   └── admin/           # Admin dashboard
├── components/          # Shared UI and feature components
├── context/             # Authentication and booking state
└── lib/                 # Auth, database, and backend configuration
public/
└── images/              # Brand, hero, and supporting images
```

## Deployment

Deploy the frontend with [Vercel](https://vercel.com/). Add the environment variables from the setup section to the frontend project's environment settings:

- Set `BETTER_AUTH_URL` to the deployed frontend origin.
- Set `BACKEND_URL` to the backend service origin.
- Add the MongoDB and Better Auth credentials.
- Add the production frontend origin and callback URL to the Google OAuth client.
- Redeploy whenever environment variables change.

## License

No license has been specified for this project.
