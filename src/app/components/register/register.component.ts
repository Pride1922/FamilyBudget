import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService

@Component({
  selector: 'app-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  token: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private headerVisibilityService: HeaderVisibilityService,
    private router: Router,
    private http: HttpClient,
    private snackBar: SnackbarService, // Inject SnackbarService
    private translate: TranslateService // Inject TranslateService
  ) {
    this.registrationForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]], // Disabled to prevent editing
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.headerVisibilityService.hideHeader();
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.loadEmailByToken(this.token);
      } else {
        this.errorMessage = this.translate.instant('REGISTRATION.NO_TOKEN');
        setTimeout(() => this.router.navigate(['/login']), 5000); // Redirect after 5 seconds
      }
    });
  }

  loadEmailByToken(token: string): void {
    this.authService.getEmailByToken(token).subscribe(
      response => {
        if (response && response.email) {
          const emailControl = this.registrationForm.get('email');
          if (emailControl) {
            emailControl.setValue(response.email, { emitEvent: false });
          }
        } else {
          this.errorMessage = this.translate.instant('REGISTRATION.EMAIL_RETRIEVE_FAILED');
          console.error('Email is undefined in response:', response);
        }
      },
      error => {
        this.errorMessage = this.translate.instant('REGISTRATION.INVALID_TOKEN');
        console.error('Error loading email by token:', error);
        setTimeout(() => this.router.navigate(['/login']), 5000); // Redirect after 5 seconds
      }
    );
  }

  passwordMatchValidator(frm: FormGroup) {
    return frm.get('password')?.value === frm.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  register(): void {
    if (this.registrationForm.valid && this.token) {
      const formValues = this.registrationForm.getRawValue(); // This includes disabled controls
      this.authService.registerUser(formValues.email, formValues.username, formValues.password, this.token).subscribe(
        response => {
          this.successMessage = this.translate.instant('REGISTRATION.SUCCESS');
          setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login after 2 seconds
        },
        error => {
          this.errorMessage = error.error.message || this.translate.instant('REGISTRATION.FAILED');
        }
      );
    } else {
      this.errorMessage = this.translate.instant('REGISTRATION.INVALID_FORM');
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }
}
