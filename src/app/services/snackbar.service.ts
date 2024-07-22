import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  // Generic show method for displaying snackbars
  private show(message: string, action: string = 'Close', duration: number = 3000, panelClass: string[] = []): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end', // Always on the right side
      verticalPosition: 'top',   // Always on the top
      panelClass
    };
    this.snackBar.open(message, action, config);
  }

  // Method for showing success messages
  showSuccess(message: string, action: string = 'Close', duration: number = 3000): void {
    this.show(message, action, duration, ['snackbar-success']);
  }

  // Method for showing error messages
  showError(message: string, action: string = 'Close', duration: number = 3000): void {
    this.show(message, action, duration, ['snackbar-error']);
  }

  // Method for showing informational messages
  showInfo(message: string, action: string = 'Close', duration: number = 3000): void {
    this.show(message, action, duration, ['snackbar-info']);
  }
}
