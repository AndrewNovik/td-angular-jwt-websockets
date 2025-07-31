import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TodoService, TodoItem } from '../../service/todo.service';
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
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly todoService: TodoService = inject(TodoService);

  public todos$?: Observable<TodoItem[]>;
  public form!: FormGroup;
  public isConnected = false;

  public ngOnInit(): void {
    this.buildForm();
    this.initializeTodoService();
  }

  public ngOnDestroy(): void {
    // Отключаем WebSocket при уничтожении компонента
    this.todoService.disconnect();
  }

  private initializeTodoService(): void {
    // Проверяем подключение WebSocket
    this.isConnected = this.todoService.isConnected();
    
    if (this.isConnected) {
      console.log('WebSocket is connected, getting todos...');
      this.todoService.getTodos();
    } else {
      console.log('WebSocket not connected, waiting for connection...');
      // Попробуем переподключиться
      this.todoService.reconnect();
      
      // Проверим подключение через некоторое время
      setTimeout(() => {
        this.isConnected = this.todoService.isConnected();
        if (this.isConnected) {
          this.todoService.getTodos();
        } else {
          console.warn('Failed to connect to WebSocket');
        }
      }, 2000);
    }
    
    this.todos$ = this.todoService.todoItems$;
  }

  public getTodos(): void {
    if (this.todoService.isConnected()) {
      this.todoService.getTodos();
    } else {
      console.warn('WebSocket not connected, attempting to reconnect...');
      this.todoService.reconnect();
      setTimeout(() => {
        if (this.todoService.isConnected()) {
          this.todoService.getTodos();
        }
      }, 1000);
    }
  }

  public addTodo(): void {
    if (this.form.valid) {
      const todoData = this.form.getRawValue();
      
      if (this.todoService.isConnected()) {
        this.todoService.saveTodo(todoData);
        this.resetForm();
      } else {
        console.warn('WebSocket not connected, cannot add todo');
      }
    }
  }

  public updateTodo(todo: TodoItem): void {
    if (this.todoService.isConnected()) {
      this.todoService.updateTodo(todo);
    } else {
      console.warn('WebSocket not connected, cannot update todo');
    }
  }

  public deleteTodo(todoId: number): void {
    if (this.todoService.isConnected()) {
      this.todoService.deleteTodo(todoId);
    } else {
      console.warn('WebSocket not connected, cannot delete todo');
    }
  }

  public toggleTodoStatus(todo: TodoItem): void {
    const updatedTodo = { ...todo, f_done: !todo.f_done };
    this.updateTodo(updatedTodo);
  }

  public reconnectWebSocket(): void {
    console.log('Manual WebSocket reconnection...');
    this.todoService.reconnect();
    setTimeout(() => {
      this.isConnected = this.todoService.isConnected();
      if (this.isConnected) {
        this.todoService.getTodos();
      }
    }, 1000);
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
