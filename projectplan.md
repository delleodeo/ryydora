# RYDORA — Full-Stack Tricycle Booking System

## Project Overview

Develop a complete, production-oriented, mobile-first tricycle booking application called **RYDORA: A Tricycle Booking System in Victoria, Oriental Mindoro**.

RYDORA is a real-time transportation booking platform that connects commuters with available tricycle drivers within Victoria, Oriental Mindoro, Philippines.

The application must provide a modern, intuitive, accessible, and responsive user experience.

There are three user roles:

1. **Commuter** — Requests tricycle rides, selects shared or non-shared transportation, and tracks bookings.
2. **Driver** — Views waiting commuters on a real-time Leaflet map, accepts ride requests, and manages ongoing trips.
3. **Admin** — Manages commuters, drivers, bookings, fares, and overall platform operations.

The system should work as a Progressive Web App (PWA) so commuters and drivers can conveniently access it on smartphones.

---

# 1. Technology Stack

## Frontend

Use the following technologies:

- Vue.js 3 — Composition API with `<script setup>`
- Vite — Development and production builds
- Pinia — Global state management
- Vue Router — Navigation and role-based routing
- Pure CSS — Custom modern styling using CSS variables and reusable components
- Leaflet.js — Interactive maps
- Vue Leaflet or direct Leaflet integration
- OpenStreetMap — Map tiles
- Socket.IO Client — Real-time communication
- Axios — HTTP client
- Lucide icons — Consistent iconography
- VueUse — Useful composables
- Vite PWA Plugin — Progressive Web App support

Avoid using heavy UI frameworks such as Bootstrap, Vuetify, or Tailwind CSS.

Implement reusable Vue components using custom CSS to maintain a distinctive RYDORA design identity.

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs
- Zod or Joi for request validation
- Helmet
- CORS
- Express Rate Limit
- Pino for structured logging

## Architecture

**Use a modular monolith architecture.**

The application must have one deployable backend, with independent, clearly separated business modules.

Do not implement microservices.

Each module must contain its own routes, controllers, services, models, and validators as needed.

Follow:

**Route → Controller → Service → Model**

Responsibilities:

- Routes define endpoints and middleware.
- Controllers handle HTTP requests and responses.
- Services contain business logic.
- Models handle persistence and database structures.
- Validators ensure data integrity.
- Socket handlers provide real-time event communication.

Controllers must remain thin.

Do not put business logic directly inside routes, controllers, or Socket.IO handlers.

---

# 2. Project Structure

Use the following structure:

```text
rydora/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── ui/
│   │   │   ├── maps/
│   │   │   ├── bookings/
│   │   │   └── navigation/
│   │   │
│   │   ├── layouts/
│   │   │   ├── AuthLayout.vue
│   │   │   ├── CommuterLayout.vue
│   │   │   ├── DriverLayout.vue
│   │   │   └── AdminLayout.vue
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── commuter/
│   │   │   ├── driver/
│   │   │   └── admin/
│   │   │
│   │   ├── composables/
│   │   │   ├── useGeolocation.js
│   │   │   ├── useSocket.js
│   │   │   └── useLeaflet.js
│   │   │
│   │   ├── stores/
│   │   ├── router/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.vue
│   │   └── main.js
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── shared/
│   │   │   ├── errors/
│   │   │   ├── events/
│   │   │   └── utils/
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── drivers/
│   │   │   ├── bookings/
│   │   │   ├── rides/
│   │   │   ├── locations/
│   │   │   ├── fares/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   │
│   │   ├── sockets/
│   │   │   ├── socketServer.js
│   │   │   ├── socketAuth.js
│   │   │   └── socketRooms.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

Each backend module must expose its public functionality through a defined service interface.

Avoid unnecessary circular dependencies between modules.

---

# 3. UI/UX Design Requirements

Create a modern, premium-looking, mobile-first interface inspired by contemporary transportation and ride-hailing applications.

The interface must feel polished, clean, lightweight, and easy to navigate.

## Design System

**Primary color:** Emerald Green — `#059669`

