import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { tokenGetter } from '../../app.config';
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
  private readonly socket: Socket = io('http://localhost:3000/todos', {
    auth: {
      authorization: tokenGetter(),
    },
  });
  private readonly todoItemsSubject = new BehaviorSubject<TodoItem[]>([]);
  public readonly todoItems$ = this.todoItemsSubject.asObservable();

  public getTodos(): void {
    console.log('try get todos');

    this.socket.on('todos', (todos: TodoItem[]) => {
      console.log(todos);
      this.todoItemsSubject.next(todos);
    });
  }

  public getAddedTodos(): void {
    this.socket.on('addedTodo', (todos) => {
      console.log(todos);
      this.todoItemsSubject.next([...this.todoItemsSubject.value, todos]);
    });
  }

  public saveTodo(todoitem: any): void {
    console.log(todoitem);
    this.socket.emit('addTodo', todoitem);
  }
}
