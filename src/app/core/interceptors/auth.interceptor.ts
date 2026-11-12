import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('vic_admin_token');

  if (token && req.url.includes('/api/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned).pipe(catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login')) {
        localStorage.removeItem('vic_admin_token');
        localStorage.removeItem('vic_admin_user');
        void router.navigate(['/admin/login'], {
          queryParams: { returnUrl: router.url },
          state: { sessionExpired: true }
        });
      }
      return throwError(() => error);
    }));
  }

  return next(req);
};
