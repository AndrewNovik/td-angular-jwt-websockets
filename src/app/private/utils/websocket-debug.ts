import { TodoItem } from '../service/todo.service';

export interface WebSocketOperationInfo {
  operation: string;
  timestamp: string;
  data?: any;
  socketId?: string;
  connected: boolean;
  cookies: string;
}

export class WebSocketDebug {
  /**
   * Логирование WebSocket операций
   */
  static logOperation(
    operation: string, 
    data?: any, 
    socket?: any
  ): void {
    const info: WebSocketOperationInfo = {
      operation,
      timestamp: new Date().toISOString(),
      data,
      socketId: socket?.id,
      connected: socket?.connected || false,
      cookies: document.cookie
    };

    console.log(`🔌 [WEBSOCKET] ${operation}:`, info);
  }

  /**
   * Логирование создания задачи
   */
  static logTodoCreation(todoData: Omit<TodoItem, 'id'>, socket?: any): void {
    console.log('📝 [TODO CREATE] === CREATING TODO ===');
    console.log('📝 [TODO CREATE] Data being sent:', todoData);
    console.log('📝 [TODO CREATE] Socket connected:', socket?.connected);
    console.log('📝 [TODO CREATE] Socket ID:', socket?.id);
    console.log('📝 [TODO CREATE] Current cookies:', document.cookie);
    console.log('📝 [TODO CREATE] Timestamp:', new Date().toISOString());
    
    // Валидация данных
    this.validateTodoData(todoData);
    
    console.log('📝 [TODO CREATE] === CREATE END ===');
  }

  /**
   * Логирование получения задач
   */
  static logTodosFetch(socket?: any): void {
    console.log('📋 [TODO FETCH] === FETCHING TODOS ===');
    console.log('📋 [TODO FETCH] Socket connected:', socket?.connected);
    console.log('📋 [TODO FETCH] Socket ID:', socket?.id);
    console.log('📋 [TODO FETCH] Current cookies:', document.cookie);
    console.log('📋 [TODO FETCH] Timestamp:', new Date().toISOString());
    console.log('📋 [TODO FETCH] === FETCH END ===');
  }

  /**
   * Логирование получения ответа с задачами
   */
  static logTodosResponse(todos: TodoItem[]): void {
    console.log('📬 [TODO RESPONSE] === TODOS RECEIVED ===');
    console.log('📬 [TODO RESPONSE] Count:', todos.length);
    console.log('📬 [TODO RESPONSE] Data:', todos);
    console.log('📬 [TODO RESPONSE] Timestamp:', new Date().toISOString());
    
    // Анализ данных
    if (todos.length > 0) {
      console.log('📬 [TODO RESPONSE] Sample todo structure:', todos[0]);
      console.log('📬 [TODO RESPONSE] Completed todos:', todos.filter(t => t.f_done).length);
      console.log('📬 [TODO RESPONSE] Pending todos:', todos.filter(t => !t.f_done).length);
    } else {
      console.log('📬 [TODO RESPONSE] No todos found');
    }
    
    console.log('📬 [TODO RESPONSE] === RESPONSE END ===');
  }

  /**
   * Логирование добавления задачи
   */
  static logTodoAdded(todo: TodoItem): void {
    console.log('✅ [TODO ADDED] === TODO ADDED ===');
    console.log('✅ [TODO ADDED] New todo:', todo);
    console.log('✅ [TODO ADDED] ID assigned:', todo.id);
    console.log('✅ [TODO ADDED] Title:', todo.title);
    console.log('✅ [TODO ADDED] Content:', todo.content);
    console.log('✅ [TODO ADDED] Status:', todo.f_done ? 'Completed' : 'Pending');
    console.log('✅ [TODO ADDED] Timestamp:', new Date().toISOString());
    console.log('✅ [TODO ADDED] === ADDED END ===');
  }

  /**
   * Логирование обновления задачи
   */
  static logTodoUpdated(todo: TodoItem): void {
    console.log('🔄 [TODO UPDATED] === TODO UPDATED ===');
    console.log('🔄 [TODO UPDATED] Updated todo:', todo);
    console.log('🔄 [TODO UPDATED] ID:', todo.id);
    console.log('🔄 [TODO UPDATED] New status:', todo.f_done ? 'Completed' : 'Pending');
    console.log('🔄 [TODO UPDATED] Timestamp:', new Date().toISOString());
    console.log('🔄 [TODO UPDATED] === UPDATED END ===');
  }

  /**
   * Логирование удаления задачи
   */
  static logTodoDeleted(todoId: number): void {
    console.log('🗑️ [TODO DELETED] === TODO DELETED ===');
    console.log('🗑️ [TODO DELETED] Deleted todo ID:', todoId);
    console.log('🗑️ [TODO DELETED] Timestamp:', new Date().toISOString());
    console.log('🗑️ [TODO DELETED] === DELETED END ===');
  }

