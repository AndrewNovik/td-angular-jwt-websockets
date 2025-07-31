import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface FormState {
  isSubmitting: boolean;
  errors: string[];
  isValid: boolean;
  isDirty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private readonly formStates = new Map<string, FormState>();

  public getFormState(formId: string): FormState {
    return this.formStates.get(formId) || this.getDefaultState();
  }

  public setSubmitting(formId: string, isSubmitting: boolean): void {
    const state = this.getFormState(formId);
    this.formStates.set(formId, { ...state, isSubmitting });
  }

  public setErrors(formId: string, errors: string[]): void {
    const state = this.getFormState(formId);
    this.formStates.set(formId, { ...state, errors });
  }

  public setFormValidity(formId: string, form: FormGroup): void {
    const state = this.getFormState(formId);
    this.formStates.set(formId, {
      ...state,
      isValid: form.valid,
      isDirty: form.dirty
    });
  }

  public resetFormState(formId: string): void {
    this.formStates.set(formId, this.getDefaultState());
  }

  public clearErrors(formId: string): void {
    const state = this.getFormState(formId);
    this.formStates.set(formId, { ...state, errors: [] });
  }

  private getDefaultState(): FormState {
    return {
      isSubmitting: false,
      errors: [],
      isValid: false,
      isDirty: false
    };
  }

  public watchFormChanges(formId: string, form: FormGroup): void {
    form.statusChanges.subscribe(() => {
      this.setFormValidity(formId, form);
    });

    form.valueChanges.subscribe(() => {
      this.setFormValidity(formId, form);
    });
  }
} 