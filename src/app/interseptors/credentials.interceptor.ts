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
  console.log('🍪 [INTERCEPTOR] Request URL:', req.url);
  console.log('🍪 [INTERCEPTOR] Current cookies before request:', document.cookie);
  
  // Добавляем withCredentials ко всем запросам для работы с куками
  const authReq = req.clone({
    withCredentials: true
  });

  console.log('🍪 [INTERCEPTOR] Request with withCredentials:', authReq.withCredentials);

  return next(authReq);
} 