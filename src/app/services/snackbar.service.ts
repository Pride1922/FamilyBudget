// src/app/services/snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  // Generic show method for displaying snackbars
  private show(message: string, action: string = 'Close', duration: number = 3000, panelClass: string[] = []): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass
    });
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
