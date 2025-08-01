import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { WebSocketDebug } from '../utils/websocket-debug';

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
    console.log('🔌 [WEBSOCKET] === INITIALIZING WEBSOCKET ===');
    console.log('🔌 [WEBSOCKET] Connecting to default namespace: /');
    console.log('🔌 [WEBSOCKET] Current cookies before init:', document.cookie);
    console.log('🔌 [WEBSOCKET] Current URL:', window.location.href);
    
    // Настройки для работы с куками в WebSocket
    // Подключаемся к корневому namespace через прокси
    this.socket = io('/', {
      withCredentials: true, // Включаем отправку куки
      transports: ['websocket', 'polling'], // Поддерживаем оба транспорта
      autoConnect: true, // Автоматическое подключение
      forceNew: false, // Переиспользуем соединения (уменьшает ECONNABORTED)
      timeout: 10000, // Уменьшенный таймаут
      path: '/socket.io/', // Путь к Socket.IO
      reconnection: true, // Автоматическое переподключение
      reconnectionDelay: 1000, // Задержка перед переподключением
      reconnectionAttempts: 5, // Максимум попыток
    });

    console.log('🔌 [WEBSOCKET] Socket instance created with config:', {
      namespace: '/',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: false,
      timeout: 10000,
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupSocketListeners();
    console.log('🔌 [WEBSOCKET] === INITIALIZATION COMPLETE ===');
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Обработка подключения
    this.socket.on('connect', () => {
      console.log('🟢 [WEBSOCKET] === CONNECTION ESTABLISHED ===');
      console.log('🟢 [WEBSOCKET] WebSocket connected successfully');
      console.log('🟢 [WEBSOCKET] Socket ID:', this.socket?.id);
      console.log('🟢 [WEBSOCKET] Transport:', this.socket?.io?.engine?.transport?.name);
      console.log('🟢 [WEBSOCKET] Cookies at connection:', document.cookie);
      WebSocketDebug.diagnoseWebSocketState(this.socket);
      console.log('🟢 [WEBSOCKET] === CONNECTION END ===');
    });

    // Обработка отключения
    this.socket.on('disconnect', (reason) => {
      console.log('🔴 [WEBSOCKET] === DISCONNECTION ===');
      console.log('🔴 [WEBSOCKET] WebSocket disconnected:', reason);
      console.log('🔴 [WEBSOCKET] Timestamp:', new Date().toISOString());
      WebSocketDebug.logWebSocketError(reason, 'Disconnect');
      console.log('🔴 [WEBSOCKET] === DISCONNECT END ===');
    });

    // Обработка ошибок подключения
    this.socket.on('connect_error', (error) => {
      console.error('❌ [WEBSOCKET] === CONNECTION ERROR ===');
      console.error('❌ [WEBSOCKET] WebSocket connection error:', error);
      console.error('❌ [WEBSOCKET] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      console.error('❌ [WEBSOCKET] Current cookies:', document.cookie);
      WebSocketDebug.logWebSocketError(error, 'Connection Error');
      console.error('❌ [WEBSOCKET] === CONNECTION ERROR END ===');
    });

    // Обработка ошибок аутентификации
    this.socket.on('auth_error', (error) => {
      console.error('🚫 [WEBSOCKET] === AUTH ERROR ===');
      console.error('🚫 [WEBSOCKET] WebSocket authentication error:', error);
      console.error('🚫 [WEBSOCKET] Current cookies:', document.cookie);
      WebSocketDebug.logWebSocketError(error, 'Authentication Error');
      console.error('🚫 [WEBSOCKET] === AUTH ERROR END ===');
      // Можно добавить редирект на логин
    });

    // Обработка получения списка todos
    this.socket.on('todos', (todos: TodoItem[]) => {
      WebSocketDebug.logTodosResponse(todos);
      this.todoItemsSubject.next(todos);
      WebSocketDebug.logSystemSummary(todos, this.socket);
    });

    // Обработка добавления нового todo
    this.socket.on('addedTodo', (todo: TodoItem) => {
      WebSocketDebug.logTodoAdded(todo);
      const newTodos = [...this.todoItemsSubject.value, todo];
      this.todoItemsSubject.next(newTodos);
      WebSocketDebug.logSystemSummary(newTodos, this.socket);
    });

    // Обработка обновления todo
    this.socket.on('updatedTodo', (todo: TodoItem) => {
      WebSocketDebug.logTodoUpdated(todo);
      const currentTodos = this.todoItemsSubject.value;
      const updatedTodos = currentTodos.map(t => t.id === todo.id ? todo : t);
      this.todoItemsSubject.next(updatedTodos);
      WebSocketDebug.logSystemSummary(updatedTodos, this.socket);
    });

    // Обработка удаления todo
    this.socket.on('deletedTodo', (todoId: number) => {
      WebSocketDebug.logTodoDeleted(todoId);
      const currentTodos = this.todoItemsSubject.value;
      const filteredTodos = currentTodos.filter(t => t.id !== todoId);
      this.todoItemsSubject.next(filteredTodos);
      WebSocketDebug.logSystemSummary(filteredTodos, this.socket);
    });

    // Обработка ошибок
    this.socket.on('error', (error) => {
      WebSocketDebug.logWebSocketError(error, 'General Socket Error');
    });
  }

  public getTodos(): void {
    WebSocketDebug.logTodosFetch(this.socket);
    if (this.socket && this.socket.connected) {
      console.log('🔄 [TODO SERVICE] Emitting getTodos request');
      this.socket.emit('getTodos');
      console.log('🔄 [TODO SERVICE] Request sent successfully');
    } else {
      console.warn('🔄 [TODO SERVICE] Socket not connected, attempting to reconnect...');
      WebSocketDebug.diagnoseWebSocketState(this.socket);
      this.reconnect();
    }
  }

  public saveTodo(todoItem: Omit<TodoItem, 'id'>): void {
    WebSocketDebug.logTodoCreation(todoItem, this.socket);
    if (this.socket && this.socket.connected) {
      console.log('💾 [TODO SERVICE] Emitting addTodo request');
      this.socket.emit('addTodo', todoItem);
      console.log('💾 [TODO SERVICE] Add request sent successfully');
    } else {
      console.warn('💾 [TODO SERVICE] Socket not connected, attempting to reconnect...');
      WebSocketDebug.diagnoseWebSocketState(this.socket);
      this.reconnect();
    }
  }

  public updateTodo(todoItem: TodoItem): void {
    console.log('🔄 [TODO SERVICE] === UPDATING TODO ===');
    console.log('🔄 [TODO SERVICE] Todo being updated:', todoItem);
    WebSocketDebug.logOperation('updateTodo', todoItem, this.socket);
    
    if (this.socket && this.socket.connected) {
      console.log('🔄 [TODO SERVICE] Emitting updateTodo request');
      this.socket.emit('updateTodo', todoItem);
      console.log('🔄 [TODO SERVICE] Update request sent successfully');
    } else {
      console.warn('🔄 [TODO SERVICE] Socket not connected, attempting to reconnect...');
      WebSocketDebug.diagnoseWebSocketState(this.socket);
      this.reconnect();
    }
    console.log('🔄 [TODO SERVICE] === UPDATE END ===');
  }

  public deleteTodo(todoId: number): void {
    console.log('🗑️ [TODO SERVICE] === DELETING TODO ===');
    console.log('🗑️ [TODO SERVICE] Todo ID being deleted:', todoId);
    WebSocketDebug.logOperation('deleteTodo', { todoId }, this.socket);
    
    if (this.socket && this.socket.connected) {
      console.log('🗑️ [TODO SERVICE] Emitting deleteTodo request');
      this.socket.emit('deleteTodo', todoId);
      console.log('🗑️ [TODO SERVICE] Delete request sent successfully');
    } else {
      console.warn('🗑️ [TODO SERVICE] Socket not connected, attempting to reconnect...');
      WebSocketDebug.diagnoseWebSocketState(this.socket);
      this.reconnect();
    }
    console.log('🗑️ [TODO SERVICE] === DELETE END ===');
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 [WEBSOCKET] === DISCONNECTING ===');
      console.log('🔌 [WEBSOCKET] Manually disconnecting WebSocket');
      WebSocketDebug.logOperation('disconnect', null, this.socket);
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 [WEBSOCKET] === DISCONNECT COMPLETE ===');
    }
  }

  public reconnect(): void {
    console.log('🔄 [WEBSOCKET] === RECONNECTING ===');
    console.log('🔄 [WEBSOCKET] Initiating WebSocket reconnection...');
    WebSocketDebug.diagnoseWebSocketState(this.socket);
    this.disconnect();
    setTimeout(() => {
      console.log('🔄 [WEBSOCKET] Starting reconnection after delay...');
      this.initializeSocket();
    }, 1000); // Небольшая задержка перед переподключением
    console.log('🔄 [WEBSOCKET] === RECONNECT INITIATED ===');
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
