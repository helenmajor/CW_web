# CW_web

`CW_web` is a study-abroad / postgraduate-application planning game app with a Vue 3 frontend and an Express backend.

## Structure

- `frontend`: Vue 3 + Vite + Vue Router + Pinia
- `backend`: Express + SQLite + JWT + bcrypt API backend

## Local Startup

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

Optional database initialization:

```bash
cd backend
npm run db:init
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

Backend default URL:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

Optional backend environment variables:

```bash
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change-this-in-real-use
JWT_EXPIRES_IN=7d
DB_PATH=./data/gradquest.sqlite
BCRYPT_SALT_ROUNDS=10
INITIAL_COINS=140
```

You can copy `backend/.env.example` to `backend/.env` and adjust values as needed.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

The frontend proxies `/api` requests to the backend during local development.

## Backend Overview

The backend is organized into:

- `backend/src/config`: environment, CORS, gameplay seed config
- `backend/src/db`: SQLite connection, schema creation, seeding
- `backend/src/middleware`: auth and centralized error handling
- `backend/src/repositories`: database access helpers
- `backend/src/services`: auth, progress, shop, inventory business logic
- `backend/src/controllers`: HTTP handlers
- `backend/src/routes`: modular API routes

Main API groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/progress`
- `POST /api/progress/complete`
- `POST /api/progress/skip`
- `GET /api/shop/items`
- `POST /api/shop/purchase`
- `GET /api/inventory`
- `GET /api/health`
