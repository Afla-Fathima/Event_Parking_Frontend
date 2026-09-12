import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking, EventItem } from '../../../core/models/api.models';
import { BookingService, EventService } from '../../../core/services/api.services';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BookingStatusPipe } from '../../../shared/pipes/app.pipes';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    DatePipe,
    StatusBadgeComponent,
    BookingStatusPipe,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.css',
})
export class AdminBookingsComponent {
  private readonly eventsApi = inject(EventService);
  private readonly bookingsApi = inject(BookingService);
  readonly events = signal<EventItem[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  selectedEventId: number | null = null;
  constructor() {
    this.eventsApi.list().subscribe({
      next: (e) => {
        this.events.set(e);
        this.loading.set(false);
        if (e.length) {
          this.selectedEventId = e[0].eventId;
          this.loadBookings();
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Unable to load events.');
        this.loading.set(false);
      },
    });
  }
  loadBookings(): void {
    if (!this.selectedEventId) return;
    this.loading.set(true);
    this.bookingsApi.byEvent(this.selectedEventId).subscribe({
      next: (b) => {
        this.bookings.set(b);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load bookings.');
        this.loading.set(false);
      },
    });
  }
}
