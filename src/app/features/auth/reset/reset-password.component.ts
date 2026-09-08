import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css',
})
export class ResetComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly error = signal('');
  readonly tokenLoaded = signal(false);

  readonly form = new FormGroup({
    token: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  constructor() {
    const savedToken = sessionStorage.getItem('parkflow_reset_token')?.trim() ?? '';
    if (savedToken) {
      this.form.controls.token.setValue(savedToken);
      this.tokenLoaded.set(true);
    }
  }

  submit(): void {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const token = value.token.trim();
    const newPassword = value.newPassword.trim();
    const confirmPassword = value.confirmPassword.trim();

    if (!token) {
      this.error.set('Reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      this.error.set('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.error.set('New password and confirm password must match.');
      return;
    }

    this.error.set('');
    this.busy.set(true);

    this.auth.resetPassword(token, newPassword, confirmPassword).subscribe({
      next: () => {
        this.busy.set(false);
        sessionStorage.removeItem('parkflow_reset_token');
        void this.router.navigate(['/login'], {
          queryParams: { reset: 'success' },
        });
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(
          error.error?.message ??
            'Unable to reset password. Request a fresh token and try again.',
        );
      },
    });
  }
}
