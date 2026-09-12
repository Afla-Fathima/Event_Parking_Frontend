import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking } from '../../../core/models/api.models';
import { BookingService } from '../../../core/services/api.services';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, StatusBadgeComponent, ErrorComponent, LoadingComponent],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css',
})
export class BookingDetailComponent {
  private readonly api = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load(): void {
    this.api.myBooking(this.id).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load booking.');
        this.loading.set(false);
      },
    });
  }
  pay(): void {
    void this.router.navigate(['/bookings', this.id, 'payment']);
  }
  back(): void {
    void this.router.navigate(['/bookings']);
  }
}
