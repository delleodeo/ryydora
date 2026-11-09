# RYDORA implementation plan

This build follows the phased plan in `projectplan.md`, with a vertical-slice-first delivery strategy so booking correctness is testable before feature breadth is expanded.

## Architecture decisions

- **Workspace:** npm workspaces keep the Vue client and Express server independently deployable while sharing one repository.
- **Backend:** modular monolith with route → controller → service → repository/model boundaries. Cross-module access goes through exported services.
- **Authentication:** short-lived access JWT and rotating refresh JWT in `httpOnly`, same-site cookies. Refresh sessions are hashed in MongoDB. Authorization is always enforced server-side.
- **Booking authority:** MongoDB conditional updates and transactions own assignment, seat allocation, and state transitions. Socket.IO broadcasts only after persistence succeeds.
- **Real-time recovery:** sockets are an optimization, not the source of truth. Reconnecting drivers fetch available bookings and active assignments from REST before subscribing to updates.
- **Maps:** Leaflet with OpenStreetMap tiles. Routing and geocoding URLs are environment-configurable; the public defaults are for local development only.
- **Progressive web app:** Vite PWA generates the service worker and manifest; API requests use a network-only strategy so stale booking state is never presented as authoritative.
- **Testing:** booking policies are dependency-injected and unit-tested deterministically. HTTP behavior uses Supertest. Client stores/components use Vitest and Vue Test Utils.

## Delivery phases

1. **Foundation (included):** workspace, design tokens, reusable controls, authentication/RBAC, role layouts, error handling, logging, environment validation, PWA.
2. **Core UI (included):** commuter, driver, and admin navigation; map-first dashboards; location selection; ride options; booking status/history; admin operational views.
3. **Booking engine (included):** fare estimates, service-area validation, create/cancel, atomic driver acceptance, enforced state transitions, shared-seat allocation, non-shared conflict prevention.
4. **Real time (included):** authenticated rooms, authorized event payloads, booking removal/update events, location updates, reconnect reconciliation.
5. **Production hardening (documented next):** transactional outbox worker, production geocoder/router credentials, exact municipal GeoJSON maintained by administrators, object storage for uploads, email/SMS verification, and multi-instance Socket.IO adapter.

## Important limitations in this first repository version

- The included Victoria service-area polygon is a conservative development boundary, not a legal municipal boundary. Replace it through the admin service-area workflow with verified GeoJSON before production.
- The default OSRM and Nominatim endpoints are suitable for development and evaluation only. Configure commercial or self-hosted providers before launch and comply with each provider's usage policy.
- A transaction-capable MongoDB replica set is required for atomic ride + booking updates. The provided Docker Compose service initializes a single-node development replica set.
- The transactional outbox schema and dispatcher interface are included in the design, but production-grade cross-process delivery requires a durable worker and a Socket.IO adapter such as Redis or MongoDB.

