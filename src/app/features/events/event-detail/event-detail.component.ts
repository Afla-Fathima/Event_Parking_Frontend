import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe,
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  EventItem,
} from '../../../core/models/api.models';

import {
  EventService,
} from '../../../core/services/api.services';

import {
  BookingStateService,
} from '../../../core/services/booking-state.service';

import {
  ErrorComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';

import {
  EventPosterComponent,
} from '../../../shared/components/event-poster/event-poster.component';


@Component({
  selector: 'app-event-detail',

  standalone: true,

  imports: [
    CurrencyPipe,
    DatePipe,
    ErrorComponent,
    LoadingComponent,
    EventPosterComponent,
  ],

  templateUrl:
    './event-detail.component.html',

  styleUrl:
    './event-detail.component.css',
})
export class EventDetailComponent {

  private readonly api =
    inject(EventService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly booking =
    inject(BookingStateService);


  readonly event =
    signal<EventItem | null>(
      null
    );


  readonly loading =
    signal(true);


  readonly error =
    signal('');


  readonly id =
    Number(
      this.route
        .snapshot
        .paramMap
        .get('id')
    );


  constructor() {

    this.load();

  }


  load(): void {

    if (!this.id) {

      this.error.set(
        'Invalid event.'
      );

      this.loading.set(
        false
      );

      return;

    }


    this.loading.set(
      true
    );

    this.error.set(
      ''
    );


    this.api
      .get(this.id)
      .subscribe({

        next: (event) => {

          this.event.set(
            event
          );

          this.loading.set(
            false
          );

        },

        error: (error) => {

          this.error.set(
            error.error?.message
            ??
            'Unable to load event.'
          );

          this.loading.set(
            false
          );

        },

      });

  }


  chooseSeats(): void {

    const event =
      this.event();


    if (!event) {

      return;

    }


    this.booking.start(
      event
    );


    void this.router.navigate([
      '/events',
      event.eventId,
      'seats',
    ]);

  }


  back(): void {

    void this.router.navigate([
      '/events',
    ]);

  }

}