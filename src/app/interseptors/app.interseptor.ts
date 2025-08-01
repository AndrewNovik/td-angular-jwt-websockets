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
  console.log('🌐 [INTERCEPTOR] Request URL:', req.url);
  console.log('🌐 [INTERCEPTOR] Request headers:', req.headers.keys());
  
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log('🌐 [INTERCEPTOR] Server response received');
        console.log('🌐 [INTERCEPTOR] Response status:', event.status);
        console.log('🌐 [INTERCEPTOR] Response headers:', event.headers.keys());
        
        // Проверяем заголовки, связанные с куками
        const setCookieHeader = event.headers.get('set-cookie');
        if (setCookieHeader) {
          console.log('🌐 [INTERCEPTOR] Set-Cookie header found:', setCookieHeader);
        } else {
          console.warn('🌐 [INTERCEPTOR] No Set-Cookie header in response!');
        }
        
        const accessControlAllowCredentials = event.headers.get('access-control-allow-credentials');
        console.log('🌐 [INTERCEPTOR] Access-Control-Allow-Credentials:', accessControlAllowCredentials);
        
        console.log('🌐 [INTERCEPTOR] Cookies handled by browser');
      }
    })
  );
}