**Primary Dark:** `#047857`

**Accent Green:** `#10B981`

**Background:** `#F8FAFC`

**Surface:** `#FFFFFF`

**Primary Text:** `#0F172A`

**Secondary Text:** `#64748B`

**Border:** `#E2E8F0`

**Danger:** `#EF4444`

**Warning:** `#F59E0B`

Use:

- Inter or a similarly modern sans-serif font
- Rounded cards (12–20px)
- Subtle shadows
- Comfortable whitespace
- Clear visual hierarchy
- Skeleton loaders
- Smooth transitions
- Toast notifications
- Bottom sheets for map-based interactions
- Touch-friendly controls
- Accessible contrast ratios
- Loading, empty, success, and error states

## Mobile-First Requirements

Design commuter and driver screens primarily for mobile devices.

Use:

- Bottom navigation
- Full-screen interactive maps
- Floating location controls
- Sticky booking actions
- Slide-up booking panels
- Large buttons
- Clear ride status indicators

Support desktop layouts without breaking the mobile experience.

## Admin Design

Create a professional responsive dashboard with:

- Collapsible sidebar on desktop
- Mobile navigation drawer
- Statistics cards
- Searchable data tables
- Filters and pagination
- Charts
- Confirmation dialogs
- Real-time status indicators

---

# 4. Authentication and Authorization

Implement secure authentication with three roles:

```js
const ROLES = {
  ADMIN: "admin",
  DRIVER: "driver",
  COMMUTER: "commuter"
};
```

Implement:

- Account registration
- Login
- Logout
- Password hashing
- Protected routes
- Role-based access control
- Refresh token handling
- Secure JWT authentication using httpOnly cookies
- Account suspension
- Profile updates
- Driver approval by administrators

Only approved driver accounts can go online and accept ride requests.

Never trust a user role sent from the frontend.

Enforce all permissions on the backend.

---

# 5. Commuter Features

## 5.1 Commuter Dashboard

Build an attractive map-based home screen.

The dashboard must contain:

- Personalized greeting
- Current location
- Leaflet map
- Pickup selection
- Destination selection
- Shared and non-shared ride options
- Booking button
- Booking history
- Current ride information
- Profile management

Use browser geolocation to determine the commuter's location after receiving permission.

Allow commuters to manually select a pickup location if location access is unavailable.

Only allow pickup and drop-off locations within the configured service area, unless an administrator explicitly changes the service area.

## 5.2 Pickup Location

Provide a full-screen Leaflet interface where commuters can:

- Use current location
- Move the map
- Select a marker position
- Choose a pickup point
- Confirm pickup location

Display:

- Pickup marker
- Location details
- Confirm Pickup button

## 5.3 Destination Selection

Allow commuters to:

- Select a destination on the map
- Search for a destination through an appropriately configured geocoding service
- Review pickup and destination markers
- View an estimated route and distance

Use a configurable routing service for actual road routes.

Do not calculate routing distance using straight-line distance alone.

## 5.4 Shared and Non-Shared Rides

Provide two ride options.

### Shared Ride

Commuters can share the tricycle with other commuters.

Requirements:

- Lower individual fare
- Multiple passengers may belong to one ride
- Driver can accept additional passengers if available capacity permits
- Display the number of available seats
- Do not allow bookings beyond the configured vehicle capacity
- Display passenger pickup locations on the driver map

Shared ride pricing must be configurable by administrators.

### Non-Shared Ride

Commuters reserve the entire tricycle.

Requirements:

- Exclusive use of the tricycle
- No additional passengers can join
- Commuter pays the full exclusive ride fare
- Vehicle becomes unavailable to other bookings during the trip
- Display estimated fare before confirmation

**Important:** Fare amounts must not be hardcoded. Build configurable fare rules for Victoria, Oriental Mindoro.

## 5.5 Booking Confirmation

After booking, display:

- Booking ID
- Ride type
- Pickup location
- Destination
- Estimated fare
- Booking status
- Assigned driver's information, once accepted
- Cancel Booking button, when cancellation is allowed

