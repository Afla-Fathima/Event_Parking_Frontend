import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import {
  BookingService,
  ParkingService,
  SeatService,
} from '../../../core/services/api.services';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ConfirmDialogComponent } from '../../../shared/components/states/state-components';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private readonly bookingApi = inject(BookingService);
  private readonly seatApi = inject(SeatService);
  private readonly parkingApi = inject(ParkingService);
  private readonly router = inject(Router);

  readonly state = inject(BookingStateService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly confirmOpen = signal(false);

  readonly form = new FormGroup({
    attendees: new FormArray<FormControl<string>>(
      this.state.selectedSeats().map(
        () =>
          new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2)],
          }),
      ),
    ),
  });

  get attendees(): FormArray<FormControl<string>> {
    return this.form.controls.attendees;
  }

  askConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmOpen.set(true);
  }

  create(): void {
    const event = this.state.event();
    if (!event) return;

    this.confirmOpen.set(false);
    this.busy.set(true);
    this.error.set('');

    this.bookingApi
      .create({
        eventId: event.eventId,
        seatIds: this.state.selectedSeats().map((s) => s.seatId),
        parkingSlotId: this.state.parking()?.parkingSlotId ?? null,
      })
      .subscribe({
        next: (b) => {
          this.busy.set(false);
          this.state.clear();
          void this.router.navigate(['/bookings', b.bookingId, 'payment']);
        },
        error: (e: HttpErrorResponse) => {
          if (e.status === 409) {
            this.refreshAfterConflict(
              event.eventId,
              e.error?.message ??
                'Availability changed while you were checking out. The latest map has been loaded.',
            );
            return;
          }

          this.busy.set(false);
          this.error.set(e.error?.message ?? 'Unable to create booking.');
        },
      });
  }

  back(): void {
    const event = this.state.event();
    if (event) void this.router.navigate(['/events', event.eventId, 'parking']);
  }

  private refreshAfterConflict(eventId: number, message: string): void {
    forkJoin({
      seats: this.seatApi.list(eventId),
      parking: this.parkingApi.list(eventId),
    }).subscribe({
      next: ({ seats, parking }) => {
        const availableSeatIds = new Set(
          seats.filter((seat) => seat.status.toLowerCase() === 'available').map((seat) => seat.seatId),
        );
        const currentSeats = this.state.selectedSeats();
        const refreshedSeats = currentSeats.filter((seat) => availableSeatIds.has(seat.seatId));
        const seatSelectionChanged = refreshedSeats.length !== currentSeats.length;
        this.state.selectedSeats.set(refreshedSeats);

        const selectedParking = this.state.parking();
        const parkingStillAvailable = selectedParking
          ? parking.some(
              (slot) =>
                slot.parkingSlotId === selectedParking.parkingSlotId &&
                slot.status.toLowerCase() === 'available',
            )
          : true;

        if (!parkingStillAvailable) {
          this.state.selectParking(null);
        }

        this.state.notice.set(message);
        this.busy.set(false);

        if (seatSelectionChanged) {
          void this.router.navigate(['/events', eventId, 'seats']);
        } else {
          void this.router.navigate(['/events', eventId, 'parking']);
        }
      },
      error: () => {
        this.busy.set(false);
        this.error.set(
          `${message} Please return to the seat and parking maps and refresh before trying again.`,
        );
      },
    });
  }
}
