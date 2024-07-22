import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../components/categories/category.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSubcategoriesByCategoryId(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/categories/${categoryId}/subcategories`);
  }

  getSubcategoryById(id: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(`${this.apiUrl}/subcategories/${id}`);
  }

  createSubcategory(categoryId: number, subcategory: Omit<Subcategory, 'id' | 'category_id'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/categories/${categoryId}/subcategories`, subcategory);
  }

  updateSubcategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${subcategory.id}`, subcategory);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${id}`);
  }
}
