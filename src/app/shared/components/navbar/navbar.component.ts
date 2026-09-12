import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/api.services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DecimalPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly booking = inject(BookingStateService);

  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly unread = this.notifications.unread;
  readonly menuOpen = signal(false);
  readonly isAdmin = computed(() => this.auth.role() === 'Admin');

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.refreshUnread();
      });

    this.refreshUnread();
  }

  logout(): void {
    this.auth.logout();
    this.booking.clear();
    this.notifications.clearUnread();
    this.menuOpen.set(false);
    void this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private refreshUnread(): void {
    if (this.auth.role() !== 'Customer') {
      this.notifications.clearUnread();
      return;
    }

    this.notifications.refreshUnread();
  }
}
