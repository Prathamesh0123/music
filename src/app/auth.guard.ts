import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const token  = localStorage.getItem('token');
  const router = inject(Router);
  const authService = inject(AuthService);

  if(!token){
    router.navigate(['/signup']);
    alert('Plz sign Up');
    return false;
  }

  return authService.checkSession(token).pipe(
    map((res: any) => {

        return true; 
    }),
    catchError(() => {
      alert('session expired login again');
      router.navigate(['/']);
      return of(router.createUrlTree(['/login']));
    })
  );
};
