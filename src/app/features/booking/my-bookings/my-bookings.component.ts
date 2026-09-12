import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Booking } from '../../../core/models/api.models';
import { BookingService } from '../../../core/services/api.services';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  ConfirmDialogComponent,
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css',
})
export class MyBookingsComponent {
  private readonly api = inject(BookingService);
  private readonly router = inject(Router);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly cancelTarget = signal<Booking | null>(null);
  readonly busy = signal(false);
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.mine().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load bookings.');
        this.loading.set(false);
      },
    });
  }
  view(b: Booking): void {
    void this.router.navigate(['/bookings', b.bookingId]);
  }
  pay(b: Booking): void {
    void this.router.navigate(['/bookings', b.bookingId, 'payment']);
  }
  cancel(): void {
    const b = this.cancelTarget();
    if (!b) return;
    this.busy.set(true);
    this.api.cancel(b.bookingId).subscribe({
      next: () => {
        this.busy.set(false);
        this.cancelTarget.set(null);
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.cancelTarget.set(null);
        this.error.set(e.error?.message ?? 'Unable to cancel booking.');
      },
    });
  }
}
