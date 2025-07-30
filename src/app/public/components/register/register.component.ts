import { Component, computed, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CustomValidators } from '../../validators/custom-validators';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  public readonly email = computed(() => this.form.get('email') as FormControl);
  public readonly username = computed(() => this.form.get('username') as FormControl);
  public readonly password = computed(() => this.form.get('password') as FormControl);
  public readonly passwordConfirm = computed(() => this.form.get('passwordConfirm') as FormControl);

  public form!: FormGroup;

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl(null, [Validators.required, Validators.email]),
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    },
    {
      validators: CustomValidators.passwordMatching,
    }
  );
  }

  public register(): void {
    if (this.form.valid) {
      this.userService
        .register(this.form.getRawValue())
        .pipe(tap(() => this.router.navigate(['../../public/login'])))
        .subscribe();
    }
  }
}
