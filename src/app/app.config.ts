import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { appInterceptor } from './interseptors/app.interseptor';
import { authErrorInterceptor } from './interseptors/auth-error.interceptor';
import { credentialsInterceptor } from './interseptors/credentials.interceptor';
import { errorLoggingInterceptor } from './interseptors/error-logging.interceptor';

// NgRx imports
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userReducer } from './store/reducers/user.reducer';
import { UserEffects } from './store/effects/user.effects';

// Angular Material imports
import { provideAnimations } from '@angular/platform-browser/animations';

// Функция для получения токена из куки (если нужно)
export function tokenGetter() {
  // Для работы с куками обычно не нужно получать токен вручную
  // Браузер автоматически отправляет куки с запросами
  return null;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor, 
        appInterceptor, 
        authErrorInterceptor,
        errorLoggingInterceptor
      ])
    ),
    provideAnimationsAsync(),
    provideAnimations(), // Добавляем для MatSnackBar
    
    // NgRx Store
    provideStore({
      user: userReducer
    }),
    
    // NgRx Effects
    provideEffects([UserEffects]),
    
    // NgRx DevTools (только для разработки)
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false, // Set to true for production
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['localhost:3000'],
          // Для работы с куками отключаем автоматическое добавление заголовков
          skipWhenExpired: true,
        },
      })
    ),
  ],
};
