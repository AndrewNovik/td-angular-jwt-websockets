import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

export class FormUtils {
  /**
   * Создает FormControl с валидаторами
   */
  static createControl(
    defaultValue: any = '',
    validators: any[] = [],
    isNonNullable: boolean = false
  ): FormControl {
    return new FormControl(defaultValue, {
      validators,
      nonNullable: isNonNullable
    });
  }

  /**
   * Создает FormControl для email
   */
  static createEmailControl(defaultValue: string = ''): FormControl<string> {
    return this.createControl(defaultValue, [Validators.required, Validators.email], true);
  }

  /**
   * Создает FormControl для пароля
   */
  static createPasswordControl(defaultValue: string = ''): FormControl<string> {
    return this.createControl(defaultValue, [Validators.required, Validators.minLength(6)], true);
  }

  /**
   * Создает FormControl для имени пользователя
   */
  static createUsernameControl(defaultValue: string = ''): FormControl<string> {
    return this.createControl(defaultValue, [
      Validators.required, 
      Validators.minLength(3), 
      Validators.maxLength(50)
    ], true);
  }

  /**
   * Проверяет, является ли поле недействительным и затронутым
   */
  static isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Проверяет, является ли поле действительным и затронутым
   */
  static isFieldValid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  /**
   * Получает сообщение об ошибке для поля
   */
  static getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    if (field && field.errors && field.touched) {
      return FormUtils.getErrorMessage(field.errors);
    }
    return null;
  }

  /**
   * Получает сообщение об ошибке на основе ошибок валидации
   */
  static getErrorMessage(errors: any): string {
    if (errors['required']) return 'Это поле обязательно';
    if (errors['email']) return 'Неверный формат email';
    if (errors['minlength']) return `Минимальная длина ${errors['minlength'].requiredLength} символов`;
    if (errors['maxlength']) return `Максимальная длина ${errors['maxlength'].requiredLength} символов`;
    if (errors['passswordsNotMatching']) return 'Пароли не совпадают';
    if (errors['pattern']) return 'Неверный формат';
    return 'Неверное значение';
  }

  /**
   * Отмечает все поля формы как затронутые
   */
  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  /**
   * Сбрасывает форму с дефолтными значениями
   */
  static resetForm(form: FormGroup, defaults?: any): void {
    form.reset(defaults);
  }

  /**
   * Получает типизированное значение поля
   */
  static getFieldValue<T>(form: FormGroup, fieldName: string): T | null {
    const field = form.get(fieldName);
    return field ? field.value as T : null;
  }

  /**
   * Устанавливает значение поля
   */
  static setFieldValue(form: FormGroup, fieldName: string, value: any): void {
    const field = form.get(fieldName);
    if (field) {
      field.setValue(value);
    }
  }

  /**
   * Проверяет, валидна ли форма
   */
  static isFormValid(form: FormGroup): boolean {
    return form.valid;
  }

  /**
   * Проверяет, изменилась ли форма
   */
  static isFormDirty(form: FormGroup): boolean {
    return form.dirty;
  }
} 