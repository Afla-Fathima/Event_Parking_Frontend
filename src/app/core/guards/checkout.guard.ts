import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingStateService } from '../services/booking-state.service';

export const checkoutGuard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);
  if (state.seatCount() > 0 && state.event()) return true;
  return router.createUrlTree(['/events']);
};
