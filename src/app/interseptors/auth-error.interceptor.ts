import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, catchError, throwError } from 'rxjs';
import * as UserActions from '../store/actions/user.actions';

export function authErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('Unauthorized access detected - clearing user state and redirecting to login');
        
        // Очищаем состояние пользователя в store
        store.dispatch(UserActions.clearUserState());
        
        // Сохраняем текущий путь для редиректа после логина
        const currentPath = window.location.pathname;
        if (currentPath !== '/public/login' && currentPath !== '/public/register') {
          store.dispatch(UserActions.saveLastPath({ path: currentPath }));
        }
        
        // Перенаправляем на страницу логина
        router.navigate(['/public/login']);
      }
      
      return throwError(() => error);
    })
  );
} 