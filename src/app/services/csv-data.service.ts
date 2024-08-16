import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class CsvDataService {
  private apiUrl = `${environment.apiUrl}/pending-movements`;

  constructor(private http: HttpClient, private snackbarService: SnackbarService) {}

  // Method to send the CSV file to the backend
  uploadCSVFile(file: File, setLoading: (loading: boolean) => void): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true); // Start the spinner

    return this.http.post(`${this.apiUrl}/upload`, formData).pipe(
      finalize(() => setLoading(false)), // Stop the spinner when done
      catchError(error => {
        console.error('Error uploading CSV file:', error);
        this.snackbarService.showError('Failed to upload CSV file. Please try again later.'); // Show error message
        return throwError(() => new Error('Failed to upload CSV file. Please try again later.'));
      })
    );
  }

  // Method to get pending movements from the backend
  getPendingMovements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching pending movements:', error);
        this.snackbarService.showError('Failed to fetch pending movements. Please try again later.'); // Show error message
        return throwError(() => new Error('Failed to fetch pending movements. Please try again later.'));
      })
    );
  }

  // Method to get all subcategories from the backend
  getAllSubcategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/subcategories`).pipe(
      catchError(error => {
        console.error('Error fetching subcategories:', error);
        this.snackbarService.showError('Failed to fetch subcategories. Please try again later.'); // Show error message
        return throwError(() => new Error('Failed to fetch subcategories. Please try again later.'));
      })
    );
  }

  // Method to update a movement (e.g., approve a movement)
  updateMovement(movementId: number, movementData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${movementId}`, movementData).pipe(
      catchError(error => {
        console.error('Error updating movement:', error);
        this.snackbarService.showError('Failed to update movement. Please try again later.'); // Show error message
        return throwError(() => new Error('Failed to update movement. Please try again later.'));
      })
    );
  }
}
