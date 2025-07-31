import { FormGroup, FormControl, Validators } from '@angular/forms';

export class FormHelper {
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

  /**
   * Получает все значения формы
   */
  static getFormValue<T>(form: FormGroup): T {
    return form.getRawValue() as T;
  }
} 