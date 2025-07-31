import { createReducer, on } from '@ngrx/store';
import { UserStateI } from '../../public/public.interface';
import * as UserActions from '../actions/user.actions';

export interface UserState {
  user: UserStateI | null;
  isLoading: boolean;
  error: string | null;
  lastPath: string;
}

export const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  lastPath: '/private/dashboard' // Дефолтный путь после логина
};

export const userReducer = createReducer(
  initialState,

  // Login
  on(UserActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(UserActions.loginSuccess, (state, { response }) => {
    console.log('Login Success Response:', response);
    
    if (response.success && response.data?.user) {
      const userState: UserStateI = {
        id: response.data.user.id,
        email: response.data.user.email,
        username: response.data.user.username,
        role: response.data.user.role,
        isAuthenticated: true,
        lastLogin: new Date().toISOString(),
        preferences: getUserPreferences()
      };

      console.log('Saving user state to store:', userState);

      // Сохраняем в localStorage
      saveUserStateToStorage(userState);

      return {
        ...state,
        user: userState,
        isLoading: false,
        error: null
      };
    }
    
    console.log('Login failed - no user data in response');
    return {
      ...state,
      isLoading: false,
      error: response.message || 'Login failed'
    };
  }),

  on(UserActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Register
  on(UserActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(UserActions.registerSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(UserActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Logout
  on(UserActions.logout, (state) => ({
    ...state,
    isLoading: true
  })),

  on(UserActions.logoutSuccess, (state) => {
    // Очищаем localStorage
    clearUserStateFromStorage();
    clearLastPathFromStorage();

    return {
      ...state,
      user: null,
      isLoading: false,
      error: null,
      lastPath: '/private/dashboard'
    };
  }),

  on(UserActions.logoutFailure, (state, { error }) => {
    // Даже при ошибке очищаем состояние
    clearUserStateFromStorage();
    clearLastPathFromStorage();

    return {
      ...state,
      user: null,
      isLoading: false,
      error,
      lastPath: '/private/dashboard'
    };
  }),

  // Profile
  on(UserActions.loadProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(UserActions.loadProfileSuccess, (state, { response }) => {
    if (response.success && response.data && state.user) {
      // Проверяем, что email и username не undefined
      if (response.data.email && response.data.username) {
        const updatedUser: UserStateI = {
          ...state.user,
          email: response.data.email,
          username: response.data.username
        };

        saveUserStateToStorage(updatedUser);

        return {
          ...state,
          user: updatedUser,
          isLoading: false,
          error: null
        };
      }
    }
    return {
      ...state,
      isLoading: false,
      error: response.message || 'Failed to load profile'
    };
  }),

  on(UserActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(UserActions.updateProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(UserActions.updateProfileSuccess, (state, { response }) => {
    if (response.success && response.data && state.user) {
      // Проверяем, что email и username не undefined
      if (response.data.email && response.data.username) {
        const updatedUser: UserStateI = {
          ...state.user,
          email: response.data.email,
          username: response.data.username
        };

        saveUserStateToStorage(updatedUser);

        return {
          ...state,
          user: updatedUser,
          isLoading: false,
          error: null
        };
      }
    }
    return {
      ...state,
      isLoading: false,
      error: response.message || 'Failed to update profile'
    };
  }),

  on(UserActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Token
  on(UserActions.refreshToken, (state) => ({
    ...state,
    isLoading: true
  })),

  on(UserActions.refreshTokenSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(UserActions.refreshTokenFailure, (state) => {
    // При ошибке обновления токена очищаем состояние
    clearUserStateFromStorage();
    clearLastPathFromStorage();

    return {
      ...state,
      user: null,
      isLoading: false,
      error: 'Token refresh failed',
      lastPath: '/private/dashboard'
    };
  }),

  // State Management
  on(UserActions.setUserState, (state, { userState }) => {
    saveUserStateToStorage(userState);
    return {
      ...state,
      user: userState
    };
  }),

  on(UserActions.updateUserData, (state, { updates }) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      saveUserStateToStorage(updatedUser);
      return {
        ...state,
        user: updatedUser
      };
    }
    return state;
  }),

  on(UserActions.updateUserPreferences, (state, { preferences }) => {
    if (state.user) {
      const updatedPreferences = { ...state.user.preferences, ...preferences };
      const updatedUser = { ...state.user, preferences: updatedPreferences };
      
      saveUserStateToStorage(updatedUser);
      saveUserPreferencesToStorage(updatedPreferences);

      return {
        ...state,
        user: updatedUser
      };
    }
    return state;
  }),

  on(UserActions.clearUserState, (state) => {
    clearUserStateFromStorage();
    return {
      ...state,
      user: null
    };
  }),

  on(UserActions.setLoading, (state, { loading }) => ({
    ...state,
    isLoading: loading
  })),

  on(UserActions.saveLastPath, (state, { path }) => {
    saveLastPathToStorage(path);
    return {
      ...state,
      lastPath: path
    };
  }),

  on(UserActions.clearLastPath, (state) => {
    clearLastPathFromStorage();
    return {
      ...state,
      lastPath: '/private/dashboard'
    };
  })
);

// Helper functions for localStorage
function saveUserStateToStorage(userState: UserStateI): void {
  try {
    localStorage.setItem('user_state', JSON.stringify(userState));
  } catch (error) {
    console.error('Error saving user state to storage:', error);
  }
}

function clearUserStateFromStorage(): void {
  try {
    localStorage.removeItem('user_state');
  } catch (error) {
    console.error('Error clearing user state from storage:', error);
  }
}

function getUserPreferences(): UserStateI['preferences'] {
  try {
    const stored = localStorage.getItem('user_preferences');
    return stored ? JSON.parse(stored) : { theme: 'light', language: 'ru' };
  } catch {
    return { theme: 'light', language: 'ru' };
  }
}

function saveUserPreferencesToStorage(preferences: UserStateI['preferences']): void {
  try {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

function saveLastPathToStorage(path: string): void {
  try {
    localStorage.setItem('last_path', path);
  } catch (error) {
    console.error('Error saving last path:', error);
  }
}

function clearLastPathFromStorage(): void {
  try {
    localStorage.removeItem('last_path');
  } catch (error) {
    console.error('Error clearing last path:', error);
  }
} 