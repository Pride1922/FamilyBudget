import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategory } from '../models/subcategory.model'; // Ensure the correct import path
import { environment } from '../environments/environment'; // Ensure the correct import path

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllSubcategories(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories`);
  }

  getSubcategoriesByCategoryId(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories/category/${categoryId}`);
}

  getSubcategoryById(id: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(`${this.apiUrl}/subcategories/${id}`);
  }

  createSubcategory(categoryId: number, subcategory: Omit<Subcategory, 'id' | 'category_id'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/subcategories`, { ...subcategory, category_id: categoryId });
  }

  updateSubcategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${subcategory.id}`, subcategory);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${id}`);
  }
}
