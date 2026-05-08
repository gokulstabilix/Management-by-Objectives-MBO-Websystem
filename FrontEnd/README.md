# MBO System — Frontend

Single-page application for the **Management by Objectives (MBO)** web system.  
Built with **React 19**, **Redux Toolkit**, **React Router 7**, and **Tailwind CSS 4**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite 8) |
| State Management | Redux Toolkit 2 + Async Thunks |
| Routing | React Router DOM 7 |
| HTTP Client | Axios (with interceptor-based token refresh) |
| Forms | React Hook Form 7 + Zod 4 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Project Structure

```
FrontEnd/
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── src/
│   ├── main.jsx            # React DOM root + providers
│   ├── App.jsx             # Root component + layout
│   ├── App.css             # Global styles
│   ├── index.css           # Tailwind imports
│   ├── assets/             # Static assets (images, fonts)
│   ├── components/         # Reusable UI components
│   ├── constants/          # App-wide constants & enums
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level page components
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Login / authentication pages
│   │   ├── dashboard/      # Role-specific dashboards
│   │   ├── employees/      # Employee directory & profiles
│   │   ├── mbo/            # MBO form creation & tracking
│   │   ├── mentees/        # Mentor → Mentee review workflow
│   │   ├── mentor-map/     # HR mentor assignment
│   │   ├── notifications/  # Notification center
│   │   └── quarters/       # Quarter management
│   ├── router/             # Route definitions & guards
│   ├── services/           # Axios API client & interceptors
│   ├── store/              # Redux store configuration
│   │   ├── index.js        # Store setup
│   │   └── slices/         # Feature slices
│   │       ├── authSlice.js
│   │       ├── employeeSlice.js
│   │       ├── mboSlice.js
│   │       ├── mentorMapSlice.js
│   │       ├── notificationSlice.js
│   │       └── quarterSlice.js
│   └── utils/              # Helper functions
├── public/                 # Public static files
├── .env                    # Local environment variables (git-ignored)
├── .env.example            # Template for .env
└── package.json
```

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- The **MBO Backend** server running (default: `http://localhost:5000`)

---

## Getting Started

### 1. Install dependencies

```bash
cd FrontEnd
npm install
```

### 2. Configure environment variables

Copy the example file and update if needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

> **Note:** Vite only exposes environment variables prefixed with `VITE_` to the client bundle.

### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server with HMR |
| `build` | `npm run build` | Build production bundle to `dist/` |
| `preview` | `npm run preview` | Preview production build locally |
| `lint` | `npm run lint` | Run ESLint checks |

---

## User Roles

The application supports three roles, each with different views and permissions:

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage quarters, view all MBO forms, system administration |
| **HR** | Manage employees, assign mentor-mentee mappings, view all MBO data |
| **Employee** | Create & track personal MBO forms, view assigned mentees (if mentor) |

---

## License

ISC
