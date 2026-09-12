import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Venue, VenueWrite } from '../../../core/models/api.models';
import { VenueService } from '../../../core/services/api.services';
import {
  ConfirmDialogComponent,
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent, EmptyComponent, ErrorComponent, LoadingComponent],
  templateUrl: './venues.component.html',
   styleUrl: './venues.component.css',
})
export class AdminVenuesComponent {
  private readonly api = inject(VenueService);
  readonly items = signal<Venue[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly editing = signal<Venue | null>(null);
  readonly deleteTarget = signal<Venue | null>(null);
  model: VenueWrite = { venueName: '', location: '', capacity: 100, description: '' };
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (d) => {
        this.items.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load venues.');
        this.loading.set(false);
      },
    });
  }
  edit(v: Venue): void {
    this.editing.set(v);
    this.model = {
      venueName: v.venueName,
      location: v.location,
      capacity: v.capacity,
      description: v.description,
    };
  }
  reset(form?: NgForm): void {
    this.editing.set(null);
    this.model = { venueName: '', location: '', capacity: 100, description: '' };
    form?.resetForm(this.model);
  }
  save(form: NgForm): void {
    if (form.invalid || this.busy()) return;
    this.busy.set(true);
    const current = this.editing();
    const request = current
      ? this.api.update(current.venueId, this.model)
      : this.api.create(this.model);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.reset(form);
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'Unable to save venue.');
      },
    });
  }
  remove(): void {
    const v = this.deleteTarget();
    if (!v) return;
    this.api.delete(v.venueId).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
      },
      error: (e) => {
        this.deleteTarget.set(null);
        this.error.set(e.error?.message ?? 'Venue cannot be deleted.');
      },
    });
  }
}
