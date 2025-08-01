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
import { WebSocketDebug } from '../../utils/websocket-debug';
import { TodoSystemSummary } from '../../utils/todo-summary';

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
    console.log('📊 [DASHBOARD] === DASHBOARD INITIALIZED ===');
    
    // Запускаем полную диагностику системы
    TodoSystemSummary.runFullDiagnostic();
    
    this.buildForm();
    this.initializeTodoService();
    
    console.log('📊 [DASHBOARD] === INITIALIZATION COMPLETE ===');
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
    console.log('📋 [DASHBOARD] === GET TODOS INITIATED ===');
    console.log('📋 [DASHBOARD] WebSocket connected:', this.todoService.isConnected());
    
    if (this.todoService.isConnected()) {
      console.log('📋 [DASHBOARD] WebSocket connected, requesting todos...');
      this.todoService.getTodos();
    } else {
      console.warn('📋 [DASHBOARD] WebSocket not connected, attempting to reconnect...');
      WebSocketDebug.diagnoseWebSocketState();
      this.todoService.reconnect();
      setTimeout(() => {
        console.log('📋 [DASHBOARD] Checking connection after reconnect...');
        if (this.todoService.isConnected()) {
          console.log('📋 [DASHBOARD] Reconnected successfully, requesting todos...');
          this.todoService.getTodos();
        } else {
          console.warn('📋 [DASHBOARD] Reconnection failed');
        }
      }, 1000);
    }
    console.log('📋 [DASHBOARD] === GET TODOS END ===');
  }

  public addTodo(): void {
    console.log('📝 [DASHBOARD] === ADD TODO INITIATED ===');
    console.log('📝 [DASHBOARD] Form valid:', this.form.valid);
    console.log('📝 [DASHBOARD] Form errors:', this.form.errors);
    console.log('📝 [DASHBOARD] Form value:', this.form.getRawValue());
    
    if (this.form.valid) {
      const todoData = this.form.getRawValue();
      console.log('📝 [DASHBOARD] Todo data to be saved:', todoData);
      
      if (this.todoService.isConnected()) {
        console.log('📝 [DASHBOARD] WebSocket connected, saving todo...');
        this.todoService.saveTodo(todoData);
        this.resetForm();
        console.log('📝 [DASHBOARD] Form reset after save');
      } else {
        console.warn('📝 [DASHBOARD] WebSocket not connected, cannot add todo');
        WebSocketDebug.diagnoseWebSocketState();
      }
    } else {
      console.warn('📝 [DASHBOARD] Form is invalid, cannot save todo');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.errors) {
          console.warn(`📝 [DASHBOARD] Field ${key} errors:`, control.errors);
        }
      });
    }
    console.log('📝 [DASHBOARD] === ADD TODO END ===');
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
