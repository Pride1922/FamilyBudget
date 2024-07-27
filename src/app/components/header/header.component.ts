import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedInUser: any;
  isAdmin: boolean = false; // Add this property

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.loggedInUser.subscribe(user => {
      this.loggedInUser = user;
      this.isAdmin = this.loggedInUser && this.loggedInUser.role === 'admin'; // Set isAdmin
    });
  }

  toggleSidebar(): void {
    // Implement sidebar toggle logic if needed
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
