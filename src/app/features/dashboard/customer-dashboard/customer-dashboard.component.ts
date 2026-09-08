import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/api.services';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import {
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';

interface DashboardStat {
  icon: string;
  label: string;
  value: number;
  hint: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent, ErrorComponent, LoadingComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css',
})
export class CustomerDashboardComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(DashboardService);

  readonly stats = signal<DashboardStat[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.customer().subscribe({
      next: (d) => {
        this.stats.set([
          {
            icon: 'B',
            label: 'Upcoming bookings',
            value: d.upcomingBookings,
            hint: 'Your active plans',
          },
          {
            icon: 'P',
            label: 'Reserved parking',
            value: d.reservedParking,
            hint: 'Parking linked to bookings',
          },
          {
            icon: 'LKR',
            label: 'Recent payments',
            value: d.recentPayments,
            hint: 'Completed payment records',
          },
          {
            icon: 'N',
            label: 'Unread notifications',
            value: d.unreadNotifications,
            hint: 'Updates needing attention',
          },
        ]);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load dashboard.');
        this.loading.set(false);
      },
    });
  }
}
