# Afrochow Frontend

The customer, vendor, and admin web app for Afrochow, the African food marketplace for Canada. This is the Next.js application that lives at `afrochow.ca`. It talks to the Spring Boot API at `api.afrochow.ca` and handles everything a user actually sees: store discovery, menu browsing, the checkout flow, the vendor dashboard where restaurant owners manage their orders, and the admin console where platform operators manage vendors and customers.

## What you're looking at

This is a Next.js 16 App Router project with React 19, Tailwind v4, and the React Compiler enabled. The routing is segmented by audience:

* `src/app/(main)` is the public customer experience (home page, vendor discovery, cart, checkout, order tracking, profile). Anonymous visitors can browse and build a cart; auth only gates checkout.
* `src/app/(auth)` holds the sign-in and sign-up flows, plus email verification and password reset.
* `src/app/vendor` is the restaurant owner dashboard (menu management, order queue, earnings, Stripe Connect onboarding).
* `src/app/admin` is the platform admin console.
* `src/app/onboarding` is the post-signup route that picks between the vendor and customer onboarding flows.

Reusable UI and domain components live under `src/components`, with subfolders that mirror the app routes (`auth/`, `checkout/`, `vendor/`, `admin/`, `register/`) plus a shared `ui/` folder containing the shadcn-style primitives we've adapted.

## Stack

* **Next.js 16** with the App Router and React Server Components where it makes sense (vendor detail pages use `generateMetadata` so Open Graph previews work cleanly when a vendor link is shared on WhatsApp or Instagram).
* **React 19.2** with the React Compiler (`babel-plugin-react-compiler`) turned on, so most components don't need manual `useMemo`/`useCallback` for render-time memoisation. Don't add them reflexively.
* **Tailwind v4** with the new `@tailwindcss/postcss` plugin. Config lives in `postcss.config.mjs`, not `tailwind.config.js`. Colour tokens and radii are defined in `src/app/globals.css`.
* **Redux Toolkit** with `redux-persist` for the pieces of state that have to survive page reloads (auth tokens, the cart). Store is under `src/redux-store`.
* **React Context** for anything that doesn't need to persist (theme, toast state, the shared location picker). `src/contexts/CartContext.jsx` is the exception: it mirrors the Redux cart to `localStorage` so anonymous visitors don't lose their cart when they sign in.
* **React Hook Form + Zod** for every form. The resolvers live alongside each form.
* **Stripe** via `@stripe/react-stripe-js`. Payment collection happens on `/checkout`; Stripe Connect onboarding for vendors is kicked off from the vendor dashboard.
* **Google OAuth** via `@react-oauth/google` on the sign-in pages.
* **Framer Motion** for page transitions and the vendor dashboard charts.
* **Recharts** for the admin analytics dashboards.
* **Sonner** for toast notifications. Don't use `alert()` or a second toast library.
* **Three.js + React Three Fiber** only on the landing page hero. If you don't need 3D, don't import it; it's heavy.
* **ESLint 9** with `eslint-config-next`.

Production deploys to Vercel. Previews auto-deploy from branches.

## Prerequisites

