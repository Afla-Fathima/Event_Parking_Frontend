import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingSlot } from '../../../core/models/api.models';
import { ParkingService } from '../../../core/services/api.services';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ParkingSlotButtonComponent } from '../parking-slot-button/parking-slot-button.component';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-parking-selection',
  standalone: true,
  imports: [
    CurrencyPipe,
    ParkingSlotButtonComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './parking-selection.component.html',
  styleUrl: './parking-selection.component.css',
})
export class ParkingSelectionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ParkingService);
  readonly state = inject(BookingStateService);
  readonly eventId = Number(this.route.snapshot.paramMap.get('id'));
  readonly slots = signal<ParkingSlot[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() {
    if (!this.state.event() || this.state.event()?.eventId !== this.eventId) {
      void this.router.navigate(['/events', this.eventId, 'seats']);
      return;
    }
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list(this.eventId).subscribe({
      next: (data) => {
        this.slots.set(data);
        const current = this.state.parking();
        if (
          current &&
          !data.some(
            (s) =>
              s.parkingSlotId === current.parkingSlotId && s.status.toLowerCase() === 'available',
          )
        )
          this.state.selectParking(null);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load parking layout.');
        this.loading.set(false);
      },
    });
  }
  toggle(slot: ParkingSlot): void {
    this.state.selectParking(
      this.state.parking()?.parkingSlotId === slot.parkingSlotId ? null : slot,
    );
  }
  selected(slot: ParkingSlot): boolean {
    return this.state.parking()?.parkingSlotId === slot.parkingSlotId;
  }
  continue(): void {
    void this.router.navigate(['/checkout']);
  }
  back(): void {
    void this.router.navigate(['/events', this.eventId, 'seats']);
  }
}
