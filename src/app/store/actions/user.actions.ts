import { createAction, props } from '@ngrx/store';
import { UserStateI, LoginResponseI, ApiResponseI, UserI, LoginCredentialsI } from '../../public/public.interface';

// Login Actions
export const login = createAction(
  '[User] Login',
  props<{ credentials: LoginCredentialsI }>()
);

export const loginSuccess = createAction(
  '[User] Login Success',
  props<{ response: LoginResponseI }>()
);

export const loginFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[User] Register',
  props<{ userData: UserI }>()
);

export const registerSuccess = createAction(
  '[User] Register Success',
  props<{ response: ApiResponseI<UserI> }>()
);

export const registerFailure = createAction(
  '[User] Register Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[User] Logout');

export const logoutSuccess = createAction(
  '[User] Logout Success',
  props<{ response: ApiResponseI<void> }>()
);

export const logoutFailure = createAction(
  '[User] Logout Failure',
  props<{ error: string }>()
);

// Profile Actions
export const loadProfile = createAction('[User] Load Profile');

export const loadProfileSuccess = createAction(
  '[User] Load Profile Success',
  props<{ response: ApiResponseI<UserI> }>()
);

export const loadProfileFailure = createAction(
  '[User] Load Profile Failure',
  props<{ error: string }>()
);

export const updateProfile = createAction(
  '[User] Update Profile',
  props<{ updates: Partial<UserI> }>()
);

export const updateProfileSuccess = createAction(
  '[User] Update Profile Success',
  props<{ response: ApiResponseI<UserI> }>()
);

export const updateProfileFailure = createAction(
  '[User] Update Profile Failure',
  props<{ error: string }>()
);

// Token Actions
export const refreshToken = createAction('[User] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[User] Refresh Token Success',
  props<{ response: ApiResponseI<void> }>()
);

export const refreshTokenFailure = createAction(
  '[User] Refresh Token Failure',
  props<{ error: string }>()
);

// State Management Actions
export const setUserState = createAction(
  '[User] Set User State',
  props<{ userState: UserStateI }>()
);

export const updateUserData = createAction(
  '[User] Update User Data',
  props<{ updates: Partial<UserStateI> }>()
);

export const updateUserPreferences = createAction(
  '[User] Update User Preferences',
  props<{ preferences: Partial<UserStateI['preferences']> }>()
);

export const clearUserState = createAction('[User] Clear User State');

export const setLoading = createAction(
  '[User] Set Loading',
  props<{ loading: boolean }>()
);

export const saveLastPath = createAction(
  '[User] Save Last Path',
  props<{ path: string }>()
);

export const clearLastPath = createAction('[User] Clear Last Path'); 