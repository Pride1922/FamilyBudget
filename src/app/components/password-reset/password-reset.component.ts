import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderVisibilityService } from '../../services/header-visibility.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {
  passwordResetForm: FormGroup;
  token: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string | null = null;
  isLoading = false;
  isValidToken = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private headerVisibilityService: HeaderVisibilityService
  ) {
    this.passwordResetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.headerVisibilityService.hideHeader();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Invalid or missing token.';
        return;
      }

      // Verify the token
      this.authService.verifyResetToken(this.token).subscribe(
        response => {
          this.isValidToken = true;
        },
        error => {
          this.isValidToken = false;
          this.errorMessage = error.error.message || 'Token is invalid or has expired';
        }
      );
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  resetPassword() {
    if (!this.isValidToken || this.passwordResetForm.invalid) {
      this.errorMessage = 'Invalid form submission.';
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.passwordResetForm.value;
    if (!this.token) {
      this.errorMessage = 'Token is missing.';
      this.isLoading = false;
      return;
    }

    this.authService.resetPassword(this.token, newPassword).subscribe(
      () => {
        this.snackBar.open('Password has been reset successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error => {
        this.errorMessage = 'An error occurred while resetting the password.';
        console.error(error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  togglePasswordVisibility(field: string) {
    if (field === 'newPassword') {
      this.hidePassword = !this.hidePassword;
    } else if (field === 'confirmPassword') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
}
