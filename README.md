# 🏄‍♂️ Surf Log (Surf-Journal)

Surf Log is a full‑stack surf journal application built with Express, React, Prisma and PostgreSQL. It lets users record detailed surf sessions and — when desired — publish session summaries (posts) that include the session data plus a forecast snapshot for the spot and time.

> Note: this repository is a developer-focused project for recording and analyzing surf activity. It's not intended as a public social network.

Live demo: https://surflog-frontend-production.up.railway.app/

---

## Features

- 🧑‍💻 User profiles — sign up, edit profile details, upload a profile picture
- 📅 Session logging — record start/end times, duration, notes, photos and equipment used
- 🌊 Forecast integration — capture swell, wind, tide and other forecast data for the recorded spot/time
- 🏄‍♂️ Board management — track your quiver and select which board you rode
- 🌟 Rating system — rate sessions (1–5 stars)
- 📊 Filters & analytics — sort and filter by rating, date, duration and spot
- 🔒 Authentication — secure login/registration (password hashing)
- 🔄 Optional sharing — publish session summaries as posts with likes/comments
- 📱 Responsive UI — desktop, tablet and mobile friendly

---

## What users can record and share

- Session timestamps (`startTime`, `endTime`) and calculated duration
- Spot / forecast snapshot (swell, wind, tide, spot name) associated with the session
- Numeric/visual rating and free‑text notes
- Media attachments (photos) and board used
- Optional published posts that bundle session details with the forecast and commentary

---

## Tech stack

| Layer        | Technology                    |
| ------------ | ----------------------------- |
| Frontend     | React (v19), TypeScript, Vite |
| Backend      | Node.js, Express, TypeScript  |
| Database     | PostgreSQL (Prisma ORM)       |
| Auth         | JWT / Passport.js             |
| File storage | Supabase Storage              |
| Styling      | CSS Modules                   |
| Deployment   | Railway                       |

---

## Installation & setup

Requirements:

- Node.js (v18+ recommended)
- npm, pnpm or yarn

1. Clone the repository

```bash
git clone <repo-url>
cd Surf-Journal
```

2. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

3. Environment variables

Create `.env` files for the server and client as needed. Example keys:

**Server** (`server/.env`)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
PORT=3000
NODE_ENV=development
```

**Client** (`client/.env`)

```env
VITE_API_BASE_URL="http://localhost:3000"
```

4. Initialize the database (Prisma)

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

5. Run the app (development)

Run backend and frontend in separate terminals:

```bash
# From server/
npm run dev

# From client/
npm run dev
```

Open the client URL printed by Vite (typically `http://localhost:5173`). The dev client proxies API calls to `/api`.

---

## Project structure

```
surf-log/
├─ client/                # React front-end
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ utils/
│  │  └─ types/
│  └─ package.json
├─ server/                # Express back-end
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ utils/
│  ├─ prisma/
│  └─ package.json
└─ README.md
```

---

## Database schema (high level)

Main models include:

- `User` — accounts and profiles
- `Session` — surf session records with timestamps, rating, notes, media
- `Forecast` — snapshot of surf/weather conditions for a session's spot/time
- `Board` — surfboard details in a user's quiver
- `Post` — optional shared session summaries with social interactions
- `Like` / `Comment` — interactions on posts

---

## Future improvements

- Notifications for ideal surf conditions
- Advanced analytics and session statistics
- Map integration for session locations
- Photo gallery for session images
- Mobile app (React Native)

---

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

## Acknowledgments

- Surfline (forecast provider) — for surf condition data
- Railway — deployment hosting
