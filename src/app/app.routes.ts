import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

const shell = () =>
  import('./shared/components/states/state-components').then((m) => m.RouteShellComponent);

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'events' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot/forgot-password.component').then((m) => m.ForgotComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset/reset-password.component').then((m) => m.ResetComponent),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/customer-dashboard/customer-dashboard.component').then(
        (m) => m.CustomerDashboardComponent,
      ),
  },

  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/events/events/events.component').then((m) => m.EventsComponent),
      },
      {
        path: ':id/seats',
        loadComponent: () =>
          import('./features/seats/seat-selection/seat-selection.component').then(
            (m) => m.SeatSelectionComponent,
          ),
      },
      {
        path: ':id/parking',
        loadComponent: () =>
          import('./features/parking/parking-selection/parking-selection.component').then(
            (m) => m.ParkingSelectionComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/events/event-detail/event-detail.component').then(
            (m) => m.EventDetailComponent,
          ),
      },
    ],
  },

  {
    path: 'checkout',
    canActivate: [authGuard, checkoutGuard],
    loadComponent: () =>
      import('./features/booking/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },

  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/booking/my-bookings/my-bookings.component').then(
            (m) => m.MyBookingsComponent,
          ),
      },
      {
        path: ':id/payment',
        loadComponent: () =>
          import('./features/payment/payment/payment.component').then((m) => m.PaymentComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/booking/booking-detail/booking-detail.component').then(
            (m) => m.BookingDetailComponent,
          ),
      },
    ],
  },

  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/payment/payment-history/payment-history.component').then(
            (m) => m.PaymentHistoryComponent,
          ),
      },
      {
        path: ':id/receipt',
        loadComponent: () =>
          import('./features/payment/receipt/receipt.component').then((m) => m.ReceiptComponent),
      },
    ],
  },

  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/admin/events/admin-events.component').then(
            (m) => m.AdminEventsComponent,
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/admin/inventory/inventory.component').then(
            (m) => m.AdminInventoryComponent,
          ),
      },
      {
        path: 'venues',
        loadComponent: () =>
          import('./features/admin/venues/venues.component').then((m) => m.AdminVenuesComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/bookings/admin-bookings.component').then(
            (m) => m.AdminBookingsComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/customers/customers.component').then(
            (m) => m.AdminCustomersComponent,
          ),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
