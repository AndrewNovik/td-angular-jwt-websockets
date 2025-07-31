import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as UserActions from './store/actions/user.actions';
import { UserService } from './public/services/user.service';
import { take } from 'rxjs/operators';

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
    console.log('AppComponent: Initializing store...');
    
    // Проверяем, есть ли сохраненные данные пользователя в localStorage
    const savedUserState = localStorage.getItem('user_state');
    if (savedUserState) {
      try {
        const userState = JSON.parse(savedUserState);
        console.log('AppComponent: Loading saved user state:', userState);
        
        // Устанавливаем сохраненное состояние пользователя
        this.store.dispatch(UserActions.setUserState({ userState }));
        
        // Проверяем валидность токена через бекенд
        this.validateSavedUser();
      } catch (error) {
        console.error('AppComponent: Error loading saved user state:', error);
        localStorage.removeItem('user_state');
      }
    } else {
      console.log('AppComponent: No saved user state found');
    }

    // Проверяем, есть ли сохраненный последний путь
    const savedLastPath = localStorage.getItem('last_path');
    if (savedLastPath) {
      console.log('AppComponent: Loading saved last path:', savedLastPath);
      this.store.dispatch(UserActions.saveLastPath({ path: savedLastPath }));
    } else {
      console.log('AppComponent: No saved last path found, using default');
    }
  }

  private validateSavedUser(): void {
    console.log('AppComponent: Validating saved user...');
    
    // Пытаемся получить профиль пользователя для проверки валидности токена
    this.userService.getProfile().pipe(
      take(1)
    ).subscribe({
      next: (response) => {
        console.log('AppComponent: User validation successful:', response);
        
        if (response.success && response.data) {
          // Токен валиден, обновляем данные пользователя
          this.store.dispatch(UserActions.loadProfileSuccess({ response }));
          
          // Перенаправляем в приватную часть
          this.store.dispatch(UserActions.saveLastPath({ path: '/private/dashboard' }));
          console.log('AppComponent: Redirecting to private area');
        } else {
          console.log('AppComponent: User validation failed - clearing state');
          this.clearInvalidUserState();
        }
      },
      error: (error) => {
        console.error('AppComponent: User validation error:', error);
        console.log('AppComponent: Clearing invalid user state');
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
