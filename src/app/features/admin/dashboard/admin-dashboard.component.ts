import { Component, inject, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { EventItem, ParkingSlot, Seat } from '../../../core/models/api.models';
import {
  DashboardService,
  EventService,
  ParkingService,
  SeatService,
} from '../../../core/services/api.services';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';

interface DashboardStat {
  icon: string;
  label: string;
  value: string | number;
  hint: string;
}

interface EventOccupancy {
  eventId: number;
  eventName: string;
  bookedSeats: number;
  totalSeats: number;
  occupiedParking: number;
  totalParking: number;
  seatPercent: number;
  parkingPercent: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NgStyle,
    RouterLink,
    StatCardComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly dashboardApi = inject(DashboardService);
  private readonly eventsApi = inject(EventService);
  private readonly seatsApi = inject(SeatService);
  private readonly parkingApi = inject(ParkingService);

  readonly stats = signal<DashboardStat[]>([]);
  readonly occupancy = signal<EventOccupancy[]>([]);
  readonly loading = signal(true);
  readonly occupancyLoading = signal(true);
  readonly error = signal('');
  readonly occupancyError = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.dashboardApi.admin().subscribe({
      next: (d) => {
        this.stats.set([
          { icon: 'E', label: 'Total events', value: d.totalEvents, hint: 'Catalogue size' },
          { icon: 'B', label: 'Total bookings', value: d.totalBookings, hint: 'All booking records' },
          { icon: 'S', label: 'Available seats', value: d.availableSeats, hint: 'Across all events' },
          {
            icon: 'P',
            label: 'Occupied parking',
            value: d.occupiedParkingSlots,
            hint: 'Reserved slots',
          },
          {
            icon: 'LKR',
            label: 'Total revenue',
            value: `LKR ${Number(d.totalRevenue).toLocaleString('en-LK')}`,
            hint: 'Completed payments',
          },
          { icon: 'C', label: 'Total customers', value: d.totalCustomers, hint: 'Registered accounts' },
        ]);
        this.loading.set(false);
        this.loadOccupancy();
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load admin dashboard.');
        this.loading.set(false);
        this.occupancyLoading.set(false);
      },
    });
  }

  private loadOccupancy(): void {
    this.occupancyLoading.set(true);
    this.occupancyError.set('');

    this.eventsApi.list().subscribe({
      next: (events) => {
        if (events.length === 0) {
          this.occupancy.set([]);
          this.occupancyLoading.set(false);
          return;
        }

        const requests = events.map((event) =>
          forkJoin({
            seats: this.seatsApi
              .list(event.eventId)
              .pipe(catchError(() => of<Seat[]>([]))),
            parking: this.parkingApi
              .list(event.eventId)
              .pipe(catchError(() => of<ParkingSlot[]>([]))),
          }).pipe(map(({ seats, parking }) => this.toOccupancy(event, seats, parking))),
        );

        forkJoin(requests).subscribe({
          next: (rows) => {
            this.occupancy.set(rows);
            this.occupancyLoading.set(false);
          },
          error: () => {
            this.occupancyError.set('Unable to calculate event occupancy.');
            this.occupancyLoading.set(false);
          },
        });
      },
      error: () => {
        this.occupancyError.set('Unable to load event occupancy.');
        this.occupancyLoading.set(false);
      },
    });
  }

  private toOccupancy(event: EventItem, seats: Seat[], parking: ParkingSlot[]): EventOccupancy {
    const bookedSeats = seats.filter((seat) => seat.status.toLowerCase() !== 'available').length;
    const occupiedParking = parking.filter(
      (slot) => slot.status.toLowerCase() !== 'available',
    ).length;

    return {
      eventId: event.eventId,
      eventName: event.eventName,
      bookedSeats,
      totalSeats: seats.length,
      occupiedParking,
      totalParking: parking.length,
      seatPercent: seats.length ? Math.round((bookedSeats / seats.length) * 100) : 0,
      parkingPercent: parking.length
        ? Math.round((occupiedParking / parking.length) * 100)
        : 0,
    };
  }
}

