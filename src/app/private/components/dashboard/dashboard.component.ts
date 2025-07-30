import { Component, inject, OnInit } from '@angular/core';
import { TodoService } from '../../service/todo.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly todoService: TodoService = inject(TodoService);

  public todos$?: Observable<any>;
  public form!: FormGroup;

  public ngOnInit(): void {
    this.buildForm();
    this.todoService.getTodos();
    this.todoService.getAddedTodos();
    this.todos$ = this.todoService.todoItems$;
  }

  public getTodos(): void {
    this.todoService.getTodos();
  }

  public addTodo(): void {
    if (this.form.valid) {
      this.todoService.saveTodo(this.form.getRawValue());
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form.reset();
    this.form.patchValue({
      f_done: false
    });
  }

  public buildForm(): void {
    this.form = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      content: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500)
      ]),
      f_done: new FormControl(false),
    });
  }
}
