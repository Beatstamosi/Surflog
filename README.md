# Surf Log (Surf-Journal)

Surf-Journal is a personal surf journal web application for recording and optionally sharing surf sessions and related posts. It stores session metadata (start/end times, duration), user ratings, photos, notes, and forecast information for the recorded spot. When enabled, users may publish session summaries (posts) that include the session details and the forecast snapshot for the spot at the session time.

The application is intended as a self-hosted/experimental project for tracking and analyzing surf activity rather than a public social platform.

**Contents**

- `client/` — React + Vite front-end
- `server/` — Express + TypeScript back-end (Prisma + Postgres)

**Quick Start**

Requirements:

- Node.js (v18+ recommended)
- npm, pnpm or yarn

1. Clone the repo

```bash
git clone <repo-url>
cd Surf-Journal
```

2. Install dependencies

- Install client dependencies:

```bash
cd client
npm install
```

- Install server dependencies:

```bash
cd ../server
npm install
```

3. Environment variables

- Create `.env` files for `client/` and `server/` if needed. The server typically requires a `DATABASE_URL` for Prisma and any auth secrets you use (for example `JWT_SECRET`). The client may require an API URL variable if you override the default. If your project includes example env files, copy them (for example `cp server/.env.example server/.env`).

4. Run the app (development)

- Start the server (from `server/`):

```bash
cd server
npm run dev
```

- Start the client (from `client/`):

```bash
cd client
npm run dev
```

Open the client in a browser at the URL printed by Vite (typically `http://localhost:5173`). The client proxies API calls to `/api` in development.

**Testing**

- If tests are present in the `client/`, install dev dependencies in the `client/` folder and run:

```bash
cd client
npm install
npm run test        # run once
npm run test:watch  # watch mode
```

**Build & Production**

- Build the client:

```bash
cd client
npm run build
```

- Build the server (compile TypeScript):

```bash
cd server
npm run build
```

Start the production server (after build):

```bash
cd server
npm start
```

**Database / Prisma**

- Prisma is used for the server. If you make schema changes, run migrations and generate the client:

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

**Project Structure (high level)**

- `client/src/` — React components, utilities, and assets
- `server/src/` — Express routes, controllers, services and Prisma client
- `prisma/` — Prisma schema and migration files (under `server/prisma`)

**Contributing**

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes and add tests where possible
3. Run linters and tests
4. Open a pull request with a clear description

**Notes**

- This README provides a general developer-focused guide. Refer to any `*.example` env files and the `client/` and `server/` directories for more details.

- Data recorded by the application can include:
  - Session timestamps (`startTime`, `endTime`) and derived duration
  - Session rating (numeric/visual stars)
  - Spot/forecast snapshot at the time of the session (wind, swell, tide, spot name)
  - Media attachments (photos) and free-text notes about conditions or equipment
  - Optional published posts that bundle a session with commentary and the forecast snapshot
