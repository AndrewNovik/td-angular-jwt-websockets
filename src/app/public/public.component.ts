import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-public',
  imports: [RouterOutlet, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './public.component.html',
  styleUrl: './public.component.scss',
  standalone: true,
})
export class PublicComponent {}
