import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserListResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/users';

  getUsers(filters?: { search?: string; role?: string; status?: string }): Observable<UserListResponse> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.role && filters.role !== 'All') params = params.set('role', filters.role);
    if (filters?.status && filters.status !== 'All') params = params.set('status', filters.status);

    return this.http.get<UserListResponse>(this.API_URL, { params });
  }

  getUserById(id: number): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/${id}`);
  }

  createUser(user: Partial<User>): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.post<{ success: boolean; message: string; user: User }>(this.API_URL, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}
