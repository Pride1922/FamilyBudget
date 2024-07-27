import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedInUserSubject = new BehaviorSubject<any>(null); // Private BehaviorSubject
  public loggedInUser = this.loggedInUserSubject.asObservable(); // Public Observable

  constructor(
    private http: HttpClient, 
    private snackbarService: SnackbarService, 
    private router: Router
  ) {
    this.loadUser(); // Load user details from localStorage on service initialization
  }

  // Public method to get the current logged-in user's details
  getLoggedInUser(): Observable<any> {
    return this.loggedInUser;
  }

  // Load user details from localStorage
  private loadUser() {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token);
      this.loggedInUserSubject.next(user);
    }
  }

  // Retrieve user ID from the token
  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.parseJwt(token);
      return user.id; // Assuming 'id' is a property in the decoded token
    } else {
      console.error('Token not found in localStorage');
      return null;
    }
  }

  // Register a new user
  registerUser(email: string, username: string, password: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/registeruser`, { email, username, password, token })
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(error);
        })
      );
  }

  // Log in a user and save token to localStorage
  login(user: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, user)
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.updateToken(response.token);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(error);
        })
      );
  }

  // Set the current logged-in user
  setLoggedInUser(user: any) {
    this.loggedInUserSubject.next(user);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Check if MFA is completed
  isMFACompleted(): boolean {
    return !!localStorage.getItem('mfa_completed');
  }

  // Set MFA completion status
  setMFACompleted(): void {
    localStorage.setItem('mfa_completed', 'true');
  }

  // Retrieve email by token
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

  // Request password recovery
  recoverPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recover-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Recover password error:', error);
          return throwError(error);
        })
      );
  }

  // Reset password using a token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  // Verify reset token
  verifyResetToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-reset-token`, { token });
  }

  // Log out the user and clear localStorage
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('mfa_completed'); // Clear MFA completion status on logout
    this.loggedInUserSubject.next(null);
    this.router.navigate(['/login']); // Redirect to login page
  }

  // Parse JWT token to extract user information
  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  // Update the JWT token and notify observers
  updateToken(newToken: string) {
    localStorage.setItem('token', newToken);
    const userDetails = this.parseJwt(newToken);
    this.loggedInUserSubject.next(userDetails);
  }

  // Refresh the JWT token using a refresh token
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, { token: refreshToken })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.updateToken(response.token);
          }
        }),
        catchError(error => {
          console.error('Refresh token error:', error);
          return throwError(error);
        })
      );
  }

  // Update user information and handle role changes
  updateUser(userId: number, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, updateData)
      .pipe(
        tap(response => {
          if (response.action === 'logout') {
            this.logout(); // Trigger logout if action is specified
            this.snackbarService.showError(response.message); // Show a message to the user
          } else if (response.action === 'roleUpdate') {
            // Handle role updates or other actions if necessary
            this.snackbarService.showInfo(response.message); // Show info message
            // Optionally, you might want to reload the user details or refresh the token here
            this.refreshToken().subscribe();
          }
        }),
        catchError(error => {
          console.error('Update user error:', error);
          return throwError(error);
        })
      );
  }
}
