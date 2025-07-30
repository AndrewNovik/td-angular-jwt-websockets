import { Component, computed, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    CommonModule,
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly userService: UserService = inject(UserService);
  private readonly router: Router = inject(Router);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  public form!: FormGroup;
  public readonly email = computed(() => this.form.get('email') as FormControl);
  public readonly password = computed(() => this.form.get('password') as FormControl);

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    }, {
      validators: CustomValidators.passwordMatching
    });
  }

  public login(): void {
    if (this.form.valid) {
      this.userService
        .login({
          email: this.email().value,
          password: this.password().value,
        })
        .pipe(tap(() => this.router.navigate(['../../private/dashboard'])))
        .subscribe();
    }
  }
}
