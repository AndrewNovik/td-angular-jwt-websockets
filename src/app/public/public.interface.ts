import { FormControl } from '@angular/forms';

export interface UserI {
  id?: number;
  email: string; // Обязательное
  password?: string;
  username?: string; // Опциональное для гибкости
}

// Интерфейс для логина (только email и password)
export interface LoginCredentialsI {
  email: string;
  password: string;
}

// Расширенный интерфейс для ответа логина
export interface LoginResponseI {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      username: string;
      role?: string;
    };
    token?: string; // Если нужен токен для клиента
  };
  timestamp: string;
}

// Интерфейс для состояния пользователя
export interface UserStateI {
  id: number;
  email: string;
  username: string;
  role?: string;
  isAuthenticated: boolean;
  lastLogin?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
  };
}

// Интерфейс для API ответов
export interface ApiResponseI<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

// Интерфейсы для данных форм (значения)
export interface LoginFormI {
  email: string;
  password: string;
}

export interface RegisterFormI {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

// Интерфейсы для типизации FormGroup (контролы)
export interface LoginFormControlsI {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface RegisterFormControlsI {
  email: FormControl<string>;
  username: FormControl<string>;
  password: FormControl<string>;
  passwordConfirm: FormControl<string>;
}

// Интерфейсы для валидации
export interface FormValidationErrors {
  [key: string]: any;
}
