import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MFAService } from '../../services/mfa.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  mfaForm: FormGroup;
  recoverPasswordForm: FormGroup;

  showMFA: boolean = false;
  showRecoverPassword: boolean = false;
  userId: number = 0;

  hidePassword: boolean = true;
  isRecoveringPassword: boolean = false; // Add this flag for spinner control

  @ViewChild('mfaTokenInput') mfaTokenInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mfaService: MFAService,
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService,
    private snackbarService: SnackbarService // Inject SnackbarService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
    });

    this.mfaForm = this.fb.group({
      mfaToken: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]*$')
      ]]
    });

    this.recoverPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
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
      const user = { email: this.loginForm.value.email, password: this.loginForm.value.password };
      this.authService.login(user).subscribe(
        response => {
          if (response.requiresMFA) {
            this.showMFA = true;
            this.userId = response.userId;
            this.loginForm.reset();
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
    }
  }

  handleLoginSuccess(response: any) {
    localStorage.setItem('token', response.token);
    this.authService.setMFACompleted();
    this.authService.setLoggedInUser(response.user);
    this.router.navigate(['/home']);
    this.snackbarService.showSuccess('Login successful!'); // Show success message
  }

  handleLoginError(error: any) {
    console.error('Error during login:', error.status);
    if (error.status === 401) {
      this.snackbarService.showError('Invalid email or password'); // Show error message
    } else if (error.status === 403) {
      this.snackbarService.showError('User is disabled, please contact the administrator'); // Show error message
    } else {
      this.snackbarService.showError(error.error?.message || 'An unexpected error occurred. Please try again later.'); // Show error message
    }
  }

  handleMFAError(error: any) {
    console.error('Error verifying MFA:', error.status);
    if (error.status === 401) {
      this.snackbarService.showError('Invalid MFA token'); // Show error message
    } else if (error.status === 429) {
      this.snackbarService.showError('Too many requests. Please try again later.'); // Show error message
    } else {
      this.snackbarService.showError('Error verifying MFA. Please try again.'); // Show error message
    }
  }

  showRecoverPasswordForm() {
    this.showRecoverPassword = true;
  }

  recoverPassword() {
    if (this.recoverPasswordForm.valid) {
      this.isRecoveringPassword = true; // Show spinner
  
      const email = this.recoverPasswordForm.value.email;
      this.authService.recoverPassword(email).subscribe(
        response => {
          // Hide spinner and switch to login form
          this.isRecoveringPassword = false;
          this.snackbarService.showSuccess('Password recovery email sent.'); // Show success message
          
          // Use setTimeout to ensure the spinner has time to be hidden
          setTimeout(() => {
            this.showRecoverPassword = false; // Hide recover password form
            this.loginForm.reset(); // Reset the login form
            this.showMFA = false; // Hide MFA form if visible
            this.router.navigate(['/login']).then(() => {
              console.log('Navigated to login');
            }).catch(err => {
              console.error('Navigation error:', err);
            });
          }, 500); // Short delay to ensure UI updates
        },
        error => {
          this.isRecoveringPassword = false; // Hide spinner
          this.snackbarService.showError('Error sending password recovery email.'); // Show error message
          console.error('Error during password recovery:', error);
        }
      );
    }
  }
}