Possible booking statuses:

```js
const BOOKING_STATUS = {
  SEARCHING: "searching",
  ACCEPTED: "accepted",
  DRIVER_ARRIVING: "driver_arriving",
  PICKED_UP: "picked_up",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired"
};
```

All booking status changes must originate from verified backend operations.

## 5.6 Live Booking Tracking

Once a driver accepts a booking:

- Display the assigned driver
- Show driver location on the map
- Display booking progress
- Provide status notifications
- Show the route toward pickup
- Update driver location in real time

Once the passenger is picked up, display an active ride screen.

---

# 6. Driver Features

The driver interface is one of the most important parts of RYDORA.

## 6.1 Driver Dashboard

Create a map-first driver dashboard.

Display:

- Driver's current GPS location
- Online/offline toggle
- Waiting commuter markers
- Available booking requests
- Active ride information
- Earnings summary
- Completed ride count

Use different marker styles:

- Blue marker — Current driver location
- Green marker — Available commuter request
- Orange marker — Assigned pickup location
- Red marker — Active destination

Only show available requests the driver is eligible to accept.

Do not show cancelled, expired, already-assigned, or already-picked-up bookings as available.

## 6.2 Real-Time Waiting Commuters

When a commuter creates a booking, the system must immediately notify eligible online drivers.

Display a commuter marker on the Leaflet map.

When a driver selects a marker, show a bottom sheet containing:

- Pickup location
- Destination
- Ride type
- Estimated fare
- Number of passengers
- Distance to pickup, when supported
- Accept Booking button

For privacy, do not expose the commuter's personal information or precise location history to unassigned drivers.

## 6.3 Accepting a Booking

When a driver clicks Accept Booking:

1. Send the request to the backend.
2. Validate the driver's account and availability.
3. Validate the booking is still available.
4. Atomically assign the booking to the driver.
5. Update the booking status to `accepted`.
6. Notify the commuter.
7. Notify all other eligible drivers.
8. Remove the booking from other drivers' available booking lists.
9. Update the driver's current assignment.

The frontend must never decide which driver successfully owns a booking.

**The backend is the single source of truth.**

## 6.4 Passenger Pickup Confirmation

When a driver reaches the pickup location, display:

**Mark Passenger as Picked Up**

When the driver confirms pickup:

1. Verify that the booking belongs to the authenticated driver.
2. Verify that the booking is in a valid state for pickup.
3. Update the booking status to `picked_up`.
4. Record the pickup timestamp.
5. Update the trip state.
6. Notify the assigned commuter.
7. Synchronize the update with other connected drivers and administrators.

The passenger must no longer appear as waiting or available for pickup.

## 6.5 Completing a Ride

When the driver reaches the destination:

- Display Complete Ride
- Validate the active booking
- Update the booking to `completed`
- Record the completion timestamp
- Record the final fare
- Update driver trip statistics
- Release occupied seats
- Notify the commuter
- Update the admin dashboard

For a shared ride, the driver may continue the overall trip while other passengers remain onboard.

---

# 7. Critical Feature: Real-Time Booking Synchronization

**This is a mandatory core requirement.**

The system must prevent two drivers from picking up or claiming the same commuter booking.

### Example Scenario

A commuter named Maria books a tricycle.

Three available drivers receive the booking:

- Driver A
- Driver B
- Driver C

All three drivers initially see Maria's waiting marker on the map.

Driver A accepts Maria's booking.

Immediately:

- Maria's booking becomes assigned to Driver A.
- Driver B's map removes Maria's available booking marker.
- Driver C's map removes Maria's available booking marker.
- Driver B and Driver C can no longer accept Maria's request.
- Maria receives a notification that Driver A accepted the booking.

When Driver A picks up Maria:

- Maria's booking status changes to `picked_up`.
- Maria's commuter interface updates automatically.
- The admin dashboard updates automatically.
- Maria must not appear on any other driver's waiting commuter map.

### Required Socket.IO Events

