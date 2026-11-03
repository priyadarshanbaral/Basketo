# 🛒 Basketo - E-commerce Storefront

Basketo is a modern e-commerce storefront built with **TanStack Start**, **React 19**, and **Vite**. It features a high-performance product catalog, a persistent shopping cart, and an admin dashboard.

## 🚀 Key Architecture & Main Parts

### 1. Product Catalog (The Core)

The heart of the project is the product management system. It fetches data from an external API and transforms it for the store.

- **Main File:** `src/lib/products.functions.ts`
- **How it works:** It uses `createServerFn` from TanStack Start to create server-side functions that fetch data, map it to the `StoreProduct` type, and handle currency conversion (USD to INR).

### 2. Shopping Cart (State Management)

The cart uses a custom external store to ensure state is synchronized across the app and persisted in the browser.

- **Main File:** `src/lib/cart-store.ts`
- **Mechanism:** Uses `useSyncExternalStore` for React state synchronization and `localStorage` for persistence.

### 3. Routing & Pages

The project uses **TanStack Router** for type-safe routing.

- **Root Layout:** `src/routes/__root.tsx`
- **Shop Page:** `src/routes/shop.tsx` (Product listing and filtering)
- **Product Page:** `src/routes/product.$slug.tsx` (Detailed view)
- **Cart Page:** `src/routes/cart.tsx` (Checkout and quantity management)
- **Admin Dashboard:** `src/routes/admin.tsx` (Management view)

---

## 🔌 APIs & Data Sources

### 🗄️ MongoDB: Persistent Store Data

Copy `.env.example` to `.env`, set `MONGODB_URI` to your MongoDB connection string, and restart the server. The database name can be included in the URI path; otherwise Basketo uses the `basketo` database. MongoDB connection or write errors are returned to the dashboard instead of being reported as successful in-memory saves.

The server stores registered accounts in `registered_users` and per-account orders, addresses, wishlist items, notifications, and reviews in `user_data`. Existing per-account documents in the legacy `users` collection are read as a migration fallback.

### 🤖 AI Shopping Assistant

Set either `GEMINI_API_KEY` or `LOVABLE_API_KEY` in the server `.env` file and restart the server. The key must remain server-side; do not use a `VITE_` prefix or commit `.env`. The assistant uses Gemini for general answers, Basketo catalog searches, and questions about the project's verified routes, features, data flow, and setup. Its project guide is maintained in `src/routes/api/chat.ts`. Catalog recommendations can use the built-in Basketo products when the external catalog API is unavailable.

### 📦 Product Data: DummyJSON API

The storefront doesn't use a local database for products; it fetches real-time data from:

- **URL:** `https://dummyjson.com`
- **Usage:** Fetches products, categories, and search results.
- **Transformation:** Products are mapped from `DJProduct` $\rightarrow$ `StoreProduct` (e.g., converting USD prices to INR).

### 🔐 Backend & Auth: Supabase

Used for user authentication and potentially for admin-related data.

- **Integration:** `src/integrations/supabase/client.ts`
- **Configuration:** Managed via `.env` variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

### 🤖 AI Integration: Lovable AI Gateway

Provides AI capabilities via an OpenAI-compatible gateway.

- **Integration:** `src/lib/ai-gateway.server.ts`

---

## 🛠️ Debugging & Error Handling

### Where to Debug

- **Server Functions:** Check `src/lib/products.functions.ts` if products aren't loading or mapping is wrong.
- **Cart Issues:** Check `src/lib/cart-store.ts` if items aren't persisting or updating.
- **Routing/Navigation:** Check `src/router.tsx` and the `src/routes/` directory.

### Error Locations

- **Client-side Errors:** Caught by `src/lib/error-capture.ts` and reported via `src/lib/lovable-error-reporting.ts`.
- **API Failures:** The `fetchJson` function in `products.functions.ts` throws errors if the DummyJSON API returns a non-OK status.
- **Auth Errors:** Supabase client will throw errors if environment variables are missing.

---

## 📝 Summary for Explanation

When explaining this project to others, highlight these points:

1. **Tech Stack:** TanStack Start + React 19 + Vite + Tailwind CSS.
2. **Data Flow:** DummyJSON API $\rightarrow$ Server Functions $\rightarrow$ UI Components.
3. **State:** LocalStorage-backed Shopping Cart using `useSyncExternalStore`.
4. **Auth:** Supabase for secure user management.
5. **Server-side Rendering:** Heavy use of `createServerFn` to keep API keys secure and reduce client-side load.
