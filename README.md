# 🚗 Car Garage & Expense Tracker

A full-stack web application for tracking your car collection and associated expenses. Built with a microservices-oriented architecture as a diploma project.

---

## ✨ Features

- **Authentication** — register and log in via email or username, JWT-based session (24h)
- **My Garage** — add, edit and delete cars (brand, model, year, plate number)
- **Expense Tracking** — log expenses per car with category, amount, date, description and receipt photo upload
- **Expense Charts** — visual breakdown of spending by category (powered by Recharts)
- **Public Profiles** — every user has a public profile page viewable by anyone
- **User Search** — find other users by their public username
- **Settings** — change your public username, upload an avatar, update your password
- **Dark / Light Theme** — toggle in the sidebar or bottom navigation bar
- **Responsive UI** — sidebar layout on desktop, bottom navigation on mobile

---

## 🏗️ Architecture

The project follows a microservices-inspired design where responsibilities are split across separate services, each owning its own API domain. For MVP simplicity, all services share one PostgreSQL database.

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                   │
│              (Vite · React Router · Axios)          │
└────────┬──────────────┬──────────────┬──────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────────┐  ┌──────────────┐
   │   Auth   │  │   Garage     │  │    User      │
   │ Service  │  │   Service    │  │   Service    │
   │  :4001   │  │    :4002     │  │    :4003     │
   └────┬─────┘  └──────┬───────┘  └──────┬───────┘
        │               │                 │
        └───────────────┴─────────────────┘
                        │
               ┌────────▼────────┐
               │   PostgreSQL    │
               │  garage_tracker │
               └─────────────────┘
```

> **Note:** The `server/` directory contains a monolith version (port `5000`) used during early development. The `services/` directory holds the split microservices version.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File uploads | Multer (local disk) |
| Dev tooling | Nodemon |
| Containers | Docker Compose (database only) |

---

## 📁 Project Structure

```
garage-expense-microservices/
├── services/
│   ├── auth-service/         # Register · Login · JWT validation (:4001)
│   ├── garage-service/       # Cars · Expenses · Receipt uploads (:4002)
│   └── user-service/         # Public profile · User search (:4003)
├── server/                   # Monolith backend (development reference, :5000)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cars.js
│   │   ├── expenses.js
│   │   ├── profile.js
│   │   └── settings.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── uploads/              # Locally stored receipt & avatar images
│   ├── db.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginRegisterPage.jsx
│   │   │   ├── GaragePage.jsx
│   │   │   ├── CarDetailsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SearchUserPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql            # PostgreSQL schema
├── docker-compose.yml        # Spins up PostgreSQL
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL 16 (or use Docker)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/tim2rist/garage-app.git
cd garage-app
```

### 2. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port `5432` with:
- user: `postgres`
- password: `postgres`
- database: `garage_tracker`

Then apply the schema:

```bash
psql -U postgres -d garage_tracker -f database/schema.sql
```

### 3. Configure environment variables

Each service has a `.env.example` file. Copy and fill them in:

```bash
# Auth Service
cp services/auth-service/.env.example services/auth-service/.env

# Garage Service
cp services/garage-service/.env.example services/garage-service/.env

# User Service
cp services/user-service/.env.example services/user-service/.env
```

Minimum required variables (example for auth-service):

```env
PORT=4001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/garage_tracker
JWT_SECRET=your_secret_key
```

For the monolith server (used in development):

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garage_tracker
JWT_SECRET=your_secret_key
```

### 4. Install dependencies

```bash
# Each service
cd services/auth-service && npm install && cd ../..
cd services/garage-service && npm install && cd ../..
cd services/user-service  && npm install && cd ../..

# Frontend
cd frontend && npm install && cd ..

# Monolith (if using server/ instead of services/)
cd server && npm install && cd ..
```

### 5. Run

**Microservices mode:**

```bash
# In separate terminals:
cd services/auth-service    && npm run dev   # :4001
cd services/garage-service  && npm run dev   # :4002
cd services/user-service    && npm run dev   # :4003
cd frontend                 && npm run dev   # :5173
```

**Monolith mode (quick dev):**

```bash
cd server   && npm run dev   # :5000
cd frontend && npm run dev   # :5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Schema

```sql
users      (id, email, password_hash, public_user_id, avatar_url, created_at)
cars       (id, user_id → users, brand, model, year, plate_number, created_at)
expenses   (id, car_id → cars, expense_type, amount, description,
            image_url, expense_date, is_public, created_at)
```

Indexes: `users.public_user_id`, `cars.user_id`, `expenses.car_id`

---

## 📡 API Reference

### Auth Service — `:4001`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register (email, password, username) |
| POST | `/api/auth/login` | — | Login (email or username + password) |
| GET | `/api/auth/me` | Bearer | Get current user |
| GET | `/health` | — | Health check |

### Garage Service — `:4002`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cars` | Bearer | List my cars |
| POST | `/api/cars` | Bearer | Add a car |
| PUT | `/api/cars/:id` | Bearer | Update a car |
| DELETE | `/api/cars/:id` | Bearer | Delete a car |
| GET | `/api/expenses/:carId` | Bearer | List expenses for a car |
| POST | `/api/expenses` | Bearer | Add expense (multipart, field `receipt`) |
| PUT | `/api/expenses/:id` | Bearer | Update expense |
| DELETE | `/api/expenses/:id` | Bearer | Delete expense |
| GET | `/api/public/users/:publicUserId/garage` | — | Public garage view |
| GET | `/health` | — | Health check |

### User Service — `:4003`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/search?q=<text>` | — | Search users by public ID |
| GET | `/api/users/profile/:publicUserId` | — | Get public profile + stats |
| GET | `/health` | — | Health check |

---

## 📸 Receipt / Avatar Uploads

Files are stored locally under `server/uploads/` and served as static assets at `/uploads/<filename>`. The `ARCHITECTURE_AND_API.md` describes an optional AWS S3 integration:

1. Create an S3 bucket.
2. Create an IAM user with `s3:PutObject` and `s3:GetObject` permissions.
3. Add the credentials to `services/garage-service/.env`:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-central-1
S3_BUCKET=your-bucket-name
```

---

## 🔐 Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10).
- All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.
- JWT tokens expire after **24 hours**.
- Do **not** commit real `.env` files — add them to `.gitignore`.

---

## 📄 License

MIT
