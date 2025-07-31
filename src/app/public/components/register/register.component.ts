import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { FormFactory } from '../../factories/form-factory';
import { RegisterFormI } from '../../public.interface';
import { FormUtils } from '../../utils/form-utils';
import { FormHelper } from '../../utils/form-helper';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../../store/selectors/user.selectors';
import * as UserActions from '../../../store/actions/user.actions';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
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
  public readonly isLoading$ = this.store.select(UserSelectors.selectIsLoading);
  public readonly error$ = this.store.select(UserSelectors.selectError);

  // Computed для доступа к контролам
  public readonly emailControl = computed(() => this.form.get('email'));
  public readonly usernameControl = computed(() => this.form.get('username'));
  public readonly passwordControl = computed(() => this.form.get('password'));
  public readonly passwordConfirmControl = computed(() => this.form.get('passwordConfirm'));

  // Computed для валидации
  public readonly isEmailInvalid = computed(() => FormUtils.isFieldInvalid(this.form, 'email'));
  public readonly isUsernameInvalid = computed(() => FormUtils.isFieldInvalid(this.form, 'username'));
  public readonly isPasswordInvalid = computed(() => FormUtils.isFieldInvalid(this.form, 'password'));
  public readonly isPasswordConfirmInvalid = computed(() => FormUtils.isFieldInvalid(this.form, 'passwordConfirm'));

  public readonly emailError = computed(() => FormUtils.getFieldError(this.form, 'email'));
  public readonly usernameError = computed(() => FormUtils.getFieldError(this.form, 'username'));
  public readonly passwordError = computed(() => FormUtils.getFieldError(this.form, 'password'));
  public readonly passwordConfirmError = computed(() => FormUtils.getFieldError(this.form, 'passwordConfirm'));

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
    this.form = FormFactory.createRegisterForm();
  }

  private setupFormSubscription(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Логика при изменении формы
        console.log('Register form changed:', this.form.value);
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
  }

  public async register(): Promise<void> {
    if (this.form.invalid) {
      FormHelper.markFormGroupTouched(this.form);
      return;
    }

    const registerData: RegisterFormI = FormHelper.getFormValue<RegisterFormI>(this.form);
    
    // Диспатчим action для регистрации
    this.store.dispatch(UserActions.register({ userData: registerData }));
  }

  public resetForm(): void {
    FormHelper.resetForm(this.form);
    this.formErrorsSignal.set([]);
  }
}
