import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly http: HttpClient = inject(HttpClient);

  constructor() {}

  getUserById(id: number): Observable<{ text: string }> {
    return this.http.get<{ text: string }>(`/api/users/${id}`);
  }
  getUsers(): Observable<{ text: string }> {
    return this.http.get<{ text: string }>(`/api/users/`);
  }
}
