# Management by Objectives (MBO) — Web System

A full-stack web application for managing **Management by Objectives (MBO)** workflows across an organization. Enables goal setting, tracking, mentor-mentee reviews, and quarterly performance management.

---

## Overview

| Component | Tech | Port |
|-----------|------|------|
| **Backend** | Express 5, MongoDB Atlas, JWT Auth | `5000` |
| **Frontend** | React 19, Redux Toolkit, Vite 8, Tailwind CSS 4 | `5173` |

---

## Repository Structure

```
Management by Objectives (MBO)/
├── BackEnd/                # REST API server
│   ├── server.js           # Entry point
│   ├── src/                # Source code (config, controllers, models, routes, services)
│   ├── .env.example        # Environment variable template
│   └── package.json
│
├── FrontEnd/               # React SPA
│   ├── src/                # Source code (components, pages, store, services)
│   ├── .env.example        # Environment variable template
│   └── package.json
│
└── README.md               # ← You are here
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9  
- A **MongoDB Atlas** cluster (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/gokulstabilix/Management-by-Objectives-MBO-Websystem.git
cd "Management by Objectives (MBO)"
```

### 2. Setup the Backend

```bash
cd BackEnd
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your **MongoDB URI** and **JWT secrets**:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mbo-system?retryWrites=true&w=majority

JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_COOKIE_MAX_AGE=604800000

CORS_ORIGIN=http://localhost:5173
```

Seed the database with default users (optional):

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

> ✅ Backend running at **http://localhost:5000**

### 3. Setup the Frontend

Open a **new terminal** and run:

```bash
cd FrontEnd
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

The default `.env` should work out of the box:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

> ✅ Frontend running at **http://localhost:5173**

### 4. Open in browser

Navigate to **http://localhost:5173** and log in with the seeded credentials.

---

## Default Seeded Users

After running `npm run seed` in the backend, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | *(check seed script)* | *(check seed script)* |
| HR | *(check seed script)* | *(check seed script)* |
| Employee | *(check seed script)* | *(check seed script)* |

> Run `node src/utils/seed.js` in the `BackEnd/` directory to see exact credentials logged to the console.

---

## Features

### 🎯 MBO Form Management
- Employees create and submit MBO forms with objectives and key results
- Track progress with status workflows (Draft → Submitted → Reviewed → Approved)

### 👥 Mentor-Mentee System
- HR assigns mentor-mentee mappings based on employee levels
- Mentors review and provide feedback on mentee MBO forms

### 📅 Quarter Management
- Admins create and manage quarterly cycles
- MBO forms are linked to specific quarters

### 🔔 Notifications
- Real-time notification system for form submissions, reviews, and approvals

### 👤 Role-Based Access
- **Admin** — System-wide management, quarter control
- **HR** — Employee management, mentor assignments
- **Employee** — Personal MBO tracking, mentee reviews (if senior/lead)

---

## Available Scripts

### Backend (`BackEnd/`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with Nodemon (hot-reload) |
| `start` | `npm start` | Start in production mode |
| `seed` | `npm run seed` | Seed database with default users |
| `test` | `npm test` | Run Jest test suite |

### Frontend (`FrontEnd/`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server with HMR |
| `build` | `npm run build` | Build production bundle |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | Run ESLint checks |

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | Environment (default: `development`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | Access token signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token lifetime (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifetime (default: `7d`) |
| `JWT_REFRESH_COOKIE_MAX_AGE` | No | Cookie max age in ms (default: `604800000`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default: `http://localhost:5173`) |

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: `http://localhost:5000/api`) |

---

## License

ISC
