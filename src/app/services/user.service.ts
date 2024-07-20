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

  /**
   * Fetch all users.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Fetch a specific user's details.
   */
  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/user`)
      .pipe(
        catchError(this.handleError)
      );
  }

  
  addUserByEmail(email: string): Observable<any> {
    console.log(email);
    return this.http.post<any>(`${this.apiUrl}/register/send-email`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Edit an existing user.
   * @param user The user data to update.
   */
  editUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete a user by their ID.
   * @param userId The ID of the user to delete.
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update a user's details.
   * @param user The user data to update.
   */
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update the active status of a user.
   * @param userId The ID of the user to update.
   * @param isActive The new active status.
   */
  updateUserStatus(userId: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${userId}/status`, { isActive })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Change a user's password.
   * @param userId The ID of the user whose password is to be changed.
   * @param oldPassword The current password.
   * @param newPassword The new password.
   */
  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/change-password`, { userId, oldPassword, newPassword })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Disable Multi-Factor Authentication (MFA) for a user.
   * @param userId The ID of the user.
   */
  disableMfa(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/disable-mfa`, { userId })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors.
   * @param error The error response from the HTTP request.
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
