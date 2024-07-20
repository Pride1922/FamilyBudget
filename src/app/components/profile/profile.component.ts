import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

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
    private router: Router
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
          } else {
            this.passwordChangeSuccess = true;
            this.errorMessage = null;
            this.changePasswordForm.reset();
          }
        },
        error: (error) => {
          console.error('Change password error:', error);
          this.errorMessage = 'An error occurred while changing password.';
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
