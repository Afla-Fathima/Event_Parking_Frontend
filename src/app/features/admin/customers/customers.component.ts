import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../../core/models/api.models';
import { CustomerService } from '../../../core/services/api.services';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  ConfirmDialogComponent,
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    FormsModule,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class AdminCustomersComponent {
  private readonly api = inject(CustomerService);
  readonly items = signal<Customer[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly target = signal<Customer | null>(null);
  search = '';
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.list(this.search.trim()).subscribe({
      next: (d) => {
        this.items.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load customers.');
        this.loading.set(false);
      },
    });
  }
  toggle(): void {
    const c = this.target();
    if (!c) return;
    const active = c.status.toLowerCase() === 'active';
    const req = active ? this.api.deactivate(c.customerId) : this.api.reactivate(c.customerId);
    req.subscribe({
      next: () => {
        this.target.set(null);
        this.load();
      },
      error: (e) => {
        this.target.set(null);
        this.error.set(e.error?.message ?? 'Unable to change customer status.');
      },
    });
  }
}
