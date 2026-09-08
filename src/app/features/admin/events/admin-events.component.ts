import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Category, EventItem, EventWrite, Venue } from '../../../core/models/api.models';
import { CategoryService, EventService, VenueService } from '../../../core/services/api.services';
import {
  ConfirmDialogComponent,
  EmptyComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
import { futureDateValidator } from './future-date.validator';
@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    ConfirmDialogComponent,
    EmptyComponent,
    LoadingComponent,
  ],
  templateUrl: './admin-events.component.html',
  styleUrl: './admin-events.component.css',
})
export class AdminEventsComponent {
  private readonly api = inject(EventService);
  private readonly venuesApi = inject(VenueService);
  private readonly categoriesApi = inject(CategoryService);
  readonly events = signal<EventItem[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly editing = signal<EventItem | null>(null);
  readonly deleteTarget = signal<EventItem | null>(null);
  readonly form = new FormGroup({
    eventName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    eventDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, futureDateValidator],
    }),
    startTime: new FormControl('18:00', { nonNullable: true, validators: [Validators.required] }),
    endTime: new FormControl('21:00', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    ticketPrice: new FormControl(2500, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    parkingFee: new FormControl(500, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    capacity: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(200)],
    }),
    venueId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
    categoryId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      events: this.api.list(),
      venues: this.venuesApi.list(),
      categories: this.categoriesApi.list(),
    }).subscribe({
      next: (r) => {
        this.events.set(r.events);
        this.venues.set(r.venues);
        this.categories.set(r.categories);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load admin event data.');
        this.loading.set(false);
      },
    });
  }
  edit(e: EventItem): void {
    this.editing.set(e);
    this.form.setValue({
      eventName: e.eventName,
      eventDate: e.eventDate,
      startTime: e.startTime.slice(0, 5),
      endTime: e.endTime.slice(0, 5),
      description: e.description,
      ticketPrice: e.ticketPrice,
      parkingFee: e.parkingFee,
      capacity: e.capacity,
      venueId: e.venueId,
      categoryId: e.categoryId,
    });
  }
  reset(): void {
    this.editing.set(null);
    this.form.reset({
      eventName: '',
      eventDate: '',
      startTime: '18:00',
      endTime: '21:00',
      description: '',
      ticketPrice: 2500,
      parkingFee: 500,
      capacity: 50,
      venueId: 0,
      categoryId: 0,
    });
  }
  save(): void {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const raw = this.form.getRawValue();
    const value: EventWrite = {
      ...raw,
      startTime: this.withSeconds(raw.startTime),
      endTime: this.withSeconds(raw.endTime),
    };
    const current = this.editing();
    const req = current ? this.api.update(current.eventId, value) : this.api.create(value);
    req.subscribe({
      next: () => {
        this.busy.set(false);
        this.reset();
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'Unable to save event.');
      },
    });
  }
  remove(): void {
    const e = this.deleteTarget();
    if (!e) return;
    this.api.delete(e.eventId).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
      },
      error: (err) => {
        this.deleteTarget.set(null);
        this.error.set(err.error?.message ?? 'Event cannot be deleted.');
      },
    });
  }
  private withSeconds(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }
}
