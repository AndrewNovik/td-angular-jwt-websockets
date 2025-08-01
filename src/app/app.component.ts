import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as UserActions from './store/actions/user.actions';
import { UserService } from './public/services/user.service';
import { take } from 'rxjs/operators';
import { CookieUtils } from './public/utils/cookie-utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);

  ngOnInit(): void {
    // Инициализируем store при запуске приложения
    this.initializeStore();
  }

  private initializeStore(): void {
    console.log('🚀 [APP] AppComponent: Initializing store...');
    CookieUtils.logCookieInfo('On app init');
    
    // Проверяем, есть ли сохраненные данные пользователя в localStorage
    const savedUserState = localStorage.getItem('user_state');
    if (savedUserState) {
      try {
        const userState = JSON.parse(savedUserState);
        console.log('🚀 [APP] Loading saved user state:', userState);
        console.log('🚀 [APP] User isAuthenticated from localStorage:', userState.isAuthenticated);
        
        // Устанавливаем сохраненное состояние пользователя
        this.store.dispatch(UserActions.setUserState({ userState }));
        
        // Проверяем валидность токена через бекенд
        this.validateSavedUser();
      } catch (error) {
        console.error('🚀 [APP] Error loading saved user state:', error);
        localStorage.removeItem('user_state');
      }
    } else {
      console.log('🚀 [APP] No saved user state found');
    }

    // Проверяем, есть ли сохраненный последний путь
    const savedLastPath = localStorage.getItem('last_path');
    if (savedLastPath) {
      console.log('🚀 [APP] Loading saved last path:', savedLastPath);
      this.store.dispatch(UserActions.saveLastPath({ path: savedLastPath }));
    } else {
      console.log('🚀 [APP] No saved last path found, using default');
    }
  }

  private validateSavedUser(): void {
    console.log('🚀 [APP] Validating saved user...');
    CookieUtils.logCookieInfo('Before validation request');
    
    // Пытаемся получить профиль пользователя для проверки валидности токена
    this.userService.getProfile().pipe(
      take(1)
    ).subscribe({
      next: (response) => {
        console.log('🚀 [APP] User validation successful:', response);
        CookieUtils.logCookieInfo('After validation');
        
        if (response.success && response.data) {
          // Токен валиден, обновляем данные пользователя
          this.store.dispatch(UserActions.loadProfileSuccess({ response }));
          
          // Перенаправляем в приватную часть
          this.store.dispatch(UserActions.saveLastPath({ path: '/private/dashboard' }));
          console.log('🚀 [APP] Redirecting to private area');
        } else {
          console.log('🚀 [APP] User validation failed - clearing state');
          this.clearInvalidUserState();
        }
      },
      error: (error) => {
        console.error('🚀 [APP] User validation error:', error);
        CookieUtils.logCookieInfo('After validation error');
        console.log('🚀 [APP] Clearing invalid user state');
        this.clearInvalidUserState();
      }
    });
  }

  private clearInvalidUserState(): void {
    // Очищаем невалидное состояние пользователя
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.clearLastPath());
    
    // Очищаем localStorage
    localStorage.removeItem('user_state');
    localStorage.removeItem('last_path');
  }
}
