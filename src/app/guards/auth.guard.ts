import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap, map } from 'rxjs/operators';

interface RouteData {
  expectedRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.loggedInUser.pipe(
      tap((user: any) => {
        if (!user) {
          this.router.navigate(['/login']); // Redirect to login if user is not logged in
        } else {
          const routeData = next.data as RouteData;
          if (routeData.expectedRole && routeData.expectedRole !== user.role) {
            this.router.navigate(['/']); // Redirect to home if user doesn't have the expected role
          } else if (!this.authService.isMFACompleted()) {
            this.router.navigate(['/mfa']); // Redirect to MFA if MFA is not completed
          }
        }
      }),
      map((user: any) => !!user && (!next.data['expectedRole'] || next.data['expectedRole'] === user.role) && this.authService.isMFACompleted()),
      tap(authorized => {
        if (!authorized) {
          console.error('Access denied - unauthorized');
          this.router.navigate(['/']); // Handle unauthorized access
        }
      })
    );
  }
}
