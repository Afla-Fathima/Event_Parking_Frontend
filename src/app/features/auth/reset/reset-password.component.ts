import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  AuthService,
} from '../../../core/services/auth.service';


@Component({
  selector: 'app-reset-password',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],

  templateUrl:
    './reset-password.component.html',

  styleUrl:
    './reset-password.component.css',
})
export class ResetComponent {

  private readonly auth =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);


  readonly busy =
    signal(false);

  readonly error =
    signal('');

  readonly tokenLoaded =
    signal(false);


  readonly form =
    new FormGroup({

      token:
        new FormControl(
          '',
          {
            nonNullable: true,

            validators: [
              Validators.required,
            ],
          },
        ),


      newPassword:
        new FormControl(
          '',
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.minLength(6),
            ],
          },
        ),


      confirmPassword:
        new FormControl(
          '',
          {
            nonNullable: true,

            validators: [
              Validators.required,
              Validators.minLength(6),
            ],
          },
        ),

    });


  constructor() {

    /*
      1. URL token
      /reset-password?token=ABC

      2. Session fallback
    */

    const queryToken =
      this.route.snapshot
        .queryParamMap
        .get('token')
        ?.trim() ?? '';


    const sessionToken =
      sessionStorage
        .getItem(
          'parkflow_reset_token',
        )
        ?.trim() ?? '';


    const token =
      queryToken ||
      sessionToken;


    if (token) {

      this.form.controls
        .token
        .setValue(token);

      this.tokenLoaded.set(
        true,
      );

      sessionStorage.setItem(
        'parkflow_reset_token',
        token,
      );
    }
  }


  submit(): void {

    if (
      this.form.invalid ||
      this.busy()
    ) {

      this.form
        .markAllAsTouched();

      return;
    }


    const value =
      this.form.getRawValue();


    const token =
      value.token.trim();

    const newPassword =
      value.newPassword;

    const confirmPassword =
      value.confirmPassword;


    if (!token) {

      this.error.set(
        'Reset token is required.',
      );

      return;
    }


    if (
      newPassword.length < 6
    ) {

      this.error.set(
        'New password must contain at least 6 characters.',
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      this.error.set(
        'New password and confirm password must match.',
      );

      return;
    }


    this.error.set('');

    this.busy.set(true);


    this.auth
      .resetPassword(
        token,
        newPassword,
        confirmPassword,
      )
      .subscribe({

        next: () => {

          this.busy.set(false);

          sessionStorage.removeItem(
            'parkflow_reset_token',
          );

          sessionStorage.removeItem(
            'parkflow_reset_email',
          );


          void this.router.navigate(
            ['/login'],
            {
              queryParams: {
                reset: 'success',
              },
            },
          );
        },


        error: err => {

          this.busy.set(false);

          this.error.set(
            err.error?.message ??
            'Unable to reset password. Request a fresh token and try again.',
          );
        },

      });
  }
}