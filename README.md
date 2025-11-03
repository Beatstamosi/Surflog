# TS Template for Express + React App

Branch passport has User Authentication via passportjs set up.

Branch check-existing-user checks if user already exists via Email during sign-up.
Also has some extra fields like firstName, lastName, member, admin --> which can be deleted from client and server files.

1. Clone Repo
2. npm install
3. Add Database via pool.js
4. Set up environment variables

.env client:
VITE_API_BASE_URL

.env server:
SESSION_SECRET=
PGHOST=
PGUSER=
PGDATABASE=
PGPASSWORD=
PGPORT=5432 ?

NODE_ENV=development
