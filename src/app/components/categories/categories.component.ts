import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { Category, Subcategory } from '../categories/category.interface'; // Import your interfaces

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  newCategory: { name: string, type: 'income' | 'expense' } = { name: '', type: 'expense' };
  newSubcategory: { name: string } = { name: '' };

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories()
      .subscribe((categories: Category[]) => { // Specify the type of categories as Category[]
        this.categories = categories;
      });
  }

  addCategory(): void {
    this.categoryService.createCategory(this.newCategory)
      .subscribe(() => {
        this.loadCategories();
        this.newCategory = { name: '', type: 'expense' };
      });
  }

  editCategory(category: Category): void {
    // Handle editing logic, e.g., show a modal or navigate to an edit page
    console.log('Editing category:', category);
  }

  deleteCategory(categoryId: number): void {
    this.categoryService.deleteCategory(categoryId)
      .subscribe(() => {
        this.loadCategories();
      });
  }

  addSubcategory(categoryId: number): void {
    this.categoryService.createSubcategory(categoryId, this.newSubcategory)
      .subscribe(() => {
        this.loadCategories();
        this.newSubcategory = { name: '' };
      });
  }

  editSubcategory(subcategory: Subcategory): void {
    // Handle editing logic for subcategory
    console.log('Editing subcategory:', subcategory);
  }

  deleteSubcategory(subcategoryId: number): void {
    this.categoryService.deleteSubcategory(subcategoryId)
      .subscribe(() => {
        this.loadCategories();
      });
  }
}
