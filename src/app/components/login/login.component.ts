import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MFAService } from '../../services/mfa.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  mfaForm: FormGroup;

  errorMessage: string = '';
  showMFA: boolean = false;
  userId: number = 0;

  hidePassword: boolean = true;

  @ViewChild('mfaTokenInput') mfaTokenInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mfaService: MFAService,
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
    });

    this.mfaForm = this.fb.group({
      mfaToken: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]*$') // Only numeric characters
      ]]
    });
  }

  ngOnInit() {
    this.headerVisibilityService.hideHeader();
  }

  ngOnDestroy() {
    this.headerVisibilityService.showHeader();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  loginFormSubmit() {
    if (this.loginForm.valid) {
      const user = { username: this.loginForm.value.username, password: this.loginForm.value.password };
      this.authService.login(user).subscribe(
        response => {
          if (response.requiresMFA) {
            this.showMFA = true;
            this.userId = response.userId;
            this.loginForm.reset(); // Resetting loginForm here
            setTimeout(() => {
              this.mfaTokenInput.nativeElement.focus();
            }, 0);
          } else {
            this.handleLoginSuccess(response);
          }
        },
        error => {
          this.handleLoginError(error);
        }
      );
    } else {
    }
  }

  verifyMFA() {
    if (this.mfaForm.valid) {
      const mfaData = { mfaToken: this.mfaForm.value.mfaToken, userId: this.userId };
      this.mfaService.verifyMFA(mfaData).subscribe(
        response => {
          this.handleLoginSuccess(response);
        },
        error => {
          this.handleMFAError(error);
        }
      );
    } else {
    }
  }

  handleLoginSuccess(response: any) {
    localStorage.setItem('token', response.token);
    this.authService.setMFACompleted();
    this.authService.setLoggedInUser(response.user);
    this.router.navigate(['/home']);
  }

  handleLoginError(error: any) {
    console.error('Error during login:', error.status);
    if (error.status === 401) {
      this.errorMessage = 'Invalid username or password';
    } else if (error.status === 403) {
      this.errorMessage = 'User is disabled, please contact the administrator';
    } else {
      this.errorMessage = error.error?.message || 'An unexpected error occurred. Please try again later.';
    }
  }

  handleMFAError(error: any) {
    console.error('Error verifying MFA:', error.status);
    if (error.status === 401) {
      this.errorMessage = 'Invalid MFA token';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many requests. Please try again later.';
    } else {
      this.errorMessage = 'Error verifying MFA. Please try again.';
    }
  }
}
