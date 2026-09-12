import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `<div class="state">
    <span class="spinner"></span><strong>{{ text }}</strong>
  </div>`,
  styles: [
    `
      .state {
        min-height: 220px;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 14px;
        color: var(--muted);
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e4e8f1;
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingComponent {
  @Input() text = 'Loading…';
}

@Component({
  selector: 'app-error',
  standalone: true,
  template: `<div class="error">
    <strong>Something needs attention</strong>
    <p>{{ message }}</p>
    <button class="btn btn-outline btn-sm" type="button" (click)="retry.emit()">Try again</button>
  </div>`,
  styles: [
    `
      .error {
        padding: 18px;
        border: 1px solid #ffd4dc;
        border-radius: 14px;
        background: #fff4f6;
        color: #9f2e42;
      }
      .error p {
        margin: 5px 0 12px;
      }
    `,
  ],
})
export class ErrorComponent {
  @Input() message = 'Unable to load data.';
  @Output() retry = new EventEmitter<void>();
}

@Component({
  selector: 'app-empty',
  standalone: true,
  template: `<div class="empty">
    <div class="icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ text }}</p>
    <ng-content />
  </div>`,
  styles: [
    `
      .empty {
        min-height: 230px;
        display: grid;
        place-items: center;
        align-content: center;
        text-align: center;
        padding: 28px;
      }
      .icon {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: var(--primary-soft);
        color: var(--primary);
        font-weight: 900;
        margin-bottom: 10px;
      }
      .empty h3 {
        margin: 0 0 6px;
      }
      .empty p {
        margin: 0 0 15px;
        color: var(--muted);
        max-width: 460px;
      }
    `,
  ],
})
export class EmptyComponent {
  @Input() icon = '◇';
  @Input() title = 'Nothing here yet';
  @Input() text = 'There is no data to display.';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `@if (open) {
    <div class="backdrop" (click)="cancel.emit()">
      <section class="dialog" (click)="$event.stopPropagation()">
        <div class="warn">!</div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="actions">
          <button type="button" class="btn btn-outline" (click)="cancel.emit()">Cancel</button
          ><button type="button" class="btn btn-primary" (click)="confirm.emit()">
            {{ confirmText }}
          </button>
        </div>
      </section>
    </div>
  }`,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 3000;
        background: rgba(9, 16, 31, 0.58);
        display: grid;
        place-items: center;
        padding: 20px;
      }
      .dialog {
        width: min(440px, 100%);
        background: #fff;
        border-radius: 20px;
        padding: 26px;
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
        text-align: center;
      }
      .warn {
        width: 50px;
        height: 50px;
        margin: 0 auto 12px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--warning-soft);
        color: var(--warning);
        font-weight: 900;
      }
      .dialog p {
        color: var(--muted);
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Please confirm';
  @Input() message = 'Continue with this action?';
  @Input() confirmText = 'Confirm';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}


@Component({
  selector: 'app-route-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class RouteShellComponent {}

