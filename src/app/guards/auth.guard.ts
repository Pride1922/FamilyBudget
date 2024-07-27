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
      map(user => {
        const routeData = next.data as RouteData;
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        } else if (routeData.expectedRole && routeData.expectedRole !== user.role) {
          this.router.navigate(['/']);
          return false;
        } else if (!this.authService.isMFACompleted()) {
          this.router.navigate(['/mfa']);
          return false;
        }
        return true;
      }),
      tap(authorized => {
        if (!authorized) {
          console.error('Access denied - unauthorized');
        }
      })
    );
  }
}
