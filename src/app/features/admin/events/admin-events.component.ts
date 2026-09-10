import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  forkJoin
} from 'rxjs';

import {
  Category,
  EventItem,
  EventWrite,
  Venue
} from '../../../core/models/api.models';

import {
  BookingService,
  CategoryService,
  EventService,
  VenueService
} from '../../../core/services/api.services';

import {
  ConfirmDialogComponent,
  EmptyComponent,
  LoadingComponent,
} from '../../../shared/components/states/state-components';

import {
  futureDateValidator
} from './future-date.validator';


@Component({
  selector:
    'app-admin-events',

  standalone:
    true,

  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    ConfirmDialogComponent,
    EmptyComponent,
    LoadingComponent,
  ],

  templateUrl:
    './admin-events.component.html',

  styleUrl:
    './admin-events.component.css',
})
export class AdminEventsComponent {

  private readonly api =
    inject(EventService);

  private readonly bookingApi =
    inject(BookingService);

  private readonly venuesApi =
    inject(VenueService);

  private readonly categoriesApi =
    inject(CategoryService);


  readonly events =
    signal<EventItem[]>([]);

  readonly venues =
    signal<Venue[]>([]);

  readonly categories =
    signal<Category[]>([]);


  readonly loading =
    signal(true);

  readonly busy =
    signal(false);

  readonly error =
    signal('');


  readonly editing =
    signal<EventItem | null>(
      null
    );

  readonly deleteTarget =
    signal<EventItem | null>(
      null
    );


  /*
   * Ticket price BRD locking state.
   */

  readonly checkingBookings =
    signal(false);

  readonly ticketPriceLocked =
    signal(false);

  readonly ticketPriceHint =
    signal('');


  readonly form =
    new FormGroup({

      eventName:
        new FormControl(
          '',
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.minLength(2)
            ],
          }
        ),


      eventDate:
        new FormControl(
          '',
          {
            nonNullable: true,

            validators: [
              Validators.required,
              futureDateValidator
            ],
          }
        ),


      startTime:
        new FormControl(
          '18:00',
          {
            nonNullable: true,

            validators: [
              Validators.required
            ],
          }
        ),


      endTime:
        new FormControl(
          '21:00',
          {
            nonNullable: true,

            validators: [
              Validators.required
            ],
          }
        ),


      description:
        new FormControl(
          '',
          {
            nonNullable: true
          }
        ),


