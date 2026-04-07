# Car Garage & Expense Tracker (Microservices MVP)

Simple diploma-level microservices project with:
- Auth Service (register/login/JWT)
- Garage Service (cars + expenses + S3 images)
- User/Profile Service (public profile + search)
- React frontend (Vite-style)
- PostgreSQL database

## Services

- `services/auth-service` - authentication and user identity
- `services/garage-service` - cars, expenses, expense image uploads to S3
- `services/user-service` - public user search and profile view
- `frontend` - React app
- `database/schema.sql` - PostgreSQL schema

## Quick Start

See detailed setup in this file's "Run Locally" section.

### Run Locally

1. Create database and run schema:
   - Create PostgreSQL database: `garage_tracker`
   - Run SQL from `database/schema.sql`
2. Configure `.env` files (copy from each `.env.example`)
3. Install dependencies in each service and frontend:
   - `npm install`
4. Start services:
   - Auth: `npm run dev` on port 4001
   - Garage: `npm run dev` on port 4002
   - User: `npm run dev` on port 4003
   - Frontend: `npm run dev` on port 5173

## Minimal AWS Setup

- Create S3 bucket
- Create IAM user with `s3:PutObject` and `s3:GetObject` to bucket
- Put keys in `services/garage-service/.env`

## Architecture Note

This is intentionally simple. For MVP clarity, all services use one PostgreSQL database, but responsibilities are split by service and API boundaries.