  /**
   * Логирование ошибок WebSocket
   */
  static logWebSocketError(error: any, context: string): void {
    console.error('❌ [WS ERROR] === WEBSOCKET ERROR ===');
    console.error('❌ [WS ERROR] Context:', context);
    console.error('❌ [WS ERROR] Error:', error);
    console.error('❌ [WS ERROR] Error type:', typeof error);
    console.error('❌ [WS ERROR] Current cookies:', document.cookie);
    console.error('❌ [WS ERROR] Timestamp:', new Date().toISOString());
    
    if (error && typeof error === 'object') {
      console.error('❌ [WS ERROR] Error message:', error.message);
      console.error('❌ [WS ERROR] Error code:', error.code);
      console.error('❌ [WS ERROR] Error stack:', error.stack);
    }
    
    console.error('❌ [WS ERROR] === ERROR END ===');
  }

  /**
   * Диагностика состояния WebSocket
   */
  static diagnoseWebSocketState(socket?: any): void {
    console.log('🔍 [WS DIAGNOSIS] === WEBSOCKET DIAGNOSIS ===');
    console.log('🔍 [WS DIAGNOSIS] Socket exists:', !!socket);
    console.log('🔍 [WS DIAGNOSIS] Socket connected:', socket?.connected);
    console.log('🔍 [WS DIAGNOSIS] Socket ID:', socket?.id);
    console.log('🔍 [WS DIAGNOSIS] Socket transport:', socket?.io?.engine?.transport?.name);
    console.log('🔍 [WS DIAGNOSIS] Current URL:', window.location.href);
    console.log('🔍 [WS DIAGNOSIS] Current cookies:', document.cookie);
    console.log('🔍 [WS DIAGNOSIS] Has auth cookies:', this.hasAuthCookies());
    console.log('🔍 [WS DIAGNOSIS] Timestamp:', new Date().toISOString());
    console.log('🔍 [WS DIAGNOSIS] === DIAGNOSIS END ===');
  }

  /**
   * Валидация данных задачи
   */
  private static validateTodoData(todoData: Omit<TodoItem, 'id'>): void {
    console.log('🔍 [TODO VALIDATION] === VALIDATING TODO DATA ===');
    
    const issues: string[] = [];
    
    if (!todoData.title || todoData.title.trim().length === 0) {
      issues.push('Title is empty');
    } else if (todoData.title.length < 3) {
      issues.push('Title too short (min 3 characters)');
    } else if (todoData.title.length > 100) {
      issues.push('Title too long (max 100 characters)');
    }
    
    if (!todoData.content || todoData.content.trim().length === 0) {
      issues.push('Content is empty');
    } else if (todoData.content.length < 5) {
      issues.push('Content too short (min 5 characters)');
    } else if (todoData.content.length > 500) {
      issues.push('Content too long (max 500 characters)');
    }
    
    if (typeof todoData.f_done !== 'boolean') {
      issues.push('f_done must be boolean');
    }
    
    if (issues.length > 0) {
      console.warn('🔍 [TODO VALIDATION] ⚠️ Validation issues:', issues);
    } else {
      console.log('🔍 [TODO VALIDATION] ✅ Todo data is valid');
    }
    
    console.log('🔍 [TODO VALIDATION] === VALIDATION END ===');
  }

  /**
   * Проверка наличия авторизационных куки
   */
  private static hasAuthCookies(): boolean {
    const cookies = document.cookie;
    return cookies.includes('access_token') || 
           cookies.includes('auth_check') || 
           cookies.includes('jwt');
  }

  /**
   * Сводка по состоянию системы todos
   */
  static logSystemSummary(todos: TodoItem[], socket?: any): void {
    console.log('📊 [TODO SUMMARY] === SYSTEM SUMMARY ===');
    console.log('📊 [TODO SUMMARY] WebSocket Status:');
    console.log('📊 [TODO SUMMARY] - Connected:', socket?.connected);
    console.log('📊 [TODO SUMMARY] - Socket ID:', socket?.id);
    console.log('📊 [TODO SUMMARY] - Has auth cookies:', this.hasAuthCookies());
    
    console.log('📊 [TODO SUMMARY] Todos Status:');
    console.log('📊 [TODO SUMMARY] - Total count:', todos.length);
    console.log('📊 [TODO SUMMARY] - Completed:', todos.filter(t => t.f_done).length);
    console.log('📊 [TODO SUMMARY] - Pending:', todos.filter(t => !t.f_done).length);
    
    if (todos.length > 0) {
      console.log('📊 [TODO SUMMARY] - Latest todo:', todos[todos.length - 1]);
    }
    
    console.log('📊 [TODO SUMMARY] Timestamp:', new Date().toISOString());
    console.log('📊 [TODO SUMMARY] === SUMMARY END ===');
  }
}