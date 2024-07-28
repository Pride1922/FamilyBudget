import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { IconsService } from '../../services/icons.service';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  categoryForm: FormGroup;
  subcategoryForm: FormGroup;
  selectedCategory: Category | null = null;
  expandedCategoryId: number | null = null;
  filteredIcons: Observable<string[]> = of([]);

  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
    private iconsService: IconsService
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

  onSearchIcon(searchTerm: string) {
    this.filteredIcons = this.iconsService.searchIcons(searchTerm);
  }

  selectIcon(iconName: string) {
    this.categoryForm.patchValue({ icon: iconName });
    this.filteredIcons = of([]);
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe((categories: Category[]) => {
      this.categories = categories.map(category => ({ ...category, subcategories: [] }));
      this.loadSubcategories();
    });
  }

  loadSubcategories(): void {
    this.subcategoryService.getAllSubcategories().subscribe((subcategories: Subcategory[]) => {
      this.subcategories = subcategories;
      this.mapSubcategoriesToCategories();
    });
  }

  mapSubcategoriesToCategories(): void {
    this.categories.forEach(category => {
      category.subcategories = this.subcategories.filter(subcategory => subcategory.category_id === category.id);
    });
  }

  toggleCategory(id: number | undefined): void {
    if (id === undefined) return;

    if (this.expandedCategoryId === id) {
      this.expandedCategoryId = null;
      this.categoryForm.reset({ type: 'expense' });
      this.selectedCategory = null;
    } else {
      this.expandedCategoryId = id;
      this.selectedCategory = this.categories.find(cat => cat.id === id) || null;
      this.openCategoryDialog(this.selectedCategory);
      this.openSubcategoryForm(id);
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
      if (categoryData.id !== null && categoryData.id !== undefined) {
        this.categoryService.updateCategory(categoryData).subscribe(
          () => {
            this.loadCategories();
            this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.UPDATED_SUCCESS'));
          },
          error => {
            this.snackbarService.showError(this.translate.instant('CATEGORIES.UPDATE_FAILED'));
            console.error(error);
          }
        );
      } else {
        this.categoryService.createCategory(categoryData).subscribe(
          () => {
            this.loadCategories();
            this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.CREATED_SUCCESS'));
          },
          error => {
            this.snackbarService.showError(this.translate.instant('CATEGORIES.CREATE_FAILED'));
            console.error(error);
          }
        );
      }
      this.categoryForm.reset({ type: 'expense' });
      this.selectedCategory = null;
    }
  }

  deleteCategory(id: number | undefined): void {
    if (id === undefined) return;

    if (confirm(this.translate.instant('CATEGORIES.DELETE_CONFIRM'))) {
      this.categoryService.deleteCategory(id).subscribe(
        () => {
          this.loadCategories();
          this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.DELETED_SUCCESS'));
        },
        error => {
          const errorMessage = error.error?.error || this.translate.instant('CATEGORIES.DELETE_FAILED');
          this.snackbarService.showError(errorMessage);
          console.error('Deletion failed:', error);
        }
      );
    }
  }

  openSubcategoryForm(categoryId: number | undefined): void {
    if (categoryId === undefined) return;

    this.subcategoryForm.reset();
    this.subcategoryForm.patchValue({ category_id: categoryId });
  }

  onSubmitSubcategory(): void {
    if (this.subcategoryForm.valid) {
      const subcategoryData = this.subcategoryForm.value;
      if (subcategoryData.category_id) {
        if (subcategoryData.id) {
          this.subcategoryService.updateSubcategory(subcategoryData).subscribe(
            () => {
              this.loadCategories();
              this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.SUBCATEGORY.UPDATED_SUCCESS'));
            },
            error => {
              this.snackbarService.showError(this.translate.instant('CATEGORIES.SUBCATEGORY.UPDATE_FAILED'));
              console.error(error);
            }
          );
        } else {
          this.subcategoryService.createSubcategory(subcategoryData.category_id, subcategoryData).subscribe(
            () => {
              this.loadCategories();
              this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.SUBCATEGORY.CREATED_SUCCESS'));
            },
            error => {
              this.snackbarService.showError(this.translate.instant('CATEGORIES.SUBCATEGORY.CREATE_FAILED'));
              console.error(error);
            }
          );
        }
        this.subcategoryForm.reset();
      } else {
        this.snackbarService.showError(this.translate.instant('CATEGORIES.CATEGORY_ID_MISSING'));
      }
    }
  }

  deleteSubcategory(id: number | undefined): void {
    if (id === undefined) return;

    if (confirm(this.translate.instant('CATEGORIES.SUBCATEGORY.DELETE_CONFIRM'))) {
      this.subcategoryService.deleteSubcategory(id).subscribe(
        () => {
          this.loadCategories();
          this.snackbarService.showSuccess(this.translate.instant('CATEGORIES.SUBCATEGORY.DELETED_SUCCESS'));
        },
        error => {
          this.snackbarService.showError(this.translate.instant('CATEGORIES.SUBCATEGORY.DELETE_FAILED'));
          console.error(error);
        }
      );
    }
  }
}
