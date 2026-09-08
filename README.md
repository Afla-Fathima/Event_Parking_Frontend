# Event & Parking Reservation System — Angular 19 Frontend

Angular 19 standalone-component frontend for the Event & Parking Reservation System BRD v2.0.

## Tech stack
- Angular 19.2.x
- Angular Router with lazy-loaded feature routes and nested route shells
- Angular HttpClient
- Template-driven and reactive forms
- RxJS
- ASP.NET Core Web API backend through `/api`
- JWT authentication with route guards and an auth interceptor

## Setup
```powershell
npm.cmd install
npm.cmd start
```

The Angular dev server runs at `http://localhost:4200`.

## Backend connection
`proxy.conf.json` forwards `/api` to:

```text
http://localhost:5188
```

Change `src/environments/environment.ts` only if the API base path changes.

## Application structure
```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── features/
│   ├── admin/
│   ├── auth/
│   ├── booking/
│   ├── dashboard/
│   ├── events/
│   ├── notifications/
│   ├── parking/
│   ├── payment/
│   ├── profile/
│   └── seats/
└── shared/
    ├── components/
    ├── directives/
    ├── pipes/
    └── utils/
```

## Main routes
| Route | Purpose |
|---|---|
| `/events` | Browse/filter events |
| `/events/:id` | Event details |
| `/events/:id/seats` | Visual seat selection |
| `/events/:id/parking` | Optional parking selection |
| `/checkout` | Review and create booking |
| `/bookings` | Customer booking history |
| `/bookings/:id` | Booking details |
| `/bookings/:id/payment` | Simulated payment |
| `/payments` | Payment history |
| `/payments/:id/receipt` | Printable receipt |
| `/notifications` | Customer notifications |
| `/admin/*` | Administrator management area |

The events, bookings, payments and admin sections use nested child routes with route-shell outlets.

## Services
- `AuthService`
- `CustomerService`
- `VenueService`
- `CategoryService`
- `EventService`
- `SeatService`
- `ParkingService`
- `BookingService`
- `PaymentService`
- `NotificationService`
- `DashboardService`
- `BookingStateService` for shared in-progress booking state

All API calls are made from services through `HttpClient`; components do not inject `HttpClient` directly.

## Forms register
| Screen | Approach | Main validation |
|---|---|---|
| Login | Template-driven | required, email, minlength |
| Registration | Reactive | email, phone pattern, password match |
| Venue/category admin | Template-driven | required, min |
| Admin event | Reactive | required relations, min price, future date |
| Checkout | Reactive `FormArray` | attendee names |
| Payment | Reactive | card pattern, Luhn, CVV, expiry format/future date |

## BRD feature coverage
- Customer registration and profile
- Event browse/search/filter
- Visual seat map with parent/child communication
- Optional visual parking selection
- Shared booking state and checkout guard
- Booking history/details/cancellation
- Simulated payment and printable receipt
- Notifications with shared unread-count state
- Customer and administrator dashboards
- Admin venue/category/event/seat/parking/booking/customer management
- `NavigationStart` / `NavigationEnd` progress and notification refresh
- Custom directives and pipes
- `ngClass` and `ngStyle`
- 409 booking-conflict refresh flow

## Build
```powershell
npm.cmd run build
```

A submission build should complete with zero Angular compilation errors.

## GitHub
`node_modules`, `dist` and `.angular` are excluded by `.gitignore` and should not be committed.
