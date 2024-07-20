import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  userForm: FormGroup;
  user: User;
  passwordFields: any = { hide: true }; // Object to store password visibility flag
  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.user = { ...data.user };

    this.userForm = this.fb.group({
      username: [this.user.username, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      password: [''],
      role: [this.user.role],
      isActive: [this.user.isActive]
    });
  }

  isSaving: boolean = false;
  get username() { return this.userForm.get('username'); }
  get email() { return this.userForm.get('email'); }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
  if (this.userForm.valid) {
    this.user = { ...this.user, ...this.userForm.value };

    // Disable the form submission button to prevent multiple clicks
    this.isSaving = true; // Add a flag to track saving state

    this.userService.updateUser(this.user).subscribe(
      () => {
        this.dialogRef.close(this.user);
      },
      (error) => {
        console.error('Error updating user:', error);
        this.isSaving = false; // Enable the form submission button on error
      },
      () => {
        this.isSaving = false; // Enable the form submission button on completion
      }
    );
  } else {
    this.userForm.markAllAsTouched();
  }
}

  togglePasswordVisibility() {
    this.passwordFields.hide = !this.passwordFields.hide;
  }
}
