import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export function appInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  // Для работы с куками не нужно добавлять заголовки
  // Браузер автоматически отправляет куки с запросами
  // Просто передаем запрос как есть
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log('Server response received');
          // Можно добавить логику для обработки куки из ответа
          handleCookiesFromResponse(event);
        }
      },
      error: (err) => {
        // Ошибки обрабатываются в auth-error.interceptor
        console.log('Request error:', err);
      }
    })
  );
}

function handleCookiesFromResponse(response: HttpResponse<any>): void {
  // Куки автоматически обрабатываются браузером
  // Здесь можно добавить дополнительную логику если нужно
  console.log('Cookies handled by browser');
}
