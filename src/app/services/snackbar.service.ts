import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) { }

  // Generic show method for displaying snackbars
  private show(message: string, duration: number = 3000, panelClass: string[] = []): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end', // Always on the right side
      verticalPosition: 'top',   // Always on the top
      panelClass
    };
    const action = this.translate.instant('SNACKBAR.CLOSE'); // Translate 'Close'
    this.snackBar.open(message, action, config);
  }

  // Method for showing success messages
  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, duration, ['snackbar-success']);
  }

  // Method for showing error messages
  showError(message: string, duration: number = 3000): void {
    this.show(message, duration, ['snackbar-error']);
  }

  // Method for showing informational messages
  showInfo(message: string, duration: number = 3000): void {
    this.show(message, duration, ['snackbar-info']);
  }
}
