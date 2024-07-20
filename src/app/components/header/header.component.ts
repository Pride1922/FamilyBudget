import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  headerVisible = true;
  userMenuOpen = false; // Track if user menu is open
  loggedInUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService // Inject the service
  ) { }

  ngOnInit(): void {
    this.headerVisibilityService.headerVisible$.subscribe(visible => {
      this.headerVisible = visible;
    });

    this.authService.loggedInUser.subscribe(user => {
      this.loggedInUser = user;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.loggedInUser && this.loggedInUser.role === 'admin';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login page
  }

  onManageUsers(): void {
    this.router.navigate(['/manage-users']); // Redirect to the Manage Users page
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }
}
