import { Component, inject, OnInit } from '@angular/core';
import { TodoService } from '../../service/todo.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly todoService: TodoService = inject(TodoService);

  ngOnInit(): void {
    this.todoService.sendMessage();
  }
}
