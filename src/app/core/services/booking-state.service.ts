import { Injectable, computed, signal } from '@angular/core';
import { EventItem, ParkingSlot, Seat } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  readonly event = signal<EventItem | null>(null);
  readonly selectedSeats = signal<Seat[]>([]);
  readonly parking = signal<ParkingSlot | null>(null);
  readonly notice = signal('');
  readonly seatTotal = computed(() =>
    this.selectedSeats().reduce((sum, seat) => sum + Number(seat.price), 0),
  );
  readonly parkingTotal = computed(() => Number(this.parking()?.fee ?? 0));
  readonly total = computed(() => this.seatTotal() + this.parkingTotal());
  readonly seatCount = computed(() => this.selectedSeats().length);

  start(event: EventItem): void {
    if (this.event()?.eventId !== event.eventId) {
      this.selectedSeats.set([]);
      this.parking.set(null);
      this.notice.set('');
    }
    this.event.set(event);
  }

  toggleSeat(seat: Seat): void {
    const current = this.selectedSeats();
    const exists = current.some((item) => item.seatId === seat.seatId);
    this.selectedSeats.set(
      exists ? current.filter((item) => item.seatId !== seat.seatId) : [...current, seat],
    );
  }

  selectParking(slot: ParkingSlot | null): void {
    this.parking.set(slot);
  }
  clear(): void {
    this.notice.set('');
    this.event.set(null);
    this.selectedSeats.set([]);
    this.parking.set(null);
  }
}
