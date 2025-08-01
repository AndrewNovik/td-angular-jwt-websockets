import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../reducers/user.reducer';

// Feature Selector
export const selectUserState = createFeatureSelector<UserState>('user');

// User Selectors
export const selectUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectUserState,
  (state: UserState) => {
    const isAuthenticated = state.user?.isAuthenticated || false;
    console.log('🔍 [SELECTOR] selectIsAuthenticated called, state:', state);
    console.log('🔍 [SELECTOR] User from state:', state.user);
    console.log('🔍 [SELECTOR] Is authenticated result:', isAuthenticated);
    return isAuthenticated;
  }
);

export const selectIsLoading = createSelector(
  selectUserState,
  (state: UserState) => state.isLoading
);

export const selectError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);

export const selectLastPath = createSelector(
  selectUserState,
  (state: UserState) => state.lastPath
);

// User Data Selectors
export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email
);

export const selectUsername = createSelector(
  selectUser,
  (user) => user?.username
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

export const selectUserPreferences = createSelector(
  selectUser,
  (user) => user?.preferences
);

export const selectUserLastLogin = createSelector(
  selectUser,
  (user) => user?.lastLogin
);

// Computed Selectors
export const selectUserDisplayName = createSelector(
  selectUsername,
  selectUserEmail,
  (username, email) => username || email || 'User'
);

export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);

export const selectUserTheme = createSelector(
  selectUserPreferences,
  (preferences) => preferences?.theme || 'light'
);

export const selectUserLanguage = createSelector(
  selectUserPreferences,
  (preferences) => preferences?.language || 'ru'
);

// Auth State Selectors
export const selectAuthState = createSelector(
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    error
  })
);

// User Profile Selectors
export const selectUserProfile = createSelector(
  selectUser,
  (user) => user ? {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    lastLogin: user.lastLogin
  } : null
); 