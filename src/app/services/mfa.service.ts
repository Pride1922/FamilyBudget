import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MFAService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  setupMFA(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mfa/setup-mfa`, {})
      .pipe(
        catchError(error => {
          console.error('MFA setup error:', error);
          return throwError(error);
        })
      );
  }

  verifyMFA(mfaData: { mfaToken: string, userId: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mfa/verify-mfa`, mfaData)
      .pipe(
        catchError(error => {
          console.error('MFA verification error:', error);
          return throwError(error);
        })
      );
  }

  disableMFA(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mfa/disable-mfa`, { userId })
      .pipe(
        catchError(error => {
          console.error('MFA disable error:', error);
          return throwError(error);
        })
      );
  }
}
