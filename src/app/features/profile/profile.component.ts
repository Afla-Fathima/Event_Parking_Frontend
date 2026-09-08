import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../core/models/api.models';
import { CustomerService } from '../../core/services/api.services';
import { ErrorComponent, LoadingComponent } from '../../shared/components/states/state-components';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, LoadingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly api = inject(CustomerService);
  readonly customer = signal<Customer | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9+\- ]{7,20}$/)],
    }),
  });
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api.me().subscribe({
      next: (c) => {
        this.customer.set(c);
        this.form.setValue({ name: c.name, phoneNumber: c.phoneNumber });
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Unable to load profile.');
        this.loading.set(false);
      },
    });
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.success.set('');
    this.api.updateMe(this.form.getRawValue()).subscribe({
      next: (c) => {
        this.customer.set(c);
        this.busy.set(false);
        this.success.set('Profile updated successfully.');
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'Unable to update profile.');
      },
    });
  }
}
