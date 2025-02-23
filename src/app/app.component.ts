import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppService } from './app.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly app: AppService = inject(AppService);

  title = 'todo-front';
}
