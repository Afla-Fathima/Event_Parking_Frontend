import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Receipt } from '../../../core/models/api.models';
import { PaymentService } from '../../../core/services/api.services';
import {
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css',
})
export class ReceiptComponent {
  private readonly api = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly receipt = signal<Receipt | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load(): void {
    this.api.receipt(this.id).subscribe({
      next: (r) => {
        this.receipt.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load receipt.');
        this.loading.set(false);
      },
    });
  }
  print(): void {
    window.print();
  }
  bookings(): void {
    void this.router.navigate(['/bookings']);
  }
  printReceipt(): void {

    document.body.classList.add('printing-receipt');
  
    window.print();
  
    document.body.classList.remove('printing-receipt');
  
  }

}
