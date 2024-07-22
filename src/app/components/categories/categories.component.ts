import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { Category, Subcategory } from '../categories/category.interface';
import { SnackbarService } from '../../services/snackbar.service';

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
    private fb: FormBuilder,
    private snackbarService: SnackbarService
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
      this.categories = categories.map(category => ({
        ...category,
        subcategories: typeof category.subcategories === 'string' 
          ? this.parseSubcategories(category.subcategories) 
          : category.subcategories
      }));
    });
  }
  
  private parseSubcategories(subcategories: string): Subcategory[] {
    try {
      const parsed = JSON.parse(subcategories);
      return Array.isArray(parsed) ? parsed.filter(sc => sc.id != null && sc.name != null) : [];
    } catch {
      return [];
    }
  }

  toggleCategory(id: number): void {
    if (this.expandedCategoryId === id) {
      this.expandedCategoryId = null;
      this.categoryForm.reset({ type: 'expense' });
      this.selectedCategory = null;
    } else {
      this.expandedCategoryId = id;
      this.selectedCategory = this.categories.find(cat => cat.id === id) || null;
      this.openCategoryDialog(this.selectedCategory);
      this.openSubcategoryForm(id); // Set the category ID when opening the form
    }
  }
  

  openCategoryDialog(category: Category | null): void {
    if (category) {
      this.categoryForm.patchValue(category);
    } else {
      this.categoryForm.reset({ type: 'expense' });
    }
  }

  onSubmitCategory(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      if (categoryData.id) {
        this.categoryService.updateCategory(categoryData).subscribe(
          () => {
            this.loadCategories();
            this.snackbarService.showSuccess('Category updated successfully!');
          },
          error => {
            this.snackbarService.showError('Failed to update category.');
            console.error(error);
          }
        );
      } else {
        this.categoryService.createCategory(categoryData).subscribe(
          () => {
            this.loadCategories();
            this.snackbarService.showSuccess('Category created successfully!');
          },
          error => {
            this.snackbarService.showError('Failed to create category.');
            console.error(error);
          }
        );
      }
      this.categoryForm.reset({ type: 'expense' });
      this.selectedCategory = null;
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(
        () => {
          this.loadCategories();
          this.snackbarService.showSuccess('Category deleted successfully!');
        },
        error => {
          this.snackbarService.showError('Failed to delete category.');
          console.error(error);
        }
      );
    }
  }

  openSubcategoryForm(categoryId: number): void {
    this.subcategoryForm.reset(); // Reset form
    this.subcategoryForm.patchValue({ category_id: categoryId }); // Set category_id
    console.log('Subcategory form opened with category_id:', categoryId);
    console.log('Subcategory form values:', this.subcategoryForm.value); // Inspect form values
  }
  

  onSubmitSubcategory(): void {
    if (this.subcategoryForm.valid) {
      const subcategoryData = this.subcategoryForm.value;
      console.log('Submitting subcategory data:', subcategoryData); // Check form data
      if (subcategoryData.category_id) {
        if (subcategoryData.id) {
          this.subcategoryService.updateSubcategory(subcategoryData).subscribe(
            () => {
              this.loadCategories();
              this.snackbarService.showSuccess('Subcategory updated successfully!');
            },
            error => {
              this.snackbarService.showError('Failed to update subcategory.');
              console.error(error);
            }
          );
        } else {
          this.subcategoryService.createSubcategory(subcategoryData.category_id, subcategoryData).subscribe(
            () => {
              this.loadCategories();
              this.snackbarService.showSuccess('Subcategory created successfully!');
            },
            error => {
              this.snackbarService.showError('Failed to create subcategory.');
              console.error(error);
            }
          );
        }
        this.subcategoryForm.reset();
      } else {
        this.snackbarService.showError('Category ID is missing.');
      }
    }
  }
  
  deleteSubcategory(id: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.subcategoryService.deleteSubcategory(id).subscribe(
        () => {
          this.loadCategories();
          this.snackbarService.showSuccess('Subcategory deleted successfully!');
        },
        error => {
          this.snackbarService.showError('Failed to delete subcategory.');
          console.error(error);
        }
      );
    }
  } 
}
