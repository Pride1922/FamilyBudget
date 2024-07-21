import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MFAService } from '../../services/mfa.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService

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
    private snackBar: SnackbarService // Inject SnackbarService
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
        this.snackBar.showSuccess('MFA setup initialized successfully!');
      },
      error => {
        console.error('Failed to setup MFA:', error);
        this.errorMessage = 'Failed to setup MFA. Please try again.';
        this.snackBar.showError('Failed to setup MFA. Please try again.');
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
      this.errorMessage = 'User ID not found. Please login again.';
      this.snackBar.showError('User ID not found. Please login again.');
      return;
    }

    if (this.mfaForm.invalid) {
      this.snackBar.showError('Please enter a valid MFA token.');
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
        this.snackBar.showSuccess('MFA confirmed successfully!');
        this.navigateBackToProfile(); // Navigate back to profile on success
      },
      error => {
        console.error('Failed to confirm MFA:', error);
        this.errorMessage = 'Failed to confirm MFA. Please verify the code and try again.';
        this.snackBar.showError('Failed to confirm MFA. Please verify the code and try again.');
      }
    );
  }

  navigateBackToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
