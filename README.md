# Re:Buy

Sustainable marketplace for second-hand goods (SDG 12). Monorepo with an Express API, a Next.js app, and shared contracts.

## Prerequisites

- Node.js >= 20.19
- npm 11+
- Docker (MongoDB, MinIO, Mailpit)

## Setup

```bash
npm install
```

Create the backend env file (the API loads `.env.${NODE_ENV}`, not `.env`):

```bash
cp backend-express-ts/.env.example backend-express-ts/.env.development
```

Create the frontend env file:

```bash
cp frontend-next/.env.example frontend-next/.env.local
```

Build the shared contracts once (or run `npm run dev --workspace @rebuy/contracts` in a separate terminal):

```bash
npm run build --workspace @rebuy/contracts
```

## Local infrastructure

Containers are **not** started automatically. Start and stop them manually:

```bash
docker compose up -d
docker compose down
```

Services:

| Service | URL |
| --- | --- |
| MongoDB | `mongodb://localhost:27017/rebuy` |
| MinIO API | `http://localhost:9000` |
| MinIO console | `http://localhost:9001` |
| Mailpit UI | `http://localhost:8025` |

## Development

```bash
npm run dev          # API + web
npm run dev:api      # API only
npm run dev:web      # web only
```

Both apps default to port 3000, so change `PORT` in `backend-express-ts/.env.development` or run Next with another port when running them together.

Seed the admin user manually:

```bash
npm run seed
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Structure

```
backend-express-ts/   Express 5 + Mongoose 9 API
frontend-next/        Next.js 16 App Router
packages/contracts/   Shared zod schemas, DTOs, and enums
compose.yaml          MongoDB, MinIO, Mailpit (manual start)
```
