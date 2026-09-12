import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { NgClass } from '@angular/common';

import { Seat } from '../../../core/models/api.models';

import {
  SeatLabelPipe
} from '../../../shared/pipes/app.pipes';

import {
  SeatStatusDirective
} from '../../../shared/directives/app.directives';


@Component({

  selector: 'app-seat-button',

  standalone: true,

  imports: [
    NgClass,
    SeatLabelPipe,
    SeatStatusDirective,
  ],

  templateUrl:
    './seat-button.component.html',

  styleUrl:
    './seat-button.component.css',

})


export class SeatButtonComponent {


  @Input({
    required:true
  })
  seat!: Seat;



  @Input()
  selected = false;



  // IMPORTANT
  // parent component expects (select)
  @Output()
  select =
    new EventEmitter<Seat>();




  get available(): boolean {

    return (
      this.seat.status
        ?.trim()
        .toLowerCase()
        ===
        'available'
    );

  }




  clickSeat(): void {


    if(!this.available){

      return;

    }



    this.select.emit(
      this.seat
    );


  }


}