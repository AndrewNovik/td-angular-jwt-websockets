import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserI, LoginCredentialsI } from '../public.interface';
import * as UserActions from '../../store/actions/user.actions';
import * as UserSelectors from '../../store/selectors/user.selectors';

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);

  // Используем NgRx selectors для получения состояния
  public readonly authState$ = this.store.select(UserSelectors.selectAuthState);
  public readonly user$ = this.store.select(UserSelectors.selectUser);
  public readonly isAuthenticated$ = this.store.select(UserSelectors.selectIsAuthenticated);
  public readonly isLoading$ = this.store.select(UserSelectors.selectIsLoading);
  public readonly error$ = this.store.select(UserSelectors.selectError);
  public readonly lastPath$ = this.store.select(UserSelectors.selectLastPath);

  constructor() {
    // Инициализация при создании сервиса
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Проверяем состояние при инициализации
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Если пользователь авторизован, загружаем профиль
        this.store.dispatch(UserActions.loadProfile());
      }
    });
  }

  public login(credentials: LoginCredentialsI): void {
    this.store.dispatch(UserActions.login({ credentials }));
  }

  public logout(): void {
    this.store.dispatch(UserActions.logout());
  }

  public refreshToken(): void {
    this.store.dispatch(UserActions.refreshToken());
  }

  public getCurrentUser(): Observable<any> {
    return this.user$;
  }

  public isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  public requireAuth(): boolean {
    let isAuth = false;
    this.isAuthenticated$.subscribe(auth => isAuth = auth).unsubscribe();
    
    if (!isAuth) {
      // Сохраняем текущий путь для возврата после логина
      this.store.dispatch(UserActions.saveLastPath({ path: this.router.url }));
      this.router.navigate(['/public/login']);
      return false;
    }
    return true;
  }

  public requireGuest(): boolean {
    let isAuth = false;
    this.isAuthenticated$.subscribe(auth => isAuth = auth).unsubscribe();
    
    if (isAuth) {
      this.lastPath$.subscribe(lastPath => {
        this.router.navigate([lastPath]);
      }).unsubscribe();
      return false;
    }
    return true;
  }

  public updateUserPreferences(preferences: any): void {
    this.store.dispatch(UserActions.updateUserPreferences({ preferences }));
  }

  public saveLastPath(path: string): void {
    this.store.dispatch(UserActions.saveLastPath({ path }));
  }

  public getLastPath(): Observable<string> {
    return this.lastPath$;
  }

  public updateProfile(updates: Partial<UserI>): void {
    this.store.dispatch(UserActions.updateProfile({ updates }));
  }

  public loadProfile(): void {
    this.store.dispatch(UserActions.loadProfile());
  }
} 