import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.css']
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm = this.fb.group({
      id: [data.id],
      name: [data.name, Validators.required],
      type: [data.type, Validators.required],
      icon: [data.icon || ''],
      subcategories: this.fb.array(data.subcategories || [])
    });
  }

  get subcategories(): FormArray {
    return this.categoryForm.get('subcategories') as FormArray;
  }

  addSubcategory(): void {
    this.subcategories.push(this.fb.group({
      id: [null],
      name: ['', Validators.required]
    }));
  }

  removeSubcategory(index: number): void {
    this.subcategories.removeAt(index);
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      this.dialogRef.close(this.categoryForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
