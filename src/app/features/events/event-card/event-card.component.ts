import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe,
} from '@angular/common';

import {
  EventItem,
} from '../../../core/models/api.models';

import {
  ShortTextPipe,
} from '../../../shared/pipes/app.pipes';

import {
  HighlightDirective,
} from '../../../shared/directives/app.directives';

import {
  EventPosterComponent,
} from '../../../shared/components/event-poster/event-poster.component';


@Component({
  selector:
    'app-event-card',

  standalone:
    true,

  imports: [
    CurrencyPipe,
    DatePipe,
    ShortTextPipe,
    HighlightDirective,
    EventPosterComponent,
  ],

  templateUrl:
    './event-card.component.html',

  styleUrl:
    './event-card.component.css',
})
export class EventCardComponent {

  @Input({
    required:
      true,
  })
  event!: EventItem;


  @Output()
  open =
    new EventEmitter<number>();

}