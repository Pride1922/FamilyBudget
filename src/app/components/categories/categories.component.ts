import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
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
  selectedCategory: Category | null = null;
  expandedCategoryId: number | null = null;

  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      icon: ['']
    });

    this.subcategoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => {
      // Parse subcategories JSON strings into arrays
      this.categories = categories.map(category => ({
        ...category,
        subcategories: typeof category.subcategories === 'string' 
          ? JSON.parse(category.subcategories) 
          : category.subcategories
      }));
    });
  }

  toggleCategory(id: number): void {
    this.expandedCategoryId = this.expandedCategoryId === id ? null : id;
  }

  openCategoryDialog(category?: Category): void {
    this.categoryForm.patchValue(category || { id: null, name: '', type: 'expense', icon: '' });
    this.selectedCategory = category || null;
  }

  onSubmitCategory(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      if (categoryData.id) {
        this.categoryService.updateCategory(categoryData).subscribe(() => this.loadCategories());
      } else {
        this.categoryService.createCategory(categoryData).subscribe(() => this.loadCategories());
      }
      this.categoryForm.reset({ type: 'expense' });
      this.selectedCategory = null;
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  openSubcategoryDialog(categoryId: number, subcategory?: Subcategory): void {
    this.subcategoryForm.patchValue(subcategory || { id: null, name: '', category_id: categoryId });
  }

  onSubmitSubcategory(): void {
    if (this.subcategoryForm.valid) {
      const subcategoryData = this.subcategoryForm.value;
      if (subcategoryData.id) {
        this.subcategoryService.updateSubcategory(subcategoryData).subscribe(() => this.loadCategories());
      } else {
        this.subcategoryService.createSubcategory(subcategoryData.category_id, subcategoryData).subscribe(() => this.loadCategories());
      }
      this.subcategoryForm.reset();
    }
  }

  deleteSubcategory(id: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.subcategoryService.deleteSubcategory(id).subscribe(() => this.loadCategories());
    }
  }
}
