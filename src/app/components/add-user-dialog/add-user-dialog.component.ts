import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '../../services/snackbar.service';
import { UserService } from '../../services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.css']
})
export class AddUserDialogComponent {
  addUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private snackbarService: SnackbarService, // Inject SnackbarService
    private userService: UserService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.addUserForm.get('email');
  }

  onSubmit() {
    if (this.addUserForm.valid) {
      const email = this.addUserForm.value.email;
      this.userService.addUserByEmail(email).subscribe(
        () => {
          this.snackbarService.showSuccess(this.translate.instant('ADD_USER.EMAIL_SENT_SUCCESS'));
          this.dialogRef.close(true);
        },
        (error) => {
          this.snackbarService.showError(this.translate.instant('ADD_USER.EMAIL_SENT_FAILED'));
          console.error('Error:', error);
        }
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
