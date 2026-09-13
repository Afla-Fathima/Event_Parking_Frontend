import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';


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



@Component({

  selector:'app-seat-selection',

  standalone:true,

  imports:[

    SeatButtonComponent

  ],

  templateUrl:
    './seat-selection.component.html',

  styleUrl:
    './seat-selection.component.css'

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
this.route.snapshot.paramMap.get('id')
);




readonly event =
signal<EventItem|null>(null);



readonly seats =
signal<Seat[]>([]);



readonly loading =
signal(true);



readonly error =
signal('');





readonly maxVisibleSeats =
200;






readonly displaySeats =
computed(()=>


this.seats()

.filter(
seat =>
this.parseSeatCode(
seat.seatNumber
)!==null
)


.sort(
(a,b)=>
this.compareSeats(a,b)
)


.slice(
0,
this.maxVisibleSeats
)


);






// selected seat id list

readonly selectedSeatIds =
computed(()=>

new Set(

this.state
.selectedSeats()
.map(
seat=>seat.seatId
)

)

);







readonly availableCount =
computed(()=>


this.displaySeats()

.filter(

seat=>

seat.status
.toLowerCase()
===
'available'

)

.length


);






constructor(){

this.load();

}







load():void{


this.loading.set(true);


this.eventApi
.get(this.eventId)

.subscribe({


next:event=>{


this.event.set(event);


this.state.start(event);


this.loadSeats();


},


error:error=>{


this.error.set(

error.error?.message ??
'Unable to load event'

);


this.loading.set(false);


}


});


}









toggleSeat(seat:Seat):void{


const current =
this.state.selectedSeats();




const exists =

current.some(

item=>

item.seatId ===
seat.seatId

);





if(exists){



this.state.selectedSeats.set(


current.filter(

item=>

item.seatId !==
seat.seatId

)


);



}

else{



this.state.selectedSeats.set(

[

...current,

seat

]

);



}



}









continue():void{


if(
this.state.seatCount()===0
){

return;

}



void this.router.navigate([

'/events',

this.eventId,

'parking'

]);


}








back():void{


void this.router.navigate([

'/events',

this.eventId

]);


}








private loadSeats():void{


this.seatApi
.list(this.eventId)

.subscribe({


next:data=>{


this.seats.set(data);


this.loading.set(false);



},


error:(error:HttpErrorResponse)=>{


this.error.set(

error.error?.message ??
'Unable to load seats'

);


this.loading.set(false);


}


});


}








private compareSeats(
a:Seat,
b:Seat
):number{


return a.seatNumber.localeCompare(
b.seatNumber,
undefined,
{
numeric:true
}
);


}








private parseSeatCode(
value:string
){


const match =

value
.trim()
.toUpperCase()
.match(/^([A-T])(\d+)$/);



return match
?
{
row:match[1],
number:Number(match[2])
}
:
null;


}



}