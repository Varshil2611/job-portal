import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../shared/store/auth.store';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const role = authStore.userRole();

  if (!authStore.isLoggedIn()) return true;

  if (role === 'candidate') router.navigate(['/candidate/dashboard']);
  else if (role === 'employer') router.navigate(['/employer/dashboard']);
  else if (role === 'admin') router.navigate(['/admin/dashboard']);

  return false;
};