* Node.js 20 or later
* npm 10+ (or pnpm, if you prefer; there's no lockfile for it yet)
* A running backend. In dev that's usually the Java API on `http://localhost:8080`; you can also point at the Railway staging API.

## Getting it running locally

```bash
git clone git@github.com:Ibikunleogunbanwo/afrochow_frontend.git
cd afrochow_frontend
npm install
cp .env.example .env.local   # or create .env.local by hand, see below
npm run dev
```

`npm run dev` starts Next on `http://localhost:3000` with Turbopack and Fast Refresh. The dev server allows requests from `10.0.0.149` in addition to localhost (see `allowedDevOrigins` in `next.config.mjs`); add your own LAN IP there if you want to hit the dev build from your phone.

### Environment variables

All of these go in `.env.local` (or `.env.development` if you prefer). Anything prefixed with `NEXT_PUBLIC_` is exposed to the browser, everything else stays server-side.

```bash
# Backend API base URL (include /api suffix, no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Google OAuth client for customer sign-in
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# App identity
NEXT_PUBLIC_APP_NAME=Afrochow
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (publishable key only; secret stays on the backend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary direct browser uploads (unsigned preset)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# IDE open-on-error (optional)
REACT_EDITOR=code
```

If you skip the Google client ID, the "Continue with Google" button will render but fail silently when clicked. If you skip the Cloudinary values, vendor image uploads will fall back to a broken preview in dev.

## npm scripts

* `npm run dev` starts the development server with Turbopack and the React Compiler.
* `npm run build` creates a production build. The build will fail on TypeScript errors (we set `ignoreBuildErrors: false`), so fix them before pushing.
* `npm start` runs the built output. Only useful for parity testing against prod.
* `npm run lint` runs ESLint across the repo.

## Project layout

```
src/
├── app/
│   ├── (auth)/             sign-in, sign-up, email verify, password reset
│   ├── (main)/             public customer routes (home, vendors, cart, checkout)
│   ├── admin/              admin console (vendor approval, user management, stats)
│   ├── vendor/             restaurant owner dashboard
│   ├── onboarding/         post-signup role router
│   ├── NotFoundPage/       shared 404
│   ├── ClientProviders.js  Redux, theme, auth, toast providers
│   ├── layout.js           root layout (fonts, metadata, providers)
│   └── globals.css         Tailwind imports + design tokens
├── components/
│   ├── admin/              admin-only components
│   ├── auth/               sign-in form, sign-up form, verification banners
│   ├── checkout/           cart page, checkout page, payment element wrapper
│   ├── customer/           customer profile, address book, orders list
│   ├── home/               landing page sections
│   ├── image-uploader/     Cloudinary-backed drag-and-drop
│   ├── register/           vendor and customer onboarding flows
│   ├── signin/             sign-in and sign-up modals (triggered from cart, share banner, etc.)
│   ├── ui/                 shadcn-style primitives (Button, Dialog, Sheet, etc.)
│   ├── vendor/             menu editor, order queue, earnings chart
│   ├── VendorDashboardLayout/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── LocationSearchInput.jsx
│   ├── LocationSelector.jsx
│   ├── Logo.jsx
│   └── UniversalButton.jsx
├── contexts/               React contexts (cart, theme, auth modal events)
├── hooks/                  useAuth, useLocation, and friends
├── lib/                    utilities (api client, formatters, zod schemas)
├── Data/                   static lookup data (cities, cuisines, etc.)
└── redux-store/            RTK slices, store config, persist setup
```

## Conventions worth following

* **Route groups are not URL segments.** `(auth)` and `(main)` in the app directory exist for layout inheritance; they don't appear in URLs.
* **Server components by default.** Add `"use client"` only when the component needs state, effects, browser APIs, or event handlers. A lot of pages are client components today because they use Redux or auth state, but the vendor detail layout is intentionally a server component so metadata works for share links.
* **Auth gating.** Browsing and cart-building are anonymous. The cart lives in `localStorage` via `CartContext`. The auth gate is at checkout: `CheckoutPage` checks `isAuthenticated`, and if the user isn't signed in it dispatches an `afrochow:open-auth-modal` CustomEvent and redirects to `/cart` with a toast. The sign-in modal reads `sessionStorage.returnTo` to bounce them back after auth.
* **API calls** go through `src/lib/api.js` (or the hooks that wrap it). Don't call `fetch` directly from components unless it's a deliberate RSC fetch with cache hints; the central client handles auth headers, 401 refresh, and toasts on non-2xx.
* **Public IDs only.** The backend uses `VEN-*`, `USR-*`, `ORD-*` IDs in URLs and API responses. Numeric DB IDs never appear in the frontend.
* **Toasts** come from `sonner`. Import `toast` from `sonner`, not anywhere else.
* **Images.** Use `next/image`. Remote hosts (Cloudinary, S3, backend) are allow-listed in `next.config.mjs`; add any new host there before importing.
* **Forms** should use React Hook Form with a Zod schema. Inline state for form fields is a code smell for anything more than a search box.

## Deployment

Vercel picks up pushes to `main` and promotes them to production. Preview deployments are created for every PR.

Environment variables for preview and production are configured in the Vercel project settings. Preview builds point at the Railway staging API; production points at `api.afrochow.ca`.

If you need to bust the CDN cache after a deploy (rare, since Vercel handles this), use the "Redeploy" button on the Vercel dashboard. `revalidatePath` and `revalidateTag` are preferred for targeted invalidation inside the app.

## Things that commonly trip people up

* **`Hydration mismatch` on the vendor detail page.** Usually caused by rendering a timestamp or random ID in a server component without passing it down as a prop. Move the randomness to a client component or generate it on the server and freeze it.
* **"Rendered more hooks than during the previous render"** in a page component. Check for a `useCallback`, `useMemo`, or `useEffect` declared after an early return. All hooks must run every render.
* **Sign-in completes but user lands on `/` instead of returning to the intended page.** Check you wrote the return path to `sessionStorage.setItem('returnTo', path)` as a raw string, not as JSON, and not to a different key. `useAuth.login` reads the `returnTo` key directly.
* **Images from the local backend 404 in dev.** Next's image optimiser blocks private IPs. `next.config.mjs` sets `unoptimized: true` in dev, so check your `NODE_ENV` is actually `development`.
* **Stripe Elements throws "You did not provide an API key"** on the checkout page. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing from `.env.local`.
* **CORS errors against the backend.** Make sure `CORS_ALLOWED_ORIGINS` on the backend includes your dev origin (`http://localhost:3000`) and that you're not hitting the backend over HTTPS when it's running on HTTP locally.

## Contributing

Branch naming: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`. Keep PRs focused; split renames and behavioural changes into separate commits so review is tractable. Run `npm run lint` and `npm run build` before pushing; Vercel will catch it if you don't, but the feedback loop is slower.

## Contact

Ibikunle Ogunbanwo, `ibikunleogunbanwo@gmail.com`.
