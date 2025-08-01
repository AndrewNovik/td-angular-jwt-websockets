import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as UserActions from '../actions/user.actions';
import { UserService } from '../../public/services/user.service';
import { UserState } from '../reducers/user.reducer';
import { CookieUtils } from '../../public/utils/cookie-utils';
import { AuthDebug } from '../../public/utils/auth-debug';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);
  private readonly store = inject(Store<{ user: UserState }>);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      tap(({ credentials }) => {
        console.log('🔐 [EFFECTS] Login effect triggered with credentials:', credentials);
        CookieUtils.logCookieInfo('Before login effect');
      }),
      mergeMap(({ credentials }) =>
        this.userService.login(credentials).pipe(
          tap(response => {
            console.log('🔐 [EFFECTS] Login service response:', response);
            CookieUtils.logCookieInfo('After login service response');
          }),
          map(response => UserActions.loginSuccess({ response })),
          catchError(error => {
            console.error('🔐 [EFFECTS] Login effect error:', error);
            CookieUtils.logCookieInfo('After login effect error');
            const errorMessage = error.error?.message || 'Login failed';
            return of(UserActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Login Success Effect
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginSuccess),
      tap(({ response }) => {
        console.log('✅ [EFFECTS] Login Success Effect triggered:', response);
        CookieUtils.logCookieInfo('After login success effect');
        console.log('✅ [EFFECTS] Current URL before navigation:', this.router.url);
        
        // Запускаем диагностику
        AuthDebug.diagnoseAuthState();
        AuthDebug.checkCorsIssues();
        AuthDebug.getRecommendations();
      }),
      switchMap(({ response }) => {
        if (response.success) {
          // Получаем последний путь из store и навигируем
          return this.store.select(state => state.user.lastPath).pipe(
            take(1),
            tap(lastPath => {
              console.log('✅ [EFFECTS] Last path from store:', lastPath);
              
              // Проверяем, нужно ли перенаправить на dashboard
              const shouldRedirectToDashboard = 
                !lastPath || 
                lastPath === '/' ||
                lastPath === '/private/dashboard' || 
                lastPath === '/public/login' || 
                lastPath === '/public/register' ||
                lastPath === '/public' ||
                !lastPath.startsWith('/private');
              
              if (shouldRedirectToDashboard) {
                console.log('✅ [EFFECTS] Redirecting to dashboard (reason: invalid or public path)');
                console.log('✅ [EFFECTS] Last path was:', lastPath);
                this.router.navigate(['/private/dashboard']);
              } else {
                console.log('✅ [EFFECTS] Navigating to saved private path:', lastPath);
                this.router.navigate([lastPath]);
              }
            }),
            map(() => ({ type: '[User] Login Success Navigation' }))
          );
        }
        return of({ type: '[User] Login Success - No Navigation' });
      })
    ),
    { dispatch: false }
  );

  // Register Effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.register),
      mergeMap(({ userData }) =>
        this.userService.register(userData).pipe(
          map(response => UserActions.registerSuccess({ response })),
          catchError(error => {
            const errorMessage = error.error?.message || 'Registration failed';
            return of(UserActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logout),
      mergeMap(() =>
        this.userService.logout().pipe(
          map(response => UserActions.logoutSuccess({ response })),
          catchError(error => {
            const errorMessage = error.error?.message || 'Logout failed';
            return of(UserActions.logoutFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Logout Success Effect
  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logoutSuccess),
      tap(() => {
        this.router.navigate(['/public/login']);
      }),
      map(() => ({ type: '[User] Logout Success Navigation' }))
    ),
    { dispatch: false }
  );

  // Load Profile Effect
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfile),
      mergeMap(() =>
        this.userService.getProfile().pipe(
          map(response => UserActions.loadProfileSuccess({ response })),
          catchError(error => {
            const errorMessage = error.error?.message || 'Failed to load profile';
            return of(UserActions.loadProfileFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Load Profile Success Effect - для автоматической навигации после валидации
  loadProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfileSuccess),
      tap(({ response }) => {
        console.log('✅ [EFFECTS] Load Profile Success Effect triggered:', response);
        console.log('✅ [EFFECTS] Current URL:', window.location.pathname);
        CookieUtils.logCookieInfo('After profile load success');
        
        if (response.success && response.data) {
          // Если это валидация при запуске приложения, перенаправляем в приватную часть
          const currentUrl = window.location.pathname;
          if (currentUrl === '/' || currentUrl === '/public' || currentUrl === '/public/login' || currentUrl === '/public/register') {
            console.log('✅ [EFFECTS] Auto-navigating to private area after profile validation');
            this.router.navigate(['/private/dashboard']);
          } else {
            console.log('✅ [EFFECTS] Already in private area, no navigation needed');
          }
        } else {
          console.log('✅ [EFFECTS] Profile validation failed, no navigation');
        }
      }),
      map(() => ({ type: '[User] Load Profile Success Navigation' }))
    ),
    { dispatch: false }
  );

  // Update Profile Effect
  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateProfile),
      mergeMap(({ updates }) =>
        this.userService.updateProfile(updates).pipe(
          map(response => UserActions.updateProfileSuccess({ response })),
          catchError(error => {
            const errorMessage = error.error?.message || 'Failed to update profile';
            return of(UserActions.updateProfileFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Refresh Token Effect
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.refreshToken),
      mergeMap(() =>
        this.userService.refreshToken().pipe(
          map(response => UserActions.refreshTokenSuccess({ response })),
          catchError(error => {
            const errorMessage = error.error?.message || 'Token refresh failed';
            return of(UserActions.refreshTokenFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Error Handling Effect
  handleError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UserActions.loginFailure,
        UserActions.registerFailure,
        UserActions.logoutFailure,
        UserActions.loadProfileFailure,
        UserActions.updateProfileFailure,
        UserActions.refreshTokenFailure
      ),
      tap(({ error }) => {
        this.snackBar.open(error, 'Закрыть', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }),
      map(() => ({ type: '[User] Error Handled' }))
    ),
    { dispatch: false }
  );

  // Success Messages Effect
  handleSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UserActions.loginSuccess,
        UserActions.registerSuccess,
        UserActions.updateProfileSuccess
      ),
      tap(({ response }) => {
        if (response.message) {
          this.snackBar.open(response.message, 'Закрыть', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      }),
      map(() => ({ type: '[User] Success Handled' }))
    ),
    { dispatch: false }
  );
} 