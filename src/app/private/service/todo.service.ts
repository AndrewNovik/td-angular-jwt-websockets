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
  socket: Socket = io('http://localhost:3000/todos', {
    auth: {
      authorization: tokenGetter(),
    },
  });
  todoItemsSubject = new BehaviorSubject<TodoItem[]>([]);
  public todoItems$ = this.todoItemsSubject.asObservable();

  getTodos() {
    console.log('try get todos');

    this.socket.on('todos', (todos: TodoItem[]) => {
      console.log(todos);
      this.todoItemsSubject.next(todos);
    });
  }

  getAddedTodos() {
    this.socket.on('addedTodo', (todos) => {
      console.log(todos);
      this.todoItemsSubject.next([...this.todoItemsSubject.value, todos]);
    });
  }

  saveTodo(todoitem: any) {
    console.log(todoitem);
    this.socket.emit('addTodo', todoitem);
  }
}
