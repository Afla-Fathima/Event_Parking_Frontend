import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly navigating = signal(false);
  readonly authPage = signal(this.isAuthUrl(this.router.url));

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationStart) this.navigating.set(true);
      if (event instanceof NavigationEnd) {
        this.navigating.set(false);
        this.authPage.set(this.isAuthUrl(event.urlAfterRedirects));
      }
    });
  }

  private isAuthUrl(url: string): boolean {
    return ['/login', '/register', '/forgot-password', '/reset-password'].some((path) =>
      url.startsWith(path),
    );
  }
}
