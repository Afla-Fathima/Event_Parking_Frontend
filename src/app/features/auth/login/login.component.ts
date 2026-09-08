import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.goHome();
      return;
    }

    if (this.route.snapshot.queryParamMap.get('reset') === 'success') {
      this.success.set('Password updated successfully. Sign in with your new password.');
      this.email = sessionStorage.getItem('parkflow_reset_email') ?? '';
      this.password = '';
    }
  }

  submit(form: NgForm): void {
    if (form.invalid || this.busy()) return;

    this.busy.set(true);
    this.error.set('');

    const normalizedPassword = this.password.trim();
    if (!normalizedPassword) {
      this.busy.set(false);
      this.error.set('Password is required.');
      return;
    }

    this.auth.login({ email: this.email.trim(), password: normalizedPassword }).subscribe({
      next: () => {
        this.busy.set(false);
        sessionStorage.removeItem('parkflow_reset_email');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) void this.router.navigateByUrl(returnUrl);
        else this.goHome();
      },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);

        const apiMessage =
          typeof error.error?.message === 'string' ? error.error.message : '';

        if (apiMessage) {
          this.error.set(apiMessage);
          return;
        }

        this.error.set(
          error.status === 401
            ? 'Invalid email or password.'
            : 'Unable to sign in. Make sure the API is running on port 5188.',
        );
      },
    });
  }

  private goHome(): void {
    void this.router.navigate([this.auth.role() === 'Admin' ? '/admin/dashboard' : '/dashboard']);
  }
}