```js
// Server -> eligible drivers
"booking:new"
"booking:removed"
"booking:updated"

// Server -> assigned driver and commuter
"booking:accepted"
"booking:status_changed"

// Server -> relevant participants
"driver:location_updated"
"ride:updated"

// Server -> admin
"admin:booking_updated"
```

Keep Socket.IO event payloads minimal and authorized.

Use socket rooms such as:

```text
user:{userId}
driver:{driverId}
booking:{bookingId}
admin
drivers:available:{serviceArea}
```

Verify user identity and permissions during the Socket.IO connection and for every sensitive event.

## Atomic Booking Assignment

Use an atomic conditional database update.

Illustrative implementation:

```js
const booking = await Booking.findOneAndUpdate(
  {
    _id: bookingId,
    status: "searching",
    assignedDriver: null
  },
  {
    $set: {
      status: "accepted",
      assignedDriver: driverId,
      acceptedAt: new Date()
    }
  },
  { new: true }
);
```

If the operation returns `null`, the booking is no longer available.

Return:

```json
{
  "success": false,
  "code": "BOOKING_UNAVAILABLE",
  "message": "This booking has already been accepted or is no longer available."
}
```

For production, implement assignment and driver availability updates together using MongoDB transactions or another concurrency-safe reservation mechanism.

Prevent a driver from accepting conflicting assignments.

Only commit assignment once all required validation and state updates succeed.

Emit Socket.IO events **after the database transaction successfully commits**.

For stronger reliability, use a transactional outbox or equivalent retry mechanism so committed booking changes are eventually broadcast even after a process interruption.

## Reconnection Handling

When a driver reconnects:

1. Authenticate the socket.
2. Fetch currently available bookings.
3. Fetch the driver's active assignments.
4. Reconcile the frontend state with the database.
5. Rebuild the Leaflet booking markers.

Never assume the frontend's previously cached waiting commuters are still available.

Socket.IO is used for real-time notifications, but MongoDB remains the authoritative state.

---

# 8. Shared Ride Management

Shared rides require special handling.

A shared tricycle ride can contain multiple passenger bookings.

Suggested data relationships:

```text
Driver
   |
   └── Ride
        ├── Booking A
        ├── Booking B
        └── Booking C
```

Each passenger booking must have its own:

- Pickup location
- Destination
- Booking status
- Pickup timestamp
- Drop-off timestamp
- Fare
- Passenger count

The overall ride has:

- Assigned driver
- Vehicle
- Maximum capacity
- Occupied seats
- Available seats
- Ride status

## Shared Ride Logic

If the driver has available seats and shared booking acceptance is permitted:

- Show eligible nearby shared-ride requests.
- Allow the driver to accept an additional passenger.
- Atomically reserve the required seats.
- Check that vehicle capacity is not exceeded.
- Ensure the new pickup is compatible with the ongoing trip.
- Update the route and pickup sequence.

A shared booking becomes unavailable to other drivers once assigned.

However, the assigned driver may still have available seats for other compatible shared bookings.

## Important Rules

- Non-shared rides cannot contain multiple independent passenger bookings.
- Shared rides must respect vehicle passenger capacity.
- Capacity is based on total booked passenger seats, not simply booking count.
- Each shared passenger can have an independent booking status.
- Completing one passenger's drop-off must not automatically complete the entire shared ride.
- A shared ride is completed when all assigned passengers have been dropped off and no active pickups remain.
- The driver must not be considered fully available merely because one shared passenger has completed their booking.

For the initial MVP, use a simple, configurable route compatibility rule and explicitly document its limitations.

---

# 9. Booking State Machine

Implement backend-enforced state transitions.

Example:

```text
SEARCHING
   |
   v
ACCEPTED
   |
   v
DRIVER_ARRIVING
   |
   v
PICKED_UP
   |
   v
COMPLETED
```

Cancellation and expiration must be handled separately.

Examples:

