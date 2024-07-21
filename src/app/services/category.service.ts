import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Subcategory } from '../components/categories/category.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${category.id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  createSubcategory(categoryId: number, subcategory: Omit<Subcategory, 'id' | 'category_id'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/categories/${categoryId}/subcategories`, subcategory);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${id}`);
  }

  updateSubcategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${subcategory.id}`, subcategory);
  }
}
