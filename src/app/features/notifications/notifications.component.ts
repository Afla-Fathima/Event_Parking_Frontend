import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgClass, SlicePipe, TitleCasePipe } from '@angular/common';
import { NotificationItem } from '../../core/models/api.models';
import { NotificationService } from '../../core/services/api.services';
import { ShortTextPipe } from '../../shared/pipes/app.pipes';
import {
  EmptyComponent,
  ErrorComponent,
  LoadingComponent,
} from '../../shared/components/states/state-components';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    SlicePipe,
    TitleCasePipe,
    ShortTextPipe,
    EmptyComponent,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  private readonly api = inject(NotificationService);

  readonly items = signal<NotificationItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.mine().subscribe({
      next: (data) => {
        this.items.set(data);
        this.api.syncUnread(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load notifications.');
        this.loading.set(false);
      },
    });
  }

  read(item: NotificationItem): void {
    if (item.isRead) return;

    this.api.markRead(item.notificationId).subscribe({
      next: () =>
        this.items.update((all) =>
          all.map((n) =>
            n.notificationId === item.notificationId ? { ...n, isRead: true } : n,
          ),
        ),
      error: () => this.error.set('Unable to mark notification as read.'),
    });
  }
}

