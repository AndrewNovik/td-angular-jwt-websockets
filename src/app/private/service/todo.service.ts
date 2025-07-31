import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export type TodoItem = {
  id: number;
  title: string;
  content: string;
  f_done: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private socket: Socket | null = null;
  private readonly todoItemsSubject = new BehaviorSubject<TodoItem[]>([]);
  public readonly todoItems$ = this.todoItemsSubject.asObservable();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    // Настройки для работы с куками в WebSocket
    // Используем относительный URL для работы через прокси
    this.socket = io('/', {
      withCredentials: true, // Включаем отправку куки
      transports: ['websocket', 'polling'], // Поддерживаем оба транспорта
      autoConnect: true, // Автоматическое подключение
      forceNew: true, // Принудительно новое соединение
      timeout: 20000, // Таймаут подключения
      path: '/socket.io/', // Путь к Socket.IO
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Обработка подключения
    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      console.log('Socket ID:', this.socket?.id);
    });

    // Обработка отключения
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    // Обработка ошибок подключения
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    });

    // Обработка ошибок аутентификации
    this.socket.on('auth_error', (error) => {
      console.error('WebSocket authentication error:', error);
      // Можно добавить редирект на логин
    });

    // Обработка получения списка todos
    this.socket.on('todos', (todos: TodoItem[]) => {
      console.log('Received todos:', todos);
      this.todoItemsSubject.next(todos);
    });

    // Обработка добавления нового todo
    this.socket.on('addedTodo', (todo: TodoItem) => {
      console.log('Added todo:', todo);
      this.todoItemsSubject.next([...this.todoItemsSubject.value, todo]);
    });

    // Обработка обновления todo
    this.socket.on('updatedTodo', (todo: TodoItem) => {
      console.log('Updated todo:', todo);
      const currentTodos = this.todoItemsSubject.value;
      const updatedTodos = currentTodos.map(t => t.id === todo.id ? todo : t);
      this.todoItemsSubject.next(updatedTodos);
    });

    // Обработка удаления todo
    this.socket.on('deletedTodo', (todoId: number) => {
      console.log('Deleted todo:', todoId);
      const currentTodos = this.todoItemsSubject.value;
      const filteredTodos = currentTodos.filter(t => t.id !== todoId);
      this.todoItemsSubject.next(filteredTodos);
    });

    // Обработка ошибок
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  public getTodos(): void {
    console.log('Requesting todos');
    if (this.socket && this.socket.connected) {
      this.socket.emit('getTodos');
    } else {
      console.warn('Socket not connected, attempting to reconnect...');
      this.reconnect();
    }
  }

  public saveTodo(todoItem: Omit<TodoItem, 'id'>): void {
    console.log('Saving todo:', todoItem);
    if (this.socket && this.socket.connected) {
      this.socket.emit('addTodo', todoItem);
    } else {
      console.warn('Socket not connected, attempting to reconnect...');
      this.reconnect();
    }
  }

  public updateTodo(todoItem: TodoItem): void {
    console.log('Updating todo:', todoItem);
    if (this.socket && this.socket.connected) {
      this.socket.emit('updateTodo', todoItem);
    } else {
      console.warn('Socket not connected, attempting to reconnect...');
      this.reconnect();
    }
  }

  public deleteTodo(todoId: number): void {
    console.log('Deleting todo:', todoId);
    if (this.socket && this.socket.connected) {
      this.socket.emit('deleteTodo', todoId);
    } else {
      console.warn('Socket not connected, attempting to reconnect...');
      this.reconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect(): void {
    console.log('Reconnecting WebSocket...');
    this.disconnect();
    setTimeout(() => {
      this.initializeSocket();
    }, 1000); // Небольшая задержка перед переподключением
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
