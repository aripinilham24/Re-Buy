# API Reference

Base URL: `/api/v1`. Auth uses httpOnly cookies: `token` (access, 15m) and `refreshToken` (rotation, 7d). Protected endpoints require the access cookie. Admin endpoints require role `admin`.

Response envelope:

```json
{ "success": true, "message": "OK", "data": {}, "meta": { "nextCursor": null, "hasMore": false } }
```

Errors add `code` and optional `details`.

## Public

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/categories` | Active categories |
| GET | `/products` | Catalog list (`q`, `category`, `condition`, `minPrice`, `maxPrice`, `sort`, `limit`, `cursor`) |
| GET | `/products/:slug` | Product detail |
| GET | `/reviews/product/:productId` | Product reviews |
| POST | `/payments/midtrans/notification` | Midtrans webhook (signature verified) |

## Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register and send verification email |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/resend-verification` | Resend verification |
| POST | `/auth/login` | Login, sets cookies |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke refresh token and clear cookies |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password |
| PATCH | `/auth/password` | Change password (auth) |
| GET | `/auth/me` | Current user (auth) |

## User

| Method | Path | Description |
| --- | --- | --- |
| GET/PATCH | `/users/me` | Profile |
| GET/POST | `/users/me/addresses` | List/create addresses |
| PATCH/DELETE | `/users/me/addresses/:addressId` | Update/delete address |
| PATCH | `/users/me/addresses/:addressId/default` | Set default address |
| GET | `/wishlist` | Wishlist |
| POST/DELETE | `/wishlist/:productId` | Add/remove wishlist item |
| GET | `/cart` | Cart |
| POST | `/cart/items` | Add cart item |
| PATCH/DELETE | `/cart/items/:productId` | Update/remove cart item |
| DELETE | `/cart` | Clear cart |
| GET | `/orders/quote` | Checkout totals (`couponCode`) |
| POST | `/orders/checkout` | Create order |
| GET | `/orders` | Order history |
| GET | `/orders/:orderId` | Order detail |
| POST | `/orders/:orderId/cancel` | Cancel pending order |
| POST | `/payments/:orderId` | Create Midtrans Snap payment |
| GET | `/payments/:orderId` | Payment status |
| POST | `/payments/:orderId/sync` | Reconcile with Midtrans |
| POST | `/coupons/validate` | Validate coupon against current cart |
| GET | `/reviews/eligibility/:productId` | Review eligibility |
| POST | `/reviews` | Create review for completed order |
| GET | `/notifications` | Notification list |
| GET | `/notifications/unread-count` | Unread count |
| PATCH | `/notifications/:notificationId/read` | Mark one read |
| PATCH | `/notifications/read-all` | Mark all read |
| GET | `/chat/conversation` | Get/create support conversation |
| GET/POST | `/chat/messages` | List/send user messages |
| POST | `/uploads/presign` | Admin-only presigned MinIO upload |

## Admin

| Method | Path | Description |
| --- | --- | --- |
| GET | `/admin/stats` | Dashboard statistics |
| GET | `/admin/categories` | All categories |
| POST/PATCH/DELETE | `/admin/categories...` | Category CRUD |
| GET | `/admin/products` | Product list (`status`) |
| POST/PATCH/DELETE | `/admin/products...` | Product CRUD |
| GET | `/admin/coupons` | Coupon list |
| POST/PATCH/DELETE | `/admin/coupons...` | Coupon CRUD |
| GET | `/admin/orders` | Order list |
| GET | `/admin/orders/:orderId` | Order detail |
| PATCH | `/admin/orders/:orderId/status` | Transition status / set tracking |
| GET | `/admin/reviews` | Review list |
| PATCH | `/admin/reviews/:reviewId/reply` | Reply to review |
| DELETE | `/admin/reviews/:reviewId` | Delete review |
| GET | `/admin/chat/conversations` | Support inbox |
| GET/POST | `/admin/chat/conversations/:conversationId/messages` | Read/reply |
| GET | `/admin/users` | User list (`q`, cursor) |
| PATCH | `/admin/users/:userId` | Block/unblock or change role |
| GET/PATCH | `/admin/settings` | Store name, description, flat shipping rate |
