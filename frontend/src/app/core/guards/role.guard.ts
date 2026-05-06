import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStore } from '../../shared/store/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] || [];
  const userRole = authStore.userRole();

  if (userRole && allowedRoles.includes(userRole)) return true;

  // Redirect to their own dashboard
  if (userRole === 'candidate') router.navigate(['/candidate/dashboard']);
  else if (userRole === 'employer') router.navigate(['/employer/dashboard']);
  else if (userRole === 'admin') router.navigate(['/admin/dashboard']);
  else router.navigate(['/login']);

  return false;
};