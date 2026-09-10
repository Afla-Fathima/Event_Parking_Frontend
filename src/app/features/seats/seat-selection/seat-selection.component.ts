import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  CurrencyPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  EventItem,
  Seat,
} from '../../../core/models/api.models';

import {
  EventService,
  SeatService,
} from '../../../core/services/api.services';

import {
  BookingStateService
} from '../../../core/services/booking-state.service';

import {
  SeatButtonComponent
} from '../seat-button/seat-button.component';

import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';

interface SeatRow {
  label: string;
  seats: Seat[];
}

@Component({
  selector: 'app-seat-selection',

  standalone: true,

  imports: [
    CurrencyPipe,
    SeatButtonComponent,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],

  templateUrl:
    './seat-selection.component.html',

  styleUrl:
    './seat-selection.component.css',
})
export class SeatSelectionComponent {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly eventApi =
    inject(EventService);

  private readonly seatApi =
    inject(SeatService);

  readonly state =
    inject(BookingStateService);

  readonly eventId =
    Number(
      this.route
        .snapshot
        .paramMap
        .get('id')
    );

  readonly event =
    signal<EventItem | null>(null);

  readonly seats =
    signal<Seat[]>([]);

  readonly loading =
    signal(true);

  readonly error =
    signal('');

  readonly maxVisibleSeats =
    200;

  readonly displaySeats =
    computed(() =>
      this.seats()
        .filter(
          seat =>
            this.parseSeatCode(
              seat.seatNumber
            ) !== null
        )
        .sort(
          (a, b) =>
            this.compareSeats(
              a,
              b
            )
        )
        .slice(
          0,
          this.maxVisibleSeats
        )
    );

  readonly rows =
    computed<SeatRow[]>(() => {

      const grouped =
        new Map<string, Seat[]>();

      for (
        const seat
        of this.displaySeats()
      ) {

        const parsed =
          this.parseSeatCode(
            seat.seatNumber
          );

        if (!parsed) {
          continue;
        }

        const row =
          grouped.get(
            parsed.row
          ) ?? [];

        row.push(seat);

        grouped.set(
          parsed.row,
          row
        );
      }

      return [
        ...grouped.entries()
      ].map(
        ([label, seats]) => ({
          label,
          seats,
        })
      );
    });

  readonly availableCount =
    computed(() =>
      this.displaySeats()
        .filter(
          seat =>
            seat.status
              .toLowerCase() ===
            'available'
        )
        .length
    );

  readonly occupiedCount =
    computed(
      () =>
        this.displaySeats()
          .length -
        this.availableCount()
    );

  constructor() {
    this.load();
  }

  load(): void {

    this.loading.set(true);

    this.error.set('');

    this.eventApi
      .get(this.eventId)
      .subscribe({

        next: event => {

          this.event.set(event);

          this.state.start(event);

          this.loadSeats();
        },

        error: error => {

          this.error.set(
            error.error?.message ??
            'Unable to load event.'
          );

          this.loading.set(false);
        },
      });
  }

  toggle(
    seat: Seat
  ): void {

    if (
      seat.status
        .toLowerCase() !==
      'available'
    ) {
      return;
    }

    this.state
      .toggleSeat(seat);
  }

  isSelected(
    seat: Seat
  ): boolean {

    return this.state
      .selectedSeats()
      .some(
        selected =>
          selected.seatId ===
          seat.seatId
      );
  }

  continue(): void {

    if (
      this.state.seatCount() === 0
    ) {
      return;
    }

    void this.router.navigate([
      '/events',
      this.eventId,
      'parking',
    ]);
  }

  back(): void {

    void this.router.navigate([
      '/events',
      this.eventId,
    ]);
  }

  private loadSeats(): void {

    this.seatApi
      .list(this.eventId)
      .subscribe({

        next: data => {

          this.seats.set(data);

          this.dropUnavailable(
            this.displaySeats()
          );

          this.loading.set(false);
        },

        error:
          (
            error:
              HttpErrorResponse
          ) => {

            this.error.set(
              error.error?.message ??
              'Unable to load seat map.'
            );

            this.loading.set(false);
          },
      });
  }

  private dropUnavailable(
    latest: Seat[]
  ): void {

    const availableIds =
      new Set(
        latest
          .filter(
            seat =>
              seat.status
                .toLowerCase() ===
              'available'
          )
          .map(
            seat =>
              seat.seatId
          )
      );

    const keep =
      this.state
        .selectedSeats()
        .filter(
          seat =>
            availableIds.has(
              seat.seatId
            )
        );

    if (
      keep.length !==
      this.state
        .selectedSeats()
        .length
    ) {

      this.state
        .selectedSeats
        .set(keep);
    }
  }

  private compareSeats(
    a: Seat,
    b: Seat
  ): number {

    const left =
      this.parseSeatCode(
        a.seatNumber
      );

    const right =
      this.parseSeatCode(
        b.seatNumber
      );

    if (!left || !right) {

      return a.seatNumber
        .localeCompare(
          b.seatNumber
        );
    }

    return (
      left.row.localeCompare(
        right.row
      ) ||
      left.number -
      right.number
    );
  }

  private parseSeatCode(
    value: string
  ):
    {
      row: string;
      number: number;
    }
    | null {

    const normalized =
      value
        .trim()
        .toUpperCase()
        .replace(
          /-/g,
          ''
        );

    const match =
      /^([A-T])(0?[1-9]|10)$/
        .exec(normalized);

    if (!match) {
      return null;
    }

    return {
      row: match[1],
      number:
        Number(match[2]),
    };
  }
}