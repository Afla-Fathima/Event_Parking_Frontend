import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { Seat } from '../../../core/models/api.models';
import { SeatLabelPipe } from '../../../shared/pipes/app.pipes';
import { SeatStatusDirective } from '../../../shared/directives/app.directives';
@Component({
  selector: 'app-seat-button',
  standalone: true,
  imports: [NgClass, SeatLabelPipe, SeatStatusDirective],
  templateUrl: './seat-button.component.html',
  styleUrl: './seat-button.component.css',
})
export class SeatButtonComponent {
  @Input({ required: true }) seat!: Seat;
  @Input() selected = false;
  @Output() toggled = new EventEmitter<Seat>();
  readonly available = computed(() => this.seat?.status?.toLowerCase() === 'available');
  click(): void {
    if (this.available()) this.toggled.emit(this.seat);
  }
}
