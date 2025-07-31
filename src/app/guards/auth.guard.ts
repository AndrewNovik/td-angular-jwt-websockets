import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../store/selectors/user.selectors';
import * as UserActions from '../store/actions/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);

  canActivate(): Observable<boolean> {
    console.log('AuthGuard: Checking authentication for URL:', this.router.url);
    
    return this.store.select(UserSelectors.selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        console.log('AuthGuard: Is authenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('AuthGuard: Access granted');
          return true;
        } else {
          // Проверяем, есть ли сохраненный пользователь в localStorage
          const savedUserState = localStorage.getItem('user_state');
          if (savedUserState) {
            console.log('AuthGuard: Found saved user state, allowing access for validation');
            // Если есть сохраненный пользователь, разрешаем доступ
            // Валидация произойдет в AppComponent
            return true;
          }
          
          // Сохраняем текущий путь для возврата после логина
          console.log('AuthGuard: Saving last path:', this.router.url);
          this.store.dispatch(UserActions.saveLastPath({ path: this.router.url }));
          this.router.navigate(['/public/login']);
          return false;
        }
      })
    );
  }
} 