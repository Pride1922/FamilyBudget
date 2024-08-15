import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token has expired or user is not authorized
          this.authService.logout(); // Clear any stored user data and token
          this.snackbarService.showError(this.translate.instant('ERRORS.TOKEN_EXPIRED')); // Show a Snackbar message
          this.router.navigate(['/login']); // Redirect to the login page
        } else if (error.status === 403) {
          // User is forbidden from accessing the resource
          this.authService.logout(); // Clear any stored user data and token
          this.snackbarService.showError(this.translate.instant('ERRORS.TOKEN_EXPIRED')); // Show a Snackbar message
          this.router.navigate(['/login']); // Redirect to the login page
        }
        return throwError(error);
      })
    );
  }
}