      ticketPrice:
        new FormControl(
          2500,
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.min(0)
            ],
          }
        ),


      parkingFee:
        new FormControl(
          500,
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.min(0)
            ],
          }
        ),


      capacity:
        new FormControl(
          50,
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.min(1),
              Validators.max(200)
            ],
          }
        ),


      venueId:
        new FormControl(
          0,
          {
            nonNullable: true,

            validators: [
              Validators.min(1)
            ],
          }
        ),


      categoryId:
        new FormControl(
          0,
          {
            nonNullable: true,

            validators: [
              Validators.min(1)
            ],
          }
        ),
    });


  constructor() {

    this.load();
  }


  load(): void {

    this.loading.set(
      true
    );

    this.error.set(
      ''
    );


    forkJoin({

      events:
        this.api.list(),

      venues:
        this.venuesApi.list(),

      categories:
        this.categoriesApi.list(),

    })
      .subscribe({

        next:
          result => {

            this.events.set(
              result.events
            );

            this.venues.set(
              result.venues
            );

            this.categories.set(
              result.categories
            );

            this.loading.set(
              false
            );
          },


        error:
          error => {

            this.error.set(
              error.error?.message ??
              'Unable to load admin event data.'
            );

            this.loading.set(
              false
            );
          },
      });
  }


  edit(
    event: EventItem
  ): void {

    this.editing.set(
      event
    );


    this.error.set(
      ''
    );


    this.ticketPriceLocked.set(
      false
    );


    this.ticketPriceHint.set(
      'Checking whether bookings already exist…'
    );


    this.checkingBookings.set(
      true
    );


    /*
     * Enable first so setValue is simple.
     */
    this.form.controls
      .ticketPrice
      .enable({
        emitEvent: false
      });


    this.form.setValue({

      eventName:
        event.eventName,

      eventDate:
        event.eventDate,

      startTime:
        event.startTime
          .slice(0, 5),

      endTime:
        event.endTime
          .slice(0, 5),

      description:
        event.description,

      ticketPrice:
        event.ticketPrice,

      parkingFee:
        event.parkingFee,

      capacity:
        event.capacity,

      venueId:
        event.venueId,

      categoryId:
        event.categoryId,
    });


    /*
     * Booking check finish varaikum
     * price temporarily lock.
     */
    this.form.controls
      .ticketPrice
      .disable({
        emitEvent: false
      });


    const eventId =
      event.eventId;


    this.bookingApi
      .byEvent(
        eventId
      )
      .subscribe({

        next:
          bookings => {

            /*
             * User meanwhile vera event
             * click pannina old response ignore.
             */
            if (
              this.editing()
                ?.eventId !==
              eventId
            ) {

              return;
            }


            /*
             * Any booking history means
             * ticket price should remain locked.
             */
            const hasBookings =
              bookings.length > 0;


            this.checkingBookings.set(
              false
            );


            this.ticketPriceLocked.set(
              hasBookings
            );


            if (hasBookings) {

              this.form.controls
                .ticketPrice
                .disable({
                  emitEvent: false
                });


              this.ticketPriceHint.set(
                'Ticket price is locked because this event already has booking history.'
              );

            }
            else {

              this.form.controls
                .ticketPrice
                .enable({
                  emitEvent: false
                });


              this.ticketPriceHint.set(
                ''
              );
            }
          },


        error:
          error => {

            if (
              this.editing()
                ?.eventId !==
              eventId
            ) {

              return;
            }


            this.checkingBookings.set(
              false
            );


            /*
             * Safe default:
             * if verification failed,
             * don't allow price change.
             */
            this.ticketPriceLocked.set(
              true
            );


            this.form.controls
              .ticketPrice
              .disable({
                emitEvent: false
              });


            this.ticketPriceHint.set(
              'Ticket price is temporarily locked because booking history could not be verified.'
            );


            this.error.set(
              error.error?.message ??
              'Unable to verify booking history for this event.'
            );
          },
      });
  }


  reset(): void {

    this.editing.set(
      null
    );


    this.checkingBookings.set(
      false
    );


    this.ticketPriceLocked.set(
      false
    );


    this.ticketPriceHint.set(
      ''
    );


    this.form.controls
      .ticketPrice
      .enable({
        emitEvent: false
      });


    this.form.reset({

      eventName:
        '',

      eventDate:
        '',

      startTime:
        '18:00',

      endTime:
        '21:00',

      description:
        '',

      ticketPrice:
        2500,

      parkingFee:
        500,

      capacity:
        50,

      venueId:
        0,

      categoryId:
        0,
    });
  }


  save(): void {

    if (
      this.form.invalid ||
      this.busy() ||
      this.checkingBookings()
    ) {

      this.form
        .markAllAsTouched();

      return;
    }


    this.busy.set(
      true
    );


    this.error.set(
      ''
    );


    /*
     * Important:
     *
     * ticketPrice disabled irunthalum
     * getRawValue() athai include pannum.
     *
     * So original ticketPrice backend-ku
     * send aakum.
     */
    const raw =
      this.form
        .getRawValue();


    const value:
      EventWrite =
    {

      ...raw,

      startTime:
        this.withSeconds(
          raw.startTime
        ),

      endTime:
        this.withSeconds(
          raw.endTime
        ),
    };


    const current =
      this.editing();


    const request =
      current

        ? this.api.update(
            current.eventId,
            value
          )

        : this.api.create(
            value
          );


    request.subscribe({

      next: () => {

        this.busy.set(
          false
        );

        this.reset();

        this.load();
      },


      error:
        error => {

          this.busy.set(
            false
          );

          this.error.set(
            error.error?.message ??
            'Unable to save event.'
          );
        },
    });
  }


  remove(): void {

    const event =
      this.deleteTarget();


    if (!event) {
      return;
    }


    this.api
      .delete(
        event.eventId
      )
      .subscribe({

        next: () => {

          this.deleteTarget.set(
            null
          );

          this.load();
        },


        error:
          error => {

            this.deleteTarget.set(
              null
            );


            this.error.set(
              error.error?.message ??
              'Event cannot be deleted.'
            );
          },
      });
  }


  private withSeconds(
    value: string
  ): string {

    return (
      value.length === 5

        ? `${value}:00`

        : value
    );
  }
}