import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Payment } from '../../../core/models/api.models';
import { PaymentService } from '../../../core/services/api.services';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    StatusBadgeComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css',
})
export class PaymentHistoryComponent {
  private readonly api = inject(PaymentService);
  private readonly router = inject(Router);
  readonly items = signal<Payment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.mine().subscribe({
      next: (d) => {
        this.items.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load payments.');
        this.loading.set(false);
      },
    });
  }
  receipt(p: Payment): void {
    void this.router.navigate(['/payments', p.paymentId, 'receipt']);
  }
}
