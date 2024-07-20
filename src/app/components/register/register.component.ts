import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service'; // Import the service

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  username: string = '';
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService // Inject the service
  ) {}

  ngOnInit() {
    this.headerVisibilityService.hideHeader(); // Hide the header
  }

  ngOnDestroy() {
    this.headerVisibilityService.showHeader(); // Show the header
  }

  register() {
    const user = { username: this.username, email: this.email, password: this.password };
    this.authService.register(user).subscribe(
      response => {
        this.successMessage = 'User registered successfully! Redirecting to login page...';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000); // Redirect after 2 seconds
      },
      error => {
        this.errorMessage = 'Error registering user. Please try again.';
        this.successMessage = '';
        console.error('Error registering user', error);
      }
    );
  }
}
