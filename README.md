# Re:Buy

Sustainable marketplace for second-hand goods (SDG 12). Single-seller storefront with buyer accounts, admin catalog management, checkout, Midtrans payments, reviews, wishlist, support chat, and in-app notifications.

## Stack

- `backend-express-ts/` — Express 5, Mongoose 9, TypeScript ESM, JWT cookies, Socket.IO, MinIO S3, Midtrans Snap.
- `frontend-next/` — Next.js 16 App Router, React 19, Tailwind v4, shadcn, TanStack Query, Zustand, axios.
- `packages/contracts/` — shared zod schemas, DTOs, and enums (`@rebuy/contracts`).
- `compose.yaml` — MongoDB 8, MinIO, MinIO bucket init, Mailpit. Containers are started manually.

## Prerequisites

- Node.js >= 20.19
- npm 11+
- Docker (MongoDB, MinIO, Mailpit)

## Setup

```bash
npm install
```

Backend env (the API loads `.env.${NODE_ENV}`, not `.env`):

```bash
cp backend-express-ts/.env.example backend-express-ts/.env.development
```

Frontend env:

```bash
cp frontend-next/.env.example frontend-next/.env.local
```

Build shared contracts once before the first typecheck/dev run:

```bash
npm run build --workspace @rebuy/contracts
```

## Local infrastructure

Containers are **not** started automatically by npm, the API, or the frontend.

```bash
docker compose up -d
docker compose down
```

| Service | URL |
| --- | --- |
| MongoDB | `mongodb://localhost:27017/rebuy` |
| MinIO API | `http://localhost:9000` |
| MinIO console | `http://localhost:9001` |
| Mailpit UI | `http://localhost:8025` |

Default MinIO credentials: `rebuy` / `rebuy12345`. The `minio-init` service creates the `rebuy` bucket and public read access for `products/`.

## Development

```bash
npm run dev          # API + web
npm run dev:api      # API only, port 5000
npm run dev:web      # web only, port 3000
```

The frontend proxies `/api/*` to `API_PROXY_URL` (default `http://localhost:5000`) and calls `/api/v1` same-origin, so auth cookies work without CORS issues in the browser. Socket.IO connects directly to `NEXT_PUBLIC_SOCKET_URL`.

Seed demo data manually (admin user, categories, products, coupon `HEMAT10`):

```bash
npm run seed
```

Admin credentials come from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_USERNAME` in the backend env.

## Payments (Midtrans)

Set in `backend-express-ts/.env.development`:

```bash
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=false
```

Set the public client key in `frontend-next/.env.local`:

```bash
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

Webhook URL for Midtrans sandbox:

```text
https://<your-public-tunnel>/api/v1/payments/midtrans/notification
```

Local development needs a tunnel (ngrok/cloudflared) because Midtrans calls the webhook from the internet. The order page also has a sync action after Snap closes, so status can be reconciled without a webhook.

## API and features

- Auth: register, email verification, login, refresh rotation, logout, forgot/reset/change password.
- Users: profile and shipping addresses.
- Catalog: categories, products, cursor pagination, search/filter/sort, wishlist, presigned MinIO uploads.
- Commerce: cart, coupon validation, atomic checkout, stock restoration on cancel/expire, order state machine.
- Payments: Midtrans Snap token, signed webhook, status sync.
- Engagement: reviews with rating aggregation, in-app notifications, user-admin chat over Socket.IO.
- Admin: product/category/coupon/order management, review moderation, chat inbox, users, store settings, dashboard stats.

Endpoint reference: [`docs/API.md`](docs/API.md).

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Backend tests use Vitest + Supertest + `mongodb-memory-server`; frontend tests use Vitest + jsdom + Testing Library.

## Operational notes

- Checkout uses atomic conditional stock updates plus compensating rollback instead of Mongo transactions, so the local standalone MongoDB works. If you move to a replica set, checkout can be migrated to transactions.
- Socket.IO runs single-instance. For horizontal scaling, add the Redis adapter and sticky sessions.
- In-app notifications are also persisted, so missed socket events are visible on `/notifications`.
- Images are stored in MinIO and served from `S3_PUBLIC_URL`; configure `NEXT_PUBLIC_IMAGE_URL` to match for `next/image`.
- Refunds and payouts are manual through the admin screens.
