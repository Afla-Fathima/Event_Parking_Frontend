import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `<article class="stat">
    <div class="icon">{{ icon }}</div>
    <div>
      <span>{{ label }}</span
      ><strong>{{ value }}</strong
      ><small>{{ hint }}</small>
    </div>
  </article>`,
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  @Input() icon = '•';
  @Input() label = '';
  @Input() value: string | number | null = '';
  @Input() hint = '';
}
