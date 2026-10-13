
---

## 📖 Overview

Synapse is a full-stack **MERN** application that demonstrates production-style **authentication and authorization**. Every visitor signs in through one common login, and is then routed to a dashboard that matches their role: **User**, **Manager** or **Admin**.

The key design idea: **roles are enforced on the server, not just hidden in the UI.** The React app guards routes for a good experience, but every protected API endpoint independently checks the session and the role before returning data.

## ✨ Features

- 🔐 **Session-based authentication** with `express-session`, stored in MongoDB (`connect-mongo`), 8-hour expiry
- 🍪 **Secure cookies**: `httpOnly`, configurable `secure` / `sameSite` for cross-site deployment
- 👥 **Three roles**: `user`, `manager`, `admin`, each with its own dashboard and permissions
- ✅ **Manager approval workflow**: managers register as `pending` and can log in only after an Admin approves them
- 🛡️ **Admin-only account management**: list all accounts, approve, disable or re-enable them
- 🚫 **Admin accounts cannot be self-registered** and cannot be modified from the dashboard
- 🔑 **Password hashing** with `bcryptjs` (12 rounds) and length validation (10-72 characters)
- 🔄 **Session fixation protection**: the session is regenerated on every login and registration
- 🧱 **Defensive API**: input validation, request body size limit (20 KB), generic error messages, `x-powered-by` disabled
- ⚛️ **Protected React routes** that restore the logged-in user on page refresh via `/api/auth/me`

## 🧩 Roles at a glance

| Role | How to get it | Access |
| --- | --- | --- |
| **User** | Self-register, active immediately | `/user` dashboard |
| **Manager** | Self-register, status `pending` until an Admin approves | `/manager` dashboard |
| **Admin** | Created only by the seed script (not public) | `/admin` dashboard, account management |

Account statuses: `active`, `pending`, `disabled`. Only `active` accounts can use protected endpoints.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Bootstrap + Bootstrap Icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | express-session, connect-mongo, bcryptjs |
| Tooling | Oxlint, Nodemon |
| Deployment | Vercel (frontend, SPA rewrites configured) |

## 📁 Project Structure

```text
Synap/
└── synapse/
    ├── src/                     # React frontend
    │   ├── api.js               # fetch wrapper (credentials: include)
    │   ├── App.jsx              # routes + auth state
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── AuthPage.jsx     # login + register
    │       ├── ForgotPassword.jsx
    │       ├── DashboardLayout.jsx
    │       ├── UserDashboard.jsx
    │       ├── ManagerDashboard.jsx
    │       ├── AdminDashboard.jsx
    │       └── AdminAccounts.jsx
    ├── server/                  # Express API
    │   ├── server.js            # app setup, session, CORS
    │   ├── config/db.js         # MongoDB connection
    │   ├── middleware/auth.js   # protect + authorize(...roles)
    │   ├── models/User.js
    │   ├── routes/
    │   │   ├── auth.js          # register, login, me, logout
    │   │   └── dashboard.js     # role dashboards + admin account APIs
    │   ├── seedAdmin.js         # create the first Admin
    │   └── resetAdmin.js        # recover Admin access
    ├── vercel.json              # SPA rewrite rule
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone the repository

```bash
git clone https://github.com/dkgupta76/Synap.git
cd Synap/synapse
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `server/.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
SESSION_SECRET=replace-with-a-random-string-of-at-least-32-characters
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false

# Used only by the admin seed script
SEED_ADMIN_NAME=Your Name
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=use-at-least-12-characters
```

Create the first Admin, then start the API:

```bash
npm run seed-admin
npm run dev
```

The API runs at `http://localhost:5000`. Check it with `GET /api/health`.

### 3. Set up the frontend

In a second terminal, from the `synapse/` folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Optionally create `synapse/.env` if your API is not on the default URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### Environment variables

| Variable | Where | Required | Description |
| --- | --- | --- | --- |
| `MONGO_URI` | server | ✅ | MongoDB connection string |
| `SESSION_SECRET` | server | ✅ | Min. 32 characters; the server refuses to start otherwise |
| `CLIENT_URL` | server | recommended | Allowed CORS origin (default `http://localhost:5173`) |
| `COOKIE_SECURE` | server | production | Set `true` over HTTPS; switches cookie to `sameSite: none` |
| `PORT` | server | optional | Defaults to `5000` |
| `SEED_ADMIN_NAME` / `_EMAIL` / `_PASSWORD` | server | for seeding | Password must be 12+ characters |
| `VITE_API_URL` | frontend | optional | API base URL (default `http://localhost:5000/api`) |

## 🔌 API Reference

Base path: `/api`

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `POST` | `/auth/register` | Register as `user` (active) or `manager` (pending approval) |
| `POST` | `/auth/login` | Log in with email and password, any role |
| `POST` | `/auth/logout` | Destroy the session |
| `POST` | `/auth/forgot-password` | Placeholder, no email is sent yet |

### Authenticated

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/auth/me` | any | Current logged-in user |
| `GET` | `/user` | user | User dashboard data |
| `GET` | `/manager` | manager | Manager dashboard data |
| `GET` | `/admin` | admin | Dashboard stats (totals, pending managers, disabled) |
| `GET` | `/admin/accounts` | admin | List all accounts |
| `PATCH` | `/admin/accounts/:id/status` | admin | Set status to `active`, `pending` or `disabled` |

Example login request:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

## 🔒 Security Notes

- Passwords are hashed with bcrypt and are never returned by the API (`select: false`).
- Login returns the same message for a wrong email or a wrong password, so accounts cannot be enumerated.
- Role checks happen in the `authorize(...roles)` middleware on every protected route.
- Disabled users are rejected on their next request, even if they already have a session.
- Never commit your `.env` file. It is already listed in `.gitignore`.

## ☁️ Deployment

- **Frontend (Vercel):** set the project root to `synapse`, build command `npm run build`, output `dist`, and set `VITE_API_URL` to your deployed API. `vercel.json` already rewrites all routes to `index.html` for React Router.
- **Backend:** deploy `synapse/server` to any Node host (Render, Railway, etc.). Set all server variables, use `COOKIE_SECURE=true`, and set `CLIENT_URL` to your frontend URL so CORS and cross-site cookies work.

## 🗺️ Roadmap

- [ ] Real email-based password recovery
- [ ] Rate limiting on login and register
- [ ] Manager features (team and activity tools)
- [ ] Profile editing for users
- [ ] Automated tests (API and UI)

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.

## 👤 Author

**Deepak Gupta**
GitHub: [@dkgupta76](https://github.com/dkgupta76)
