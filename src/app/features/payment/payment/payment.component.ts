import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking, PaymentStatus } from '../../../core/models/api.models';
import { BookingService, PaymentService } from '../../../core/services/api.services';
import {
  ConfirmDialogComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
import { expiryFutureValidator, luhnValidator } from '../payment.validators';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent {
  private readonly payments = inject(PaymentService);
  private readonly bookings = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bookingId = Number(this.route.snapshot.paramMap.get('id'));
  readonly booking = signal<Booking | null>(null);
  readonly status = signal<PaymentStatus | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly confirmOpen = signal(false);
  readonly form = new FormGroup({
    cardNumber: new FormControl('4242 4242 4242 4242', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(?:\d[ -]*?){13,19}$/), luhnValidator],
    }),
    expiry: new FormControl('12/30', {
      nonNullable: true,
      validators: [Validators.required, expiryFutureValidator],
    }),
    cvv: new FormControl('123', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{3,4}$/)],
    }),
    name: new FormControl('TEST CUSTOMER', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.bookings.myBooking(this.bookingId).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.payments.status(this.bookingId).subscribe({
          next: (s) => {
            this.status.set(s);
            this.loading.set(false);
          },
          error: (e) => {
            this.error.set(e.error?.message ?? 'Unable to load payment status.');
            this.loading.set(false);
          },
        });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load booking.');
        this.loading.set(false);
      },
    });
  }
  askPay(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmOpen.set(true);
  }
  pay(): void {
    this.confirmOpen.set(false);
    this.busy.set(true);
    this.error.set('');
    this.payments.pay(this.bookingId, 'Simulated Card').subscribe({
      next: (p) => {
        this.busy.set(false);
        this.bookings
          .myBooking(this.bookingId)
          .subscribe({
            next: () => void this.router.navigate(['/payments', p.paymentId, 'receipt']),
            error: () => void this.router.navigate(['/payments', p.paymentId, 'receipt']),
          });
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'Payment could not be completed.');
      },
    });
  }
  back(): void {
    void this.router.navigate(['/bookings', this.bookingId]);
  }
}
