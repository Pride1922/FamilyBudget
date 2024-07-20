import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model'; // Adjust the path based on your project structure
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/user`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  editUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${userId}/status`, { isActive })
      .pipe(
        catchError(this.handleError)
      );
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/change-password`, { userId, oldPassword, newPassword })
      .pipe(
        catchError(this.handleError)
      );
  }

  disableMfa(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/disable-mfa`, { userId })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
