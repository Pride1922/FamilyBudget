import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`)
      .pipe(
        catchError(error => {
          console.error('Failed to fetch categories:', error);
          return throwError(error);
        })
      );
  }

  createCategory(category: { name: string, type: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, category)
      .pipe(
        catchError(error => {
          console.error('Failed to create category:', error);
          return throwError(error);
        })
      );
  }

  updateCategory(categoryId: number, category: { name: string, type: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${categoryId}`, category)
      .pipe(
        catchError(error => {
          console.error(`Failed to update category with ID ${categoryId}:`, error);
          return throwError(error);
        })
      );
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${categoryId}`)
      .pipe(
        catchError(error => {
          console.error(`Failed to delete category with ID ${categoryId}:`, error);
          return throwError(error);
        })
      );
  }

  getAllSubcategories(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/${categoryId}/subcategories`)
      .pipe(
        catchError(error => {
          console.error(`Failed to fetch subcategories for category with ID ${categoryId}:`, error);
          return throwError(error);
        })
      );
  }

  createSubcategory(categoryId: number, subcategory: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories/${categoryId}/subcategories`, subcategory)
      .pipe(
        catchError(error => {
          console.error(`Failed to create subcategory for category with ID ${categoryId}:`, error);
          return throwError(error);
        })
      );
  }

  updateSubcategory(subcategoryId: number, subcategory: { name: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/subcategories/${subcategoryId}`, subcategory)
      .pipe(
        catchError(error => {
          console.error(`Failed to update subcategory with ID ${subcategoryId}:`, error);
          return throwError(error);
        })
      );
  }

  deleteSubcategory(subcategoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/subcategories/${subcategoryId}`)
      .pipe(
        catchError(error => {
          console.error(`Failed to delete subcategory with ID ${subcategoryId}:`, error);
          return throwError(error);
        })
      );
  }
}
