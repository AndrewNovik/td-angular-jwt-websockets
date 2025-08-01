import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../store/selectors/user.selectors';
import * as UserActions from '../store/actions/user.actions';
import { CookieUtils } from '../public/utils/cookie-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);

  canActivate(): Observable<boolean> {
    const currentUrl = this.router.url;
    const targetUrl = window.location.pathname;
    
    console.log('🛡️ [GUARD] === AUTH GUARD TRIGGERED ===');
    console.log('🛡️ [GUARD] Router URL:', currentUrl);
    console.log('🛡️ [GUARD] Target URL:', targetUrl);
    console.log('🛡️ [GUARD] Window location:', window.location.href);
    CookieUtils.logCookieInfo('AuthGuard check');
    
    return this.store.select(UserSelectors.selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        console.log('🛡️ [GUARD] Is authenticated from store:', isAuthenticated);
        console.log('🛡️ [GUARD] Checking access for private route...');
        
        if (isAuthenticated) {
          console.log('🛡️ [GUARD] ✅ Access granted - user is authenticated');
          console.log('🛡️ [GUARD] Allowing navigation to:', targetUrl);
          return true;
        } else {
          // Проверяем, есть ли сохраненный пользователь в localStorage
          const savedUserState = localStorage.getItem('user_state');
          console.log('🛡️ [GUARD] Saved user state from localStorage:', savedUserState);
          
          if (savedUserState) {
            try {
              const parsedUserState = JSON.parse(savedUserState);
              console.log('🛡️ [GUARD] Parsed user state:', parsedUserState);
              console.log('🛡️ [GUARD] User isAuthenticated from localStorage:', parsedUserState.isAuthenticated);
              
              if (parsedUserState.isAuthenticated) {
                console.log('🛡️ [GUARD] Found authenticated user in localStorage, allowing access for validation');
                // Если есть сохраненный пользователь, разрешаем доступ
                // Валидация произойдет в AppComponent
                return true;
              }
            } catch (error) {
              console.error('🛡️ [GUARD] Error parsing saved user state:', error);
            }
          }
          
          // Сохраняем текущий путь для возврата после логина
          console.log('🛡️ [GUARD] No authenticated user found, saving last path:', this.router.url);
          this.store.dispatch(UserActions.saveLastPath({ path: this.router.url }));
          console.log('🛡️ [GUARD] Redirecting to login page');
          this.router.navigate(['/public/login']);
          return false;
        }
      })
    );
  }
} 