- A commuter may cancel an unaccepted booking.
- An accepted booking can only be cancelled under configured rules.
- A completed booking cannot be reopened through a normal client request.
- Only the assigned driver can confirm passenger pickup.
- Only an authorized driver can complete a passenger's trip.
- Drivers cannot accept cancelled or expired bookings.

Use a transition validation service.

Store booking state change history for auditing.

---

# 10. Admin Features

Create an administrative dashboard with the following modules.

## Dashboard Overview

Display:

- Total registered commuters
- Total registered drivers
- Currently online drivers
- Available drivers
- Waiting bookings
- Active rides
- Completed bookings
- Cancelled bookings

Use real-time updates for operational metrics.

## User Management

Admin can:

- View commuters
- Search users
- View profiles
- Suspend accounts
- Reactivate accounts

## Driver Management

Admin can:

- Review driver applications
- Approve or reject applications
- View driver details
- Set driver account status
- View driver booking history
- Manage vehicle information

## Booking Management

Admin can:

- View all bookings
- Filter by booking status
- Filter by date
- Filter by driver
- View pickup and destination information
- View assigned driver
- View fare details
- Review booking history

## Fare Management

Create configurable pricing rules for:

- Shared rides
- Non-shared rides
- Distance-based calculations, if enabled
- Minimum fares
- Additional distance charges
- Future pricing adjustments

Use Philippine Peso currency formatting.

Never hardcode the displayed example fares into production logic.

## Service Area Management

Allow administrators to configure the geographic coverage for Victoria, Oriental Mindoro.

Use GeoJSON polygons or another valid spatial boundary representation.

Do not assume administrative boundaries are identical to a simple circular radius.

## Reports and Analytics

Provide:

- Daily bookings
- Weekly bookings
- Monthly bookings
- Completed versus cancelled bookings
- Driver activity
- Fare totals
- Shared versus non-shared bookings

Ensure analytics are calculated using real database records.

---

# 11. MongoDB Database Models

Design well-structured Mongoose schemas.

## User

```text
_id
firstName
lastName
email
phone
passwordHash
role
avatar
accountStatus
createdAt
updatedAt
```

## Driver

```text
_id
userId
vehicleId
approvalStatus
availabilityStatus
currentLocation
lastLocationUpdate
createdAt
updatedAt
```

## Vehicle

```text
_id
driverId
plateNumber
bodyNumber
maximumPassengerCapacity
vehicleStatus
createdAt
updatedAt
```

## Booking

```text
_id
commuterId
assignedDriverId
rideId
rideType
passengerCount
pickupLocation
dropoffLocation
estimatedFare
finalFare
status
acceptedAt
pickedUpAt
completedAt
cancelledAt
createdAt
updatedAt
```

## Ride

```text
_id
driverId
vehicleId
rideType
bookingIds
status
maximumCapacity
occupiedSeats
startedAt
completedAt
createdAt
updatedAt
```

## FareSettings

```text
_id
rideType
minimumFare
baseFare
perKilometerRate
effectiveFrom
isActive
updatedBy
createdAt
updatedAt
```

## BookingStatusHistory

```text
_id
bookingId
previousStatus
newStatus
changedBy
timestamp
reason
```

Use MongoDB GeoJSON points for locations:

