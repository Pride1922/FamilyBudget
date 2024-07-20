import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false); // Close dialog with false when No is clicked
  }

  onYesClick(): void {
    this.dialogRef.close(true); // Close dialog with true when Yes is clicked
  }
}
