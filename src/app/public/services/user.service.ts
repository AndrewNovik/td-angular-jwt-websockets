import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { LoginResponceI, UserI } from '../public.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';

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

  login(user: UserI): Observable<LoginResponceI> {
    return this.http.post<LoginResponceI>('api/users/login', user).pipe(
      tap((res: LoginResponceI) => {
        console.log(res);
        localStorage.setItem('nest', res.access_token);
      }),
      tap(() =>
        this.snackbar.open('Login Successfull', 'Close', snackBarConfig)
      ),
      catchError((e) => {
        this.snackbar.open(`${e.error.message}`, 'Close', snackBarConfig);
        return throwError(e);
      })
    );
  }

  register(user: UserI): Observable<UserI> {
    return this.http.post<UserI>('api/users', user).pipe(
      tap((createdUser: UserI) =>
        this.snackbar.open(
          `user ${createdUser.username} was created`,
          'Close',
          snackBarConfig
        )
      ),
      catchError((e) => {
        this.snackbar.open(
          `User can not be created${e.error.message}`,
          'Close',
          snackBarConfig
        );
        return throwError(e);
      })
    );
  }
}
