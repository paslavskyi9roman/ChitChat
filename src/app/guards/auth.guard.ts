import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  console.log('Auth guard checking localStorage for credentials');

  // Check directly in localStorage
  const username = localStorage.getItem('username');
  const room = localStorage.getItem('room');

  console.log('Auth check - Username from localStorage:', username);
  console.log('Auth check - Room from localStorage:', room);

  if (username && room) {
    console.log('Auth guard: User has credentials, allowing access');
    return true;
  }

  // Redirect to login page
  console.log('Auth guard: No credentials found, redirecting to login');
  router.navigate(['/']);
  return false;
};
