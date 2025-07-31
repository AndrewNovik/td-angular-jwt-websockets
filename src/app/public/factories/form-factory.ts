import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { LoginFormControlsI, RegisterFormControlsI } from '../public.interface';
import { CustomValidators } from '../validators/custom-validators';
import { FormUtils } from '../utils/form-utils';

export class FormFactory {
  private static readonly formBuilder = new FormBuilder();

  static createLoginForm(): FormGroup<LoginFormControlsI> {
    return this.formBuilder.group<LoginFormControlsI>({
      email: FormUtils.createEmailControl(),
      password: FormUtils.createPasswordControl()
    });
  }

  static createRegisterForm(): FormGroup<RegisterFormControlsI> {
    return this.formBuilder.group<RegisterFormControlsI>({
      email: FormUtils.createEmailControl(),
      username: FormUtils.createUsernameControl(),
      password: FormUtils.createPasswordControl(),
      passwordConfirm: FormUtils.createControl('', [Validators.required], true)
    }, {
      validators: CustomValidators.passwordMatching
    });
  }

  // Дженерик метод для создания форм с дефолтными значениями
  static createFormWithDefaults<T extends Record<string, any>>(
    defaults: Partial<T>
  ): FormGroup {
    return this.formBuilder.group(defaults);
  }

  // Метод для создания типизированной формы из интерфейса
  static createTypedForm<T extends Record<string, any>>(
    controls: Record<keyof T, FormControl>
  ): FormGroup {
    return this.formBuilder.group(controls);
  }

  // Метод для создания формы с кастомными контролами
  static createCustomForm<T extends Record<string, FormControl>>(
    controls: T
  ): FormGroup {
    return this.formBuilder.group(controls);
  }
} 