import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MFAService } from '../../services/mfa.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService

@Component({
  selector: 'app-mfasetup',
  templateUrl: './mfasetup.component.html',
  styleUrls: ['./mfasetup.component.css']
})
export class MFASetupComponent implements OnInit, AfterViewInit {
  mfaForm: FormGroup;
  qrCodeUrl?: string;
  mfaConfirmed: boolean = false;
  errorMessage?: string;

  @ViewChild('mfaTokenInput', { static: false }) mfaTokenInput?: ElementRef;

  constructor(
    private fb: FormBuilder,
    private mfaService: MFAService,
    private authService: AuthService,
    private router: Router,
    private snackBar: SnackbarService, // Inject SnackbarService
    private translate: TranslateService // Inject TranslateService
  ) {
    this.mfaForm = this.fb.group({
      mfaToken: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]] // Only allow 6-digit numbers
    });
  }

  ngOnInit(): void {
    // Call backend service to generate MFA secret and QR code URL
    this.mfaService.setupMFA().subscribe(
      (data: any) => {
        this.qrCodeUrl = data.qrCodeUrl;
        this.snackBar.showSuccess(this.translate.instant('MFA.SETUP_INITIALIZED'));
      },
      error => {
        console.error('Failed to setup MFA:', error);
        this.errorMessage = this.translate.instant('MFA.SETUP_FAILED');
        this.snackBar.showError(this.translate.instant('MFA.SETUP_FAILED'));
      }
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.mfaTokenInput && this.mfaTokenInput.nativeElement) {
        this.mfaTokenInput.nativeElement.focus();
      }
    }, 1000); // Adjust timeout value if needed
  }

  confirmMFA(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      this.errorMessage = this.translate.instant('MFA.USER_ID_NOT_FOUND');
      this.snackBar.showError(this.translate.instant('MFA.USER_ID_NOT_FOUND'));
      return;
    }

    if (this.mfaForm.invalid) {
      this.snackBar.showError(this.translate.instant('MFA.INVALID_TOKEN'));
      return; // Form is invalid
    }

    const mfaData = {
      mfaToken: this.mfaForm.value.mfaToken,
      userId: userId
    };

    this.mfaService.verifyMFA(mfaData).subscribe(
      () => {
        this.mfaConfirmed = true;
        this.authService.setMFACompleted();
        this.snackBar.showSuccess(this.translate.instant('MFA.CONFIRM_SUCCESS'));
        this.navigateBackToProfile(); // Navigate back to profile on success
      },
      error => {
        console.error('Failed to confirm MFA:', error);
        this.errorMessage = this.translate.instant('MFA.CONFIRM_FAILED');
        this.snackBar.showError(this.translate.instant('MFA.CONFIRM_FAILED'));
      }
    );
  }

  navigateBackToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