```js
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

Create appropriate `2dsphere` indexes and operational indexes.

Use TTL or appropriate cleanup policies for temporary data, but never automatically delete audit-critical booking history.

---

# 12. REST API Requirements

Implement versioned endpoints.

## Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

## Commuter Bookings

```text
POST   /api/v1/bookings
GET    /api/v1/bookings/my
GET    /api/v1/bookings/:id
POST   /api/v1/bookings/:id/cancel
```

## Driver

```text
GET    /api/v1/drivers/me
PATCH  /api/v1/drivers/availability
PATCH  /api/v1/drivers/location
GET    /api/v1/drivers/available-bookings
POST   /api/v1/drivers/bookings/:id/accept
POST   /api/v1/drivers/bookings/:id/arriving
POST   /api/v1/drivers/bookings/:id/pickup
POST   /api/v1/drivers/bookings/:id/complete
GET    /api/v1/drivers/earnings
```

## Administration

```text
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/drivers
PATCH  /api/v1/admin/drivers/:id/approval
GET    /api/v1/admin/bookings
GET    /api/v1/admin/reports
GET    /api/v1/admin/fares
PATCH  /api/v1/admin/fares/:id
```

Use consistent API response formats, validation, pagination, and error handling.

---

# 13. Leaflet Map Requirements

Implement Leaflet as a reusable application module.

Required functionality:

- Display current GPS location
- Show pickup markers
- Show destination markers
- Show eligible waiting passenger markers
- Update markers when booking statuses change
- Show assigned driver's live location
- Display routes using a configured routing provider
- Recenter map controls
- Handle denied geolocation permission
- Handle weak GPS signals
- Handle empty map states

For live locations:

- Throttle GPS updates.
- Avoid transmitting insignificant changes.
- Respect device battery usage.
- Authenticate location updates.
- Ensure driver location updates belong to the authenticated driver.
- Only share precise driver tracking with authorized booking participants and relevant administrators.

Make Leaflet map instances properly initialize, resize, and destroy during Vue component lifecycle changes.

Do not create duplicate map instances.

For OpenStreetMap tiles and external geocoding/routing services, respect provider usage policies and configure suitable production providers.

---

# 14. Notifications

Implement in-app notifications for:

### Commuters

- Booking created
- Driver accepted booking
- Driver approaching pickup
- Passenger picked up
- Ride completed
- Booking cancelled

### Drivers

- New booking nearby
- Booking no longer available
- Booking assigned successfully
- Commuter cancelled booking
- Passenger pickup confirmed
- Ride completed

### Admin

- New driver registration
- Driver awaiting approval
- Important operational events

Provide notification history and unread counts.

Do not rely on browser push notifications as the only method of communicating an important booking state.

---

# 15. Security and Reliability

Implement the following:

- JWT authentication with secure httpOnly cookies
- CSRF protection where applicable
- Role-based access control
- Input validation
- Password hashing
- HTTP security headers
- Rate limiting
- Secure CORS configuration
- Ownership validation
- Protected Socket.IO connections
- Booking concurrency protection
- Atomic shared seat allocation
- Idempotent booking mutations
- Safe error responses
- Structured application logs

Never expose private credentials, tokens, or password hashes.

Do not trust frontend-reported booking statuses, prices, or driver identifiers.

Recalculate or verify fares on the server.

Use environment variables for secrets and external service configurations.

---

# 16. Testing Requirements

Include automated tests for critical booking behavior.

## Test Case 1: Simultaneous Driver Acceptance

Two drivers attempt to accept the same booking at the same time.

Expected:

- Exactly one driver succeeds.
- The other receives `BOOKING_UNAVAILABLE`.
- The booking has exactly one assigned driver.
- Other drivers' maps remove the booking.

## Test Case 2: Passenger Picked Up

A driver successfully picks up a commuter.

Expected:

- Booking status changes to `picked_up`.
- Other drivers do not see the commuter as waiting.
- The commuter sees an active ride.
- The admin sees the updated status.

## Test Case 3: Driver Reconnection

A driver disconnects and reconnects.

Expected:

- The application retrieves the latest database state.
- Already accepted bookings do not reappear as available.
- The driver's active assignments are restored.

## Test Case 4: Shared Ride Capacity

A shared ride has only one seat remaining, and two bookings attempt to reserve that seat simultaneously.

Expected:

- Only one reservation succeeds.
- Capacity is not exceeded.
- Seat counts remain consistent.

## Test Case 5: Non-Shared Booking

A driver is handling a non-shared booking.

Expected:

- No other commuter may join the ride.
- The driver cannot accept another conflicting ride.
- The driver becomes available again after successful completion, subject to online status.

## Test Case 6: Invalid Pickup Confirmation

A different driver attempts to mark another driver's passenger as picked up.

Expected:

- Request is rejected.
- Booking status does not change.
- The operation is logged for security review.

---

# 17. Application Screens

Generate the following screens.

## Commuter

1. Splash / Welcome
2. Login
3. Registration
4. Home with Leaflet map
5. Pickup selection
6. Destination selection
7. Choose Shared or Non-Shared Ride
8. Booking confirmation
9. Searching for driver
10. Driver assigned
11. Active ride tracking
12. Booking history
13. Booking details
14. Notifications
15. Profile and settings

## Driver

1. Driver Login
2. Driver registration / approval status
3. Driver dashboard with Leaflet
4. Online / Offline screen
5. Waiting commuter map
6. Booking request details
7. Accepted booking
8. Navigate to pickup
9. Confirm passenger pickup
10. Ongoing ride
11. Complete ride
12. Booking history
13. Earnings
14. Profile

## Admin

1. Login
2. Dashboard
3. User management
4. Driver approvals
5. Driver management
6. Vehicle management
7. Booking management
8. Active ride monitoring
9. Fare settings
10. Service area settings
11. Reports and analytics
12. System settings

---

# 18. Development Priorities

Implement the application in phases.

## Phase 1 — Foundation

- Initialize Vue and Node projects
- Set up modular monolith structure
- Configure MongoDB
- Create design system
- Create authentication
- Implement role-based routing

## Phase 2 — User Interfaces

- Complete commuter UI
- Complete driver UI
- Complete admin UI
- Integrate Leaflet maps
- Implement mobile responsiveness

## Phase 3 — Booking System

- Pickup and destination selection
- Shared and non-shared booking creation
- Fare calculation
- Booking lifecycle
- Driver availability

## Phase 4 — Real-Time Functionality

- Socket.IO integration
- Live waiting commuter markers
- Atomic booking acceptance
- Marker removal after assignment
- Passenger pickup synchronization
- Live ride updates
- Reconnection handling

## Phase 5 — Shared Ride Management

- Vehicle capacity
- Multiple passenger bookings
- Shared ride assignment
- Seat allocation
- Individual passenger status handling

## Phase 6 — Administration

- Driver approvals
- User management
- Booking monitoring
- Fare configuration
- Reports

## Phase 7 — Testing and Deployment

- Automated concurrency tests
- Authorization tests
- API integration tests
- Mobile responsiveness testing
- Production build
- Deployment documentation

---

# 19. Code Quality Requirements

Follow these conventions:

- Vue 3 Composition API
- JavaScript ES modules
- Reusable components
- Service-based business logic
- Clear separation of responsibilities
- Centralized error handling
- Standardized API responses
- Environment-based configuration
- Consistent file naming
- No unnecessary code duplication
- No hardcoded production credentials
- No fake data presented as real records

Use meaningful function and variable names.

Maintain readable, documented code.

Add comments for complex booking and concurrency logic.

Create seed data for development and testing, clearly separated from production records.

---

# 20. Expected Deliverables

Produce:

1. A complete Vue.js frontend.
2. A Node.js and Express.js backend using modular monolith architecture.
3. MongoDB and Mongoose models.
4. REST API endpoints.
5. Socket.IO real-time event integration.
6. Leaflet map integration.
7. Commuter, driver, and admin dashboards.
8. Shared and non-shared booking flows.
9. Concurrency-safe driver assignment.
10. Real-time booking status synchronization.
11. Responsive mobile-first styling.
12. Automated tests for critical operations.
13. `.env.example` configurations.
14. Local installation instructions.
15. Production deployment instructions.

# Final Instruction

**Start by implementing the application foundation, shared UI components, authentication, and the three role-based layouts. Then build the commuter booking flow and driver map before implementing the real-time booking engine.**

Follow the design system consistently.

Make every screen functional, not merely a static mockup.

Prioritize booking correctness, live synchronization, passenger safety, and usability.

The application must ensure that **when a commuter's booking has been accepted or the passenger has already been picked up, other tricycle drivers are immediately informed and cannot accept or pick up that same passenger booking.**

Implement backend-enforced booking ownership, atomic state transitions, and Socket.IO synchronization to accomplish this reliably.
