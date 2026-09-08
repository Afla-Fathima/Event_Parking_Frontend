import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ParkingSlot } from '../../../core/models/api.models';
import { SlotCodePipe } from '../../../shared/pipes/app.pipes';
@Component({
  selector: 'app-parking-slot-button',
  standalone: true,
  imports: [NgClass, SlotCodePipe],
  templateUrl: './parking-slot-button.component.html',
  styleUrl: './parking-slot-button.component.css',
})
export class ParkingSlotButtonComponent {
  @Input({ required: true }) slot!: ParkingSlot;
  @Input() selected = false;
  @Output() toggled = new EventEmitter<ParkingSlot>();
  readonly available = computed(() => this.slot?.status?.toLowerCase() === 'available');
  click(): void {
    if (this.available()) this.toggled.emit(this.slot);
  }
}
