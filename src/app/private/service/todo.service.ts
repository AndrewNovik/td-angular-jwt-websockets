import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { tokenGetter } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {}

  socket = io('http://localhost:3000/todos', {
    auth: {
      authorization: tokenGetter(),
    },
  });

  public sendMessage() {
    this.socket.emit('message', 'message');

    console.log(this.socket.emit('message', 'message'));
  }
}
