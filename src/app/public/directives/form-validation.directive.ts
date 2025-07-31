import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Directive({
  selector: '[appFormValidation]',
  standalone: true
})
export class FormValidationDirective implements OnInit {
  @Input() form!: FormGroup;
  @Input() controlName!: string;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.setupValidation();
  }

  @HostListener('blur')
  onBlur(): void {
    this.markAsTouched();
  }

  @HostListener('input')
  onInput(): void {
    this.updateValidationState();
  }

  private setupValidation(): void {
    const control = this.form.get(this.controlName);
    if (control) {
      control.statusChanges.subscribe(() => {
        this.updateValidationState();
      });
    }
  }

  private markAsTouched(): void {
    const control = this.form.get(this.controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  private updateValidationState(): void {
    const control = this.form.get(this.controlName);
    if (!control) return;

    const element = this.el.nativeElement;
    
    if (control.invalid && control.touched) {
      element.classList.add('ng-invalid', 'ng-touched');
      element.classList.remove('ng-valid');
    } else if (control.valid && control.touched) {
      element.classList.add('ng-valid', 'ng-touched');
      element.classList.remove('ng-invalid');
    } else {
      element.classList.remove('ng-valid', 'ng-invalid', 'ng-touched');
    }
  }
} 