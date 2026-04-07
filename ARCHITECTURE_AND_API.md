# 1) Architecture

## Services

- **Auth Service** (`:4001`)
  - Register/login
  - JWT issuing and token validation (`/me`)
- **Garage Service** (`:4002`)
  - Cars CRUD
  - Expenses CRUD
  - Expense image upload to S3
- **User Service** (`:4003`)
  - Public profile read model
  - Search users by `publicUserId`

## Communication

- Frontend calls each service directly via REST.
- Garage Service validates JWT by calling Auth Service `/api/auth/me`.
- For MVP simplicity all services read the same PostgreSQL schema, but responsibilities stay split by API domain.

# 2) API Endpoints

## Auth Service

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /health`

## Garage Service

- `GET /api/cars` (Bearer)
- `POST /api/cars` (Bearer)
- `PUT /api/cars/:id` (Bearer)
- `DELETE /api/cars/:id` (Bearer)
- `GET /api/expenses/cars/:carId` (Bearer)
- `POST /api/expenses/cars/:carId` (Bearer, multipart form-data, image field `image`)
- `PUT /api/expenses/:id` (Bearer)
- `DELETE /api/expenses/:id` (Bearer)
- `GET /api/public/users/:publicUserId/garage` (Public)
- `GET /health`

## User Service

- `GET /api/users/search?q=<text>`
- `GET /api/users/profile/:publicUserId`
- `GET /health`
