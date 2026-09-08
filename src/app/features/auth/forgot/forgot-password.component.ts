import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css',
})
export class ForgotComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  readonly busy = signal(false);
  readonly message = signal('');
  readonly token = signal('');

  submit(form: NgForm): void {
    if (form.invalid || this.busy()) return;

    const normalizedEmail = this.email.trim().toLowerCase();
    this.busy.set(true);
    this.message.set('');
    this.token.set('');

    this.auth.forgotPassword(normalizedEmail).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.message.set(response.message);
        const resetToken = (response.resetToken ?? '').trim();
        this.token.set(resetToken);

        if (resetToken) {
          sessionStorage.setItem('parkflow_reset_token', resetToken);
          sessionStorage.setItem('parkflow_reset_email', normalizedEmail);
        }
      },
      error: () => {
        this.busy.set(false);
        this.message.set('If the account exists, a reset request was created.');
      },
    });
  }

  continueToReset(): void {
    if (!this.token()) return;
    void this.router.navigate(['/reset-password']);
  }
}
