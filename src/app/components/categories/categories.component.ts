import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../services/category.service';
import { Category } from '../categories/category.interface';
import { CategoryDialogComponent } from '../categories/category-dialog/category-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  selectedCategory: Category | null = null;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      icon: [''] // Add this line for the icon
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => this.categories = categories);
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: category || { name: '', type: 'expense', icon: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Edit category
          this.categoryService.updateCategory(result).subscribe(() => this.loadCategories());
        } else {
          // Add new category
          this.categoryService.createCategory(result).subscribe(() => this.loadCategories());
        }
      }
    });
  }

  onSubmitCategory(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      if (categoryData.id) {
        // Edit category
        this.categoryService.updateCategory(categoryData).subscribe(() => this.loadCategories());
      } else {
        // Add new category
        this.categoryService.createCategory(categoryData).subscribe(() => this.loadCategories());
      }
      this.categoryForm.reset({ type: 'expense' });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }
}
