import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '../../services/snackbar.service'; // Adjust the path if necessary

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbarService: SnackbarService // Inject the SnackbarService
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false); // Close the dialog with a result of false
  }

  onYesClick(): void {
    this.snackbarService.showSuccess('User Deleted!', 'Close', 2000); // Show the Snackbar message
    setTimeout(() => {
      this.dialogRef.close(true); // Close the dialog with a result of true after 2 seconds
    }, 2000);
  }
}
