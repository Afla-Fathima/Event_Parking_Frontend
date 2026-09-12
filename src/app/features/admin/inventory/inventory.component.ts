import { Component, computed, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { concatMap, from, toArray } from 'rxjs';
import {
  EventItem,
  ParkingSlot,
  ParkingSlotWrite,
  Seat,
  SeatWrite,
} from '../../../core/models/api.models';
import { EventService, ParkingService, SeatService } from '../../../core/services/api.services';
import {
  EmptyComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class AdminInventoryComponent {
  private readonly eventsApi = inject(EventService);
  private readonly seatsApi = inject(SeatService);
  private readonly parkingApi = inject(ParkingService);
  readonly events = signal<EventItem[]>([]);
  readonly seats = signal<Seat[]>([]);
  readonly slots = signal<ParkingSlot[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  selectedEventId: number | null = null;
  constructor() {
    this.eventsApi.list().subscribe({
      next: (e) => {
        this.events.set(e);
        this.loading.set(false);
        if (e.length) {
          this.selectedEventId = e[0].eventId;
          this.loadInventory();
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Unable to load events.');
        this.loading.set(false);
      },
    });
  }
  get event(): EventItem | undefined {
    return this.events().find((e) => e.eventId === this.selectedEventId);
  }
  loadInventory(): void {
    if (!this.selectedEventId) return;
    this.loading.set(true);
    this.error.set('');
    this.seatsApi.list(this.selectedEventId).subscribe({
      next: (s) => {
        this.seats.set(s);
        this.parkingApi.list(this.selectedEventId!).subscribe({
          next: (p) => {
            this.slots.set(p);
            this.loading.set(false);
          },
          error: (e) => {
            this.error.set(e.error?.message ?? 'Unable to load parking.');
            this.loading.set(false);
          },
        });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load seats.');
        this.loading.set(false);
      },
    });
  }
  get seatTarget(): number {
    return Math.min(this.event?.capacity ?? 0, 200);
  }

  get cleanSeats(): Seat[] {
    return this.seats()
      .filter((seat) => this.parseSeatCode(seat.seatNumber) !== null)
      .sort((a, b) => this.compareSeats(a, b))
      .slice(0, this.seatTarget);
  }

  generateSeats(): void {
    const event = this.event;
    if (!event || this.busy()) return;

    const target = Math.min(event.capacity, 200);
    const existing = new Set(
      this.seats()
        .map((seat) => this.normalizeSeatCode(seat.seatNumber))
        .filter((code): code is string => code !== null),
    );

    const missing: SeatWrite[] = [];

    for (let i = 0; i < target; i++) {
      const rowIndex = Math.floor(i / 10);
      const row = String.fromCharCode(65 + rowIndex);
      const no = (i % 10) + 1;
      const code = `${row}${String(no).padStart(2, '0')}`;

      if (!existing.has(code)) {
        missing.push({
          seatNumber: code,
          seatType: row === 'A' ? 'VIP' : 'Regular',
          price: row === 'A' ? Math.round(event.ticketPrice * 1.25) : event.ticketPrice,
        });
      }
    }

    if (!missing.length) {
      this.success.set(`Seat map is ready with the clean ${target}-seat target.`);
      return;
    }

    this.busy.set(true);
    this.error.set('');

    from(missing)
      .pipe(
        concatMap((value) => this.seatsApi.create(event.eventId, value)),
        toArray(),
      )
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.success.set(`Generated ${missing.length} missing seats. Display limit is ${target}.`);
          this.loadInventory();
        },
        error: (e) => {
          this.busy.set(false);
          this.error.set(
            e.error?.message ??
              'Seat generation stopped. Existing valid seats are kept and invalid symbol rows stay hidden.',
          );
          this.loadInventory();
        },
      });
  }

  private normalizeSeatCode(value: string): string | null {
    const normalized = value.trim().toUpperCase().replace(/-/g, '');
    return /^([A-T])(0[1-9]|10)$/.test(normalized) ? normalized : null;
  }

  private parseSeatCode(value: string): { row: string; number: number } | null {
    const normalized = this.normalizeSeatCode(value);
    if (!normalized) return null;
    return {
      row: normalized.charAt(0),
      number: Number(normalized.slice(1)),
    };
  }

  private compareSeats(a: Seat, b: Seat): number {
    const left = this.parseSeatCode(a.seatNumber);
    const right = this.parseSeatCode(b.seatNumber);
    if (!left || !right) return a.seatNumber.localeCompare(b.seatNumber);
    return left.row.localeCompare(right.row) || left.number - right.number;
  }

  generateParking(): void {
    const event = this.event;
    if (!event || this.busy()) return;
    const existing = new Set(this.slots().map((s) => s.slotNumber.toUpperCase()));
    const missing: ParkingSlotWrite[] = [];
    for (let i = 1; i <= 20; i++) {
      const code = `P${String(i).padStart(2, '0')}`;
      if (!existing.has(code))
        missing.push({
          slotNumber: code,
          vehicleType: i <= 15 ? 'Car' : 'Bike',
          fee: event.parkingFee,
        });
    }
    if (!missing.length) {
      this.success.set('Parking layout already has P01–P20.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    from(missing)
      .pipe(
        concatMap((value) => this.parkingApi.create(event.eventId, value)),
        toArray(),
      )
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.success.set(`Generated ${missing.length} missing parking slots.`);
          this.loadInventory();
        },
        error: (e) => {
          this.busy.set(false);
          this.error.set(e.error?.message ?? 'Parking generation stopped.');
          this.loadInventory();
        },
      
      });
      
  }
  readonly sortedSeats = computed(() => {

    return [...this.seats()].sort(
      (a, b) =>
        a.seatNumber.localeCompare(
          b.seatNumber,
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          },
        ),
    );
  
  });
}
