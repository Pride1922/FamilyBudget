import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory } from '../categories/category.interface';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  subcategoryForm: FormGroup;
  expandedCategoryId: number | null = null;
  selectedCategoryId: number | null = null;
  editingSubcategoryId: number | null = null;

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required]
    });

    this.subcategoryForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories()
      .subscribe((categories: Category[]) => this.categories = categories);
  }

  addCategory(): void {
    if (this.categoryForm.valid) {
      this.categoryService.createCategory(this.categoryForm.value)
        .subscribe(() => {
          this.loadCategories();
          this.categoryForm.reset({ type: 'expense' });
        });
    }
  }

  addSubcategory(categoryId: number): void {
    if (this.subcategoryForm.valid) {
      this.categoryService.createSubcategory(categoryId, this.subcategoryForm.value)
        .subscribe(() => {
          this.loadCategories();
          this.subcategoryForm.reset();
        });
    }
  }

  toggleCategory(categoryId: number): void {
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }

  editCategory(category: Category): void {
    this.selectedCategoryId = category.id;
    this.categoryForm.setValue({
      name: category.name,
      type: category.type
    });
  }

  saveCategory(): void {
    if (this.categoryForm.valid && this.selectedCategoryId !== null) {
      const updatedCategory = {
        ...this.categoryForm.value,
        id: this.selectedCategoryId
      };

      this.categoryService.updateCategory(updatedCategory)
        .subscribe(() => {
          this.loadCategories();
          this.categoryForm.reset({ type: 'expense' });
          this.selectedCategoryId = null;
        });
    }
  }

  cancelEditCategory(): void {
    this.categoryForm.reset({ type: 'expense' });
    this.selectedCategoryId = null;
  }

  editSubcategory(subcategory: Subcategory): void {
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryForm.setValue({
      name: subcategory.name
    });
  }

  saveSubcategory(categoryId: number): void {
    if (this.subcategoryForm.valid && this.editingSubcategoryId !== null) {
      const updatedSubcategory = {
        ...this.subcategoryForm.value,
        id: this.editingSubcategoryId,
        category_id: categoryId
      };

      this.categoryService.updateSubcategory(updatedSubcategory)
        .subscribe(() => {
          this.loadCategories();
          this.subcategoryForm.reset();
          this.editingSubcategoryId = null;
        });
    }
  }

  cancelEditSubcategory(): void {
    this.subcategoryForm.reset();
    this.editingSubcategoryId = null;
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id)
        .subscribe(() => {
          this.loadCategories();
        });
    }
  }

  deleteSubcategory(id: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.categoryService.deleteSubcategory(id)
        .subscribe(() => {
          this.loadCategories();
        });
    }
  }
}
