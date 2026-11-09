# RYDORA

RYDORA is a production-oriented, mobile-first tricycle booking system for Victoria, Oriental Mindoro. It has separate commuter, driver, and administrator experiences, with the backend as the authority for fares, permissions, booking status, driver assignment, and shared-ride capacity.

## What is included

- Vue 3 + Vite PWA client with role-based routing, Pinia state, custom responsive CSS, accessible controls, Leaflet maps, loading/empty/error states, and Socket.IO reconciliation.
- Express 5 modular monolith with Zod validation, Mongoose models, secure cookie authentication, refresh rotation, CSRF checks, role/ownership authorization, rate limits, Helmet, CORS, and structured Pino logs.
- Commuter pickup/drop-off selection, road-route fare estimates, shared/private ride selection, idempotent booking creation, live status, cancellation, notifications, and history.
- Driver approval and vehicle registration, online/offline controls, eligible request map, atomic acceptance, pickup/drop-off state controls, history, and earnings.
- Admin dashboard, account controls, driver approvals, booking monitoring, versioned fare policies, reports, and service-area APIs.
- Transactional outbox records for durable Socket.IO publication, plus a retry dispatcher for a single API process.
- Unit tests for concurrent acceptance, state transitions, shared capacity, non-shared exclusivity, reconnect reconciliation, unauthorized pickup, API error shape, and client UI behavior.

See [the implementation plan](docs/IMPLEMENTATION_PLAN.md) for architecture decisions and first-version limitations.

## Requirements

- Node.js 24.12 or newer
- npm 11 or newer
- Docker Desktop (recommended) or a transaction-capable MongoDB replica set

## Local setup

1. Copy environment examples:

   ```powershell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

2. Replace all three security secrets in `server/.env` with independent random values. Development defaults exist only to make tests and initial evaluation straightforward.

3. Start the development MongoDB replica set:

   ```powershell
   docker compose up -d mongo
   ```

   RYDORA uses host port `27018` so it does not conflict with a conventional standalone
   MongoDB instance on `27017`.

4. Install dependencies, seed clearly labelled development records, and start both apps:

   ```powershell
   npm.cmd install
   npm.cmd run seed
   npm.cmd run dev
   ```

5. Open `http://localhost:5173`.

The development seed password is `RydoraDemo!2026` unless `SEED_PASSWORD` is set. Seed accounts are:

- `commuter@rydora.local`
- `driver@rydora.local`
- `admin@rydora.local`

Never use these accounts or the sample fare/service-area records in production.

## Verification

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Production configuration

- Run MongoDB as a secured replica set so booking + ride + driver updates remain transactional.
- Set `NODE_ENV=production`, strong independent JWT/CSRF secrets, the exact HTTPS client origin, and a production MongoDB URI.
- Replace the development Nominatim and OSRM endpoints with approved commercial or self-hosted providers; review their attribution, rate, caching, and usage terms.
- Replace the development Victoria polygon with verified municipal GeoJSON through the service-area API.
- Serve the Vite `client/dist` output from a CDN/static host and the Express API behind TLS and a trusted reverse proxy.
- For multiple API instances, run a durable outbox worker and configure a supported Socket.IO cross-node adapter. Do not rely on process-local rooms across replicas.
- Set secure observability, backups, alerting, data retention, and secret rotation before handling real passengers.

## Core booking guarantee

Driver acceptance is a server-side transaction. The booking update requires `status=searching` and `assignedDriverId=null`; driver/ride capacity updates occur in the same transaction. Losing requests receive `BOOKING_UNAVAILABLE`. Outbox events are persisted inside that transaction and emitted only after commit, so other drivers remove the request and reconnecting clients rebuild state from MongoDB.

