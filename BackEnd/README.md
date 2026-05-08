# MBO System — Backend

REST API server for the **Management by Objectives (MBO)** web system.  
Built with **Express 5**, **MongoDB Atlas** (via Mongoose), and **JWT** cookie-based authentication.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth | JWT (access + refresh tokens, HttpOnly cookies) |
| Validation | Zod 4 |
| Security | Helmet, CORS, express-rate-limit |
| Dev tools | Nodemon, Morgan, Jest, Supertest |

---

## Project Structure

```
BackEnd/
├── server.js               # Application entry point
├── src/
│   ├── config/
│   │   ├── db.js           # MongoDB Atlas connection
│   │   └── env.js          # Environment variable loader & validation
│   ├── controllers/        # Route handlers (thin layer)
│   ├── middleware/          # Auth guard, error handler, validation
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── MboForm.js
│   │   ├── Quarter.js
│   │   └── Notification.js
│   ├── repositories/       # Data-access layer (DB queries)
│   ├── routes/             # Express route definitions
│   │   ├── index.js        # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── mboFormRoutes.js
│   │   ├── quarterRoutes.js
│   │   ├── mentorMapRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/           # Business logic layer
│   ├── utils/              # Helpers, seed script
│   └── validators/         # Zod schemas for request validation
├── .env                    # Local environment variables (git-ignored)
├── .env.example            # Template for .env
└── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **MongoDB Atlas** cluster (or a local MongoDB instance)

---

## Getting Started

### 1. Install dependencies

```bash
cd BackEnd
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGO_URI` | MongoDB connection string | — *(required)* |
| `JWT_ACCESS_SECRET` | Secret for access tokens | — *(required)* |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — *(required)* |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `JWT_REFRESH_COOKIE_MAX_AGE` | Refresh cookie max age (ms) | `604800000` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

### 3. Seed the database (optional)

```bash
npm run seed
```

This creates default Admin, HR, and Employee users for development.

### 4. Start the server

```bash
# Development (hot-reload with Nodemon)
npm run dev

# Production
npm start
```

The API will be available at **http://localhost:5000**.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login & receive tokens | No |
| `POST` | `/api/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/api/auth/logout` | Logout & clear cookie | Yes |
| `GET` | `/api/users` | List users | Yes |
| `POST` | `/api/users` | Create a user | Admin/HR |
| `GET` | `/api/users/:id` | Get user by ID | Yes |
| `PUT` | `/api/users/:id` | Update user | Admin/HR |
| `GET` | `/api/quarters` | List quarters | Yes |
| `POST` | `/api/quarters` | Create quarter | Admin |
| `PUT` | `/api/quarters/:id` | Update quarter | Admin |
| `GET` | `/api/mbo-forms` | List MBO forms | Yes |
| `POST` | `/api/mbo-forms` | Create MBO form | Yes |
| `PUT` | `/api/mbo-forms/:id` | Update MBO form | Yes |
| `GET` | `/api/mentor-map` | List mentor mappings | Yes |
| `POST` | `/api/mentor-map` | Create mentor mapping | HR |
| `GET` | `/api/notifications` | List notifications | Yes |
| `GET` | `/health` | Health check | No |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with Nodemon (hot-reload) |
| `start` | `npm start` | Start in production mode |
| `seed` | `npm run seed` | Seed database with default users |
| `test` | `npm test` | Run Jest test suite |

---

## License

ISC
