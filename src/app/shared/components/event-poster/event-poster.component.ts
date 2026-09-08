import {
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';

import {
  DatePipe,
  NgClass,
  UpperCasePipe,
} from '@angular/common';

import {
  EventItem,
} from '../../../core/models/api.models';


@Component({
  selector:
    'app-event-poster',

  standalone:
    true,

  imports: [
    NgClass,
    DatePipe,
    UpperCasePipe,
  ],

  templateUrl:
    './event-poster.component.html',

  styleUrl:
    './event-poster.component.css',
})
export class EventPosterComponent {

  private readonly eventSignal =
    signal<EventItem | null>(
      null
    );


  @Input({
    required: true,
  })
  set event(
    value: EventItem
  ) {

    this.eventSignal.set(
      value
    );

  }


  readonly currentEvent =
    computed(
      () =>
        this.eventSignal()
    );


  readonly themeClass =
    computed(() => {

      const event =
        this.eventSignal();


      if (!event) {

        return 'theme-default';

      }


      const text =
        `${
          event.eventName ?? ''
        } ${
          event.categoryName ?? ''
        }`
          .toLowerCase();


      if (
        text.includes('music')
        ||
        text.includes('concert')
        ||
        text.includes('live')
        ||
        text.includes('dj')
      ) {

        return 'theme-music';

      }


      if (
        text.includes('sport')
        ||
        text.includes('cricket')
        ||
        text.includes('football')
        ||
        text.includes('game')
      ) {

        return 'theme-sports';

      }


      if (
        text.includes('conference')
        ||
        text.includes('seminar')
        ||
        text.includes('workshop')
        ||
        text.includes('tech')
      ) {

        return 'theme-conference';

      }


      if (
        text.includes('culture')
        ||
        text.includes('cultural')
        ||
        text.includes('dance')
        ||
        text.includes('festival')
      ) {

        return 'theme-cultural';

      }


      if (
        text.includes('exhibition')
        ||
        text.includes('expo')
        ||
        text.includes('showcase')
      ) {

        return 'theme-exhibition';

      }


      return 'theme-default';

    });


  readonly categoryLabel =
    computed(
      () =>
        this.eventSignal()
          ?.categoryName
        ||
        'EVENT'
    );

}