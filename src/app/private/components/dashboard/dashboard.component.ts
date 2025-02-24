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

  todos$?: Observable<any>;

  form: FormGroup = new FormGroup({
    title: new FormControl(null, [Validators.required, Validators.email]),
    content: new FormControl(null, [Validators.required]),
    f_done: new FormControl(null, [Validators.required]),
  });

  ngOnInit(): void {
    this.todoService.getTodos();
    this.todoService.getAddedTodos();
    this.todos$ = this.todoService.todoItems$;
  }

  getTodos() {
    this.todoService.getTodos();
  }

  addTodo() {
    this.todoService.saveTodo(this.form.getRawValue());
  }
}
