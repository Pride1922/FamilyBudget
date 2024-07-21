import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  loggedInUser = this.loggedInUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser(); // Load user details from localStorage on service initialization
  }

  private loadUser() {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token);
      this.loggedInUserSubject.next(user);
    }
  }

  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token); // Assuming parseJwt is a method to decode JWT tokens
      return user.id; // Extracting user id from the decoded token
    } else {
      console.error('Token not found in localStorage');
      return null;
    }
  }

  registerUser(email: string, username: string, password: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, username, password, token })
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(error);
        })
      );
  }

  login(user: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, user)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            const userDetails = this.parseJwt(response.token);
            this.loggedInUserSubject.next(userDetails);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(error);
        })
      );
  }

  setLoggedInUser(user: any) {
    this.loggedInUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isMFACompleted(): boolean {
    return !!localStorage.getItem('mfa_completed');
  }

  setMFACompleted(): void {
    localStorage.setItem('mfa_completed', 'true');
  }

  // Get email by registration token
  getEmailByToken(token: string): Observable<{ email: string }> {
    const params = new HttpParams().set('token', token);
    return this.http.get<{ email: string }>(`${this.apiUrl}/auth/email-by-token`, { params })
      .pipe(
        catchError(error => {
          console.error('Error retrieving email by token:', error);
          return throwError(error);
        })
      );
  }

  // Recover password
  recoverPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recover-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Recover password error:', error);
          return throwError(error);
        })
      );
  }

  //Reset Password
  resetPassword(token: string, newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword })
  }
  // Verify reset token 
  verifyResetToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-reset-token`, { token });
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('mfa_completed'); // Clear MFA completion status on logout
    this.loggedInUserSubject.next(null);
  }

  private parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
}
