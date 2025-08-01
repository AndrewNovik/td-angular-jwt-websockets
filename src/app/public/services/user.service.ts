import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { LoginResponseI, UserI, ApiResponseI, LoginCredentialsI } from '../public.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieUtils } from '../utils/cookie-utils';

export const snackBarConfig: MatSnackBarConfig = {
  duration: 2500,
  horizontalPosition: 'right',
  verticalPosition: 'top',
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly snackbar: MatSnackBar = inject(MatSnackBar);
  private readonly jwtService: JwtHelperService = inject(JwtHelperService);

  public login(credentials: LoginCredentialsI): Observable<LoginResponseI> {
    console.log('🌐 [SERVICE] Login request with credentials:', credentials);
    CookieUtils.logCookieInfo('Before login request');
    
    return this.http.post<LoginResponseI>('api/users/login', credentials).pipe(
      tap((response: LoginResponseI) => {
        console.log('🌐 [SERVICE] Login response received:', response);
        CookieUtils.logCookieInfo('After login response');
        
        if (response.success && response.data?.user) {
          console.log('🌐 [SERVICE] Login successful, user data:', response.data.user);
        } else {
          console.warn('🌐 [SERVICE] Login response missing user data');
        }
      }),
      catchError((e) => {
        console.error('🌐 [SERVICE] Login request failed:', e);
        CookieUtils.logCookieInfo('After login error');
        const errorMessage = e.error?.message || 'Ошибка входа';
        this.snackbar.open(errorMessage, 'Закрыть', snackBarConfig);
        return throwError(() => e);
      })
    );
  }

  public register(user: UserI): Observable<ApiResponseI<UserI>> {
    return this.http.post<ApiResponseI<UserI>>('api/users', user).pipe(
      tap((response: ApiResponseI<UserI>) => {
        if (response.success && response.data) {
          this.snackbar.open(
            response.message || `Пользователь ${response.data.username} создан`,
            'Закрыть',
            snackBarConfig
          );
        } else {
          this.snackbar.open(
            response.message || 'Ошибка создания пользователя',
            'Закрыть',
            snackBarConfig
          );
        }
      }),
      catchError((e) => {
        const errorMessage = e.error?.message || 'Ошибка создания пользователя';
        this.snackbar.open(errorMessage, 'Закрыть', snackBarConfig);
        return throwError(() => e);
      })
    );
  }

  public logout(): Observable<ApiResponseI<void>> {
    return this.http.post<ApiResponseI<void>>('api/users/logout', {}).pipe(
      tap((response: ApiResponseI<void>) => {
        console.log('Logout successful');
        this.snackbar.open(response.message || 'Выход выполнен', 'Закрыть', snackBarConfig);
      }),
      catchError((e) => {
        console.error('Logout error:', e);
        return throwError(() => e);
      })
    );
  }

  public refreshToken(): Observable<ApiResponseI<void>> {
    return this.http.post<ApiResponseI<void>>('api/users/refresh', {}).pipe(
      tap((response: ApiResponseI<void>) => {
        console.log('Token refreshed:', response.message);
      }),
      catchError((e) => {
        console.error('Token refresh error:', e);
        return throwError(() => e);
      })
    );
  }

  public updateProfile(updates: Partial<UserI>): Observable<ApiResponseI<UserI>> {
    return this.http.put<ApiResponseI<UserI>>('api/users/profile', updates).pipe(
      tap((response: ApiResponseI<UserI>) => {
        if (response.success && response.data) {
          this.snackbar.open(response.message || 'Профиль обновлен', 'Закрыть', snackBarConfig);
        }
      }),
      catchError((e) => {
        const errorMessage = e.error?.message || 'Ошибка обновления профиля';
        this.snackbar.open(errorMessage, 'Закрыть', snackBarConfig);
        return throwError(() => e);
      })
    );
  }

  public getProfile(): Observable<ApiResponseI<UserI>> {
    console.log('🌐 [SERVICE] GetProfile request initiated');
    CookieUtils.logCookieInfo('Before getProfile request');
    
    return this.http.get<ApiResponseI<UserI>>('api/users/profile').pipe(
      tap((response: ApiResponseI<UserI>) => {
        console.log('🌐 [SERVICE] GetProfile response received:', response);
        CookieUtils.logCookieInfo('After getProfile response');
        
        if (response.success && response.data) {
          console.log('🌐 [SERVICE] Profile loaded successfully:', response.data);
        } else {
          console.warn('🌐 [SERVICE] GetProfile response missing user data');
        }
      }),
      catchError((e) => {
        console.error('🌐 [SERVICE] GetProfile request failed:', e);
        CookieUtils.logCookieInfo('After getProfile error');
        return throwError(() => e);
      })
    );
  }
}
