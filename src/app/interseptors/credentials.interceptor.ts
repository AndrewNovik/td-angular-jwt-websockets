import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export function credentialsInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  // Добавляем withCredentials ко всем запросам для работы с куками
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq);
} 