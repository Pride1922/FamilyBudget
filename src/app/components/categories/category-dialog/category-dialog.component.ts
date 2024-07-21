import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subcategory } from '../../categories/category.interface';

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
    // Parse subcategories if it's a string
    const subcategories = typeof data.subcategories === 'string'
      ? JSON.parse(data.subcategories)
      : data.subcategories || [];

    console.log('Parsed subcategories:', subcategories); // Log parsed data

    this.categoryForm = this.fb.group({
      id: [data.id],
      name: [data.name, Validators.required],
      type: [data.type, Validators.required],
      icon: [data.icon || ''],
      subcategories: this.fb.array(this.initializeSubcategories(subcategories))
    });
  }

  get subcategories(): FormArray {
    return this.categoryForm.get('subcategories') as FormArray;
  }

  initializeSubcategories(subcategories: Subcategory[]): FormGroup[] {
    if (!Array.isArray(subcategories)) {
      return [];
    }

    return subcategories.map(sub => this.fb.group({
      id: [sub.id],
      name: [sub.name, Validators.required]
    }));
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
      console.log('Form value:', this.categoryForm.value); // Log form value
      this.dialogRef.close(this.categoryForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
