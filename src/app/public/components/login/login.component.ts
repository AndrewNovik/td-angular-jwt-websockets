import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormFactory } from '../../factories/form-factory';
import { LoginFormI } from '../../public.interface';
import { FormUtils } from '../../utils/form-utils';
import { FormHelper } from '../../utils/form-helper';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../../store/selectors/user.selectors';
import * as UserActions from '../../../store/actions/user.actions';

@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly store: Store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  // Экспортируем утилиты для использования в шаблоне
  protected readonly FormUtils = FormUtils;
  protected readonly FormHelper = FormHelper;

  // Сигналы для реактивности
  public readonly isSubmittingSignal = signal(false);
  public readonly formErrorsSignal = signal<string[]>([]);

  public form!: any;
  public isSubmitting = false;

  // NgRx selectors
  public readonly isAuthenticated$ = this.store.select(UserSelectors.selectIsAuthenticated);
  public readonly isLoading$ = this.store.select(UserSelectors.selectIsLoading);
  public readonly error$ = this.store.select(UserSelectors.selectError);

  // Computed для доступа к контролам
  public readonly emailControl = computed(() => this.form.get('email'));
  public readonly passwordControl = computed(() => this.form.get('password'));

  // Computed для валидации с использованием FormUtils
  public readonly isEmailInvalid = computed(() => 
    FormUtils.isFieldInvalid(this.form, 'email')
  );
  public readonly isPasswordInvalid = computed(() => 
    FormUtils.isFieldInvalid(this.form, 'password')
  );

  public readonly emailError = computed(() => 
    FormUtils.getFieldError(this.form, 'email')
  );
  public readonly passwordError = computed(() => 
    FormUtils.getFieldError(this.form, 'password')
  );

  public ngOnInit(): void {
    this.initForm();
    this.setupFormSubscription();
    this.setupNgRxSubscriptions();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = FormFactory.createLoginForm();
  }

  private setupFormSubscription(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Логика при изменении формы
        console.log('Form changed:', this.form.value);
      });
  }

  private setupNgRxSubscriptions(): void {
    // Подписываемся на состояние загрузки
    this.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isSubmitting = loading;
        this.isSubmittingSignal.set(loading);
      });

    // Подписываемся на ошибки
    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.formErrorsSignal.set([error]);
        } else {
          this.formErrorsSignal.set([]);
        }
      });

    // Подписываемся на состояние аутентификации
    this.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        console.log('Authentication state changed:', isAuthenticated);
        if (isAuthenticated) {
          // Пользователь успешно авторизован
          console.log('User authenticated successfully');
          
          // Получаем данные пользователя из store
          this.store.select(UserSelectors.selectUser)
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
              console.log('Current user in store:', user);
            });
        }
      });
  }

  public async login(): Promise<void> {
    if (this.form.invalid) {
      FormHelper.markFormGroupTouched(this.form);
      return;
    }

    const loginData: LoginFormI = FormHelper.getFormValue<LoginFormI>(this.form);

    console.log('Dispatching login action with data:', loginData);
    
    // Диспатчим action для логина
    this.store.dispatch(UserActions.login({ credentials: loginData }));
  }

  public resetForm(): void {
    FormHelper.resetForm(this.form);
    this.formErrorsSignal.set([]);
  }
}
