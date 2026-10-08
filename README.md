# AI Interior Makeover

A React Native app that turns a room photo into an interior design concept. The current development build includes a four-tab shell, photo configuration, device-local drafts, and a clearly labeled simulated makeover flow. Live authentication, private uploads, AI generation, and purchases are not connected yet.

## Run the development demo

Install dependencies with `pnpm install`, then start Expo with `pnpm start:demo` (or `pnpm start`, which defaults to demo mode in development). Run `pnpm typecheck` to check TypeScript. Native builds require Xcode or Android Studio and can be started with `pnpm run run:ios` or `pnpm run run:android`; use `pnpm run dev-client` after installing a development build.

Demo generation and purchase behavior is local simulation only. It does not upload photos, create live AI results, grant credits, or process payments. Production configuration fails closed unless `EXPO_PUBLIC_APP_MODE=live` is set, and live services still need implementation.

## Technology

React Native, TypeScript, Expo, Zustand, and NativeBase. Supabase and n8n are planned for backend authentication, private storage, and generation orchestration. Client configuration examples are in `.env.example` and `supabase/.env.example`; they contain no credentials.

## Development notes

App identifiers are development placeholders and must be changed before distribution. Starter, Plus, and Premium credit allowances are illustrative examples, not approved commercial terms. Final prices, currency, retention, and refund policies need decisions before launch.
