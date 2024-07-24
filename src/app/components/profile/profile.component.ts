import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  changePasswordForm!: FormGroup;
  mfaSetupForm!: FormGroup;
  user: User | null = null;
  formattedcreatedat: string | null = null;
  passwordChangeSuccess = false;
  errorMessage: string | null = null;
  passwordFields: any = {};

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: SnackbarService, // Inject SnackbarService
    private translate: TranslateService // Inject TranslateService
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    this.mfaSetupForm = this.fb.group({
      mfaToken: ['', Validators.required]
    });

    this.userService.getUser().subscribe({
      next: (user: User) => {
        this.user = user;
        this.formatDate();
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.snackBar.showError(this.translate.instant('PROFILE.ERROR_FETCHING_USER'));
      }
    });

    this.passwordFields = {
      oldPassword: { hide: true },
      newPassword: { hide: true },
      confirmNewPassword: { hide: true }
    };
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmNewPassword = formGroup.get('confirmNewPassword')?.value;
    if (newPassword !== confirmNewPassword) {
      formGroup.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmNewPassword')?.setErrors(null);
    }
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    if (this.user) {
      this.userService.changePassword(this.user.id, oldPassword, newPassword).subscribe({
        next: (response) => {
          if (response.error) {
            this.errorMessage = response.message;
            this.passwordChangeSuccess = false;
            this.snackBar.showError(this.translate.instant('PROFILE.CHANGE_PASSWORD_FAILED', { message: response.message }));
          } else {
            this.passwordChangeSuccess = true;
            this.errorMessage = null;
            this.changePasswordForm.reset();
            this.snackBar.showSuccess(this.translate.instant('PROFILE.CHANGE_PASSWORD_SUCCESS'));
          }
        },
        error: (error) => {
          console.error('Change password error:', error);
          this.errorMessage = this.translate.instant('PROFILE.ERROR_CHANGE_PASSWORD');
          this.snackBar.showError(this.translate.instant('PROFILE.ERROR_CHANGE_PASSWORD'));
        }
      });
    }
  }

  formatDate() {
    if (this.user && this.user.createdat) {
      const dateObj = new Date(this.user.createdat);
      this.formattedcreatedat = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
    }
  }

  togglePasswordVisibility(field: string) {
    this.passwordFields[field].hide = !this.passwordFields[field].hide;
  }

  navigateToMFASetup(): void {
    this.router.navigate(['/mfa-setup']);
  }
}
