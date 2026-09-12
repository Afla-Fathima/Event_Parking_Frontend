import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const luhnValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const digits = String(control.value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0 ? null : { luhn: true };
};

export const expiryFutureValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return value ? { expiryFormat: true } : null;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiry = new Date(year, month, 1, 0, 0, 0, 0);
  return expiry > new Date() ? null : { expiryPast: true };
};
