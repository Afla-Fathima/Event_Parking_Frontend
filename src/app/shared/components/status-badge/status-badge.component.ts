import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge ' + tone()"
    ><span class="dot"></span>{{ label }}</span
  >`,
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  tone(): string {
    const value = this.label.toLowerCase();
    if (['confirmed', 'paid', 'active', 'available', 'completed'].some((x) => value.includes(x)))
      return 'good';
    if (['pending', 'reserved'].some((x) => value.includes(x))) return 'warn';
    if (['cancelled', 'expired', 'inactive', 'occupied', 'booked'].some((x) => value.includes(x)))
      return 'bad';
    return 'neutral';
  }
}
