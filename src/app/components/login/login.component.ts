import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MFAService } from '../../services/mfa.service';
import { HeaderVisibilityService } from '../../services/header-visibility.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

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
  isRecoveringPassword: boolean = false;

  selectedLanguage: string = 'nl';
  languages = [
    { code: 'en', name: 'English', flag: 'assets/flags/en.ico' },
    { code: 'pt', name: 'Portuguese', flag: 'assets/flags/pt.ico' },
    { code: 'nl', name: 'Dutch', flag: 'assets/flags/nl.ico' }
  ];

  @ViewChild('mfaTokenInput') mfaTokenInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mfaService: MFAService,
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService,
    private snackbarService: SnackbarService,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.selectedLanguage = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(this.selectedLanguage);
    this.translate.use(this.selectedLanguage);

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
    this.selectedLanguage = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLanguage);
  }

  ngOnDestroy() {
    this.headerVisibilityService.showHeader();
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  getFlagByCode(code: string): string {
    const lang = this.languages.find(lang => lang.code === code);
    return lang ? lang.flag : '';
  }
  
  getLanguageNameByCode(code: string): string {
    const lang = this.languages.find(lang => lang.code === code);
    return lang ? lang.name : '';
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
    this.snackbarService.showSuccess(this.translate.instant('LOGIN.SUCCESS_MESSAGE'));
  }

  handleLoginError(error: any) {
    console.error('Error during login:', error.status);
    if (error.status === 401) {
      this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.EMAIL_REQUIRED'));
    } else if (error.status === 403) {
      this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.USER_DISABLED'));
    } else {
      this.snackbarService.showError(error.error?.message || this.translate.instant('LOGIN.ERRORS.UNEXPECTED_ERROR'));
    }
  }

  handleMFAError(error: any) {
    console.error('Error verifying MFA:', error.status);
    if (error.status === 401) {
      this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.MFA_TOKEN_REQUIRED'));
    } else if (error.status === 429) {
      this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.TOO_MANY_REQUESTS'));
    } else {
      this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.MFA_ERROR'));
    }
  }

  showRecoverPasswordForm() {
    this.showRecoverPassword = true;
  }

  recoverPassword() {
    if (this.recoverPasswordForm.valid) {
      this.isRecoveringPassword = true;

      const email = this.recoverPasswordForm.value.email;
      this.authService.recoverPassword(email).subscribe(
        response => {
          this.isRecoveringPassword = false;
          this.snackbarService.showSuccess(this.translate.instant('LOGIN.PASSWORD_RECOVERY_EMAIL_SENT'));
          setTimeout(() => {
            this.showRecoverPassword = false;
            this.loginForm.reset();
            this.showMFA = false;
            this.router.navigate(['/login']).then(() => {
            }).catch(err => {
              console.error('Navigation error:', err);
            });
          }, 500);
        },
        error => {
          this.isRecoveringPassword = false;
          this.snackbarService.showError(this.translate.instant('LOGIN.ERRORS.PASSWORD_RECOVERY_ERROR'));
          console.error('Error during password recovery:', error);
        }
      );
    }
  }

  cancelRecoverPassword() {
    this.showRecoverPassword = false;
    this.recoverPasswordForm.reset();
    this.router.navigate(['/login']);
  }

  changeLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('language', language);
  }
}
