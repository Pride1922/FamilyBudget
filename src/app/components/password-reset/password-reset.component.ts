import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService
import { HeaderVisibilityService } from '../../services/header-visibility.service';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService

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
    private snackBar: SnackbarService, // Inject SnackbarService
    private headerVisibilityService: HeaderVisibilityService,
    private translate: TranslateService // Inject TranslateService
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
        this.errorMessage = this.translate.instant('PASSWORD_RESET.INVALID_TOKEN');
        return;
      }

      // Verify the token
      this.authService.verifyResetToken(this.token).subscribe(
        response => {
          this.isValidToken = true;
        },
        error => {
          this.isValidToken = false;
          this.errorMessage = error.error.message || this.translate.instant('PASSWORD_RESET.TOKEN_EXPIRED');
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
      this.errorMessage = this.translate.instant('PASSWORD_RESET.INVALID_FORM');
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.passwordResetForm.value;
    if (!this.token) {
      this.errorMessage = this.translate.instant('PASSWORD_RESET.TOKEN_MISSING');
      this.isLoading = false;
      return;
    }

    this.authService.resetPassword(this.token, newPassword).subscribe(
      () => {
        this.snackBar.showSuccess(this.translate.instant('PASSWORD_RESET.SUCCESS_MESSAGE'), this.translate.instant('SNACKBAR.CLOSE'));
        this.router.navigate(['/login']);
      },
      error => {
        this.errorMessage = this.translate.instant('PASSWORD_RESET.ERROR_MESSAGE');
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
