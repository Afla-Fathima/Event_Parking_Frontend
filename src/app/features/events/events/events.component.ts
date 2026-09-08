import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category, EventItem, Venue } from '../../../core/models/api.models';
import { CategoryService, EventService, VenueService } from '../../../core/services/api.services';
import { EventCardComponent } from '../event-card/event-card.component';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule, EventCardComponent, EmptyComponent, ErrorComponent, LoadingComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  private readonly eventsApi = inject(EventService);
  private readonly venueApi = inject(VenueService);
  private readonly categoryApi = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly events = signal<EventItem[]>([]);
  readonly venues = signal<Venue[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  search = '';
  date = '';
  venue: number | null = null;
  category: number | null = null;
  constructor() {
    const q = this.route.snapshot.queryParamMap;
    this.search = q.get('search') ?? '';
    this.date = q.get('date') ?? '';
    this.venue = this.toNumber(q.get('venue'));
    this.category = this.toNumber(q.get('category'));
    this.loadReference();
  }
  loadReference(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({ venues: this.venueApi.list(), categories: this.categoryApi.list() }).subscribe({
      next: (r) => {
        this.venues.set(r.venues);
        this.categories.set(r.categories);
        this.loadEvents();
      },
      error: () => {
        this.error.set('Unable to load event filters.');
        this.loading.set(false);
      },
    });
  }
  applyFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search || null,
        date: this.date || null,
        venue: this.venue || null,
        category: this.category || null,
      },
    });
    this.loadEvents();
  }
  clearFilters(): void {
    this.search = '';
    this.date = '';
    this.venue = null;
    this.category = null;
    this.applyFilters();
  }
  open(id: number): void {
    void this.router.navigate(['/events', id]);
  }
  private loadEvents(): void {
    this.loading.set(true);
    this.eventsApi
      .list({ search: this.search, date: this.date, venue: this.venue, category: this.category })
      .subscribe({
        next: (data) => {
          this.events.set(data);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.error?.message ?? 'Unable to load events.');
          this.loading.set(false);
        },
      });
  }
  private toNumber(value: string | null): number | null {
    const n = Number(value);
    return value && Number.isFinite(n) && n > 0 ? n : null;
  }
}
