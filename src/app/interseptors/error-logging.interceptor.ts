import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';

export function errorLoggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Логируем ошибку
      console.error('HTTP Error:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        error: error.error
      });

      // Обрабатываем различные типы ошибок
      switch (error.status) {
        case 400:
          showErrorNotification('Некорректный запрос', snackBar);
          break;
        case 403:
          showErrorNotification('Доступ запрещен', snackBar);
          break;
        case 404:
          showErrorNotification('Ресурс не найден', snackBar);
          break;
        case 500:
          showErrorNotification('Ошибка сервера', snackBar);
          break;
        case 502:
        case 503:
        case 504:
          showErrorNotification('Сервер временно недоступен', snackBar);
          break;
        default:
          if (error.status >= 500) {
            showErrorNotification('Ошибка сервера', snackBar);
          } else if (error.status >= 400) {
            showErrorNotification('Ошибка клиента', snackBar);
          }
      }

      return throwError(() => error);
    })
  );
}

function showErrorNotification(message: string, snackBar: MatSnackBar): void {
  snackBar.open(message, 'Закрыть', {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  });
} 