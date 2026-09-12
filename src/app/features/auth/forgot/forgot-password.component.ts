import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  FormsModule,
  NgForm,
} from '@angular/forms';

import {
  Router,
} from '@angular/router';

import {
  AuthService,
} from '../../../core/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,

  imports: [
    FormsModule,
    
  ],

  templateUrl:
    './forgot-password.component.html',

  styleUrl:
    './forgot-password.component.css',
})
export class ForgotComponent {

  private readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);


  email = '';


  readonly busy =
    signal(false);

  readonly message =
    signal('');

  readonly error =
    signal('');

  readonly token =
    signal('');


  submit(
    form: NgForm,
  ): void {

    if (
      form.invalid ||
      this.busy()
    ) {
      return;
    }

    const normalizedEmail =
      this.email
        .trim()
        .toLowerCase();


    this.busy.set(true);

    this.message.set('');

    this.error.set('');

    this.token.set('');


    this.auth
      .forgotPassword(
        normalizedEmail,
      )
      .subscribe({

        next: response => {

          this.busy.set(false);

          this.message.set(
            response.message,
          );

          const resetToken =
            response.resetToken
              ?.trim() ?? '';


          if (resetToken) {

            this.token.set(
              resetToken,
            );

            sessionStorage.setItem(
              'parkflow_reset_token',
              resetToken,
            );

            sessionStorage.setItem(
              'parkflow_reset_email',
              normalizedEmail,
            );

          } else {

            sessionStorage.removeItem(
              'parkflow_reset_token',
            );

            /*
             Development token missing means
             either account is not in this DB,
             or backend is not running in
             Development mode.
            */
          }
        },


        error: err => {

          this.busy.set(false);

          if (err.status === 0) {

            this.error.set(
              'Backend API is not reachable. Make sure the API is running on http://localhost:5188.',
            );

            return;
          }

          this.error.set(
            err.error?.message ??
            'Unable to create password reset request.',
          );
        },

      });
  }


  continueToReset(): void {

    const resetToken =
      this.token();

    if (!resetToken) {
      return;
    }

    void this.router.navigate(
      ['/reset-password'],
      {
        queryParams: {
          token:
            resetToken,
        },
      },
    );
  }
}