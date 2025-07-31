import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { LoginResponseI, UserI, ApiResponseI, LoginCredentialsI } from '../public.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

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
    console.log(credentials);
    return this.http.post<LoginResponseI>('api/users/login', credentials).pipe(
      tap((response: LoginResponseI) => {
        console.log('Login response:', response);
      }),
      catchError((e) => {
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
    return this.http.get<ApiResponseI<UserI>>('api/users/profile').pipe(
      tap((response: ApiResponseI<UserI>) => {
        if (response.success && response.data) {
          console.log('Profile loaded:', response.data);
        }
      }),
      catchError((e) => {
        console.error('Get profile error:', e);
        return throwError(() => e);
      })
    );
  }
}
