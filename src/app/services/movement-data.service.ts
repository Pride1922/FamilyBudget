import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovementDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Method to upload the CSV file to the backend
  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/upload-csv`, formData);
  }

  // Method to fetch pending movements from the backend
  getPendingMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-movements`);
  }

  // Method to approve a movement (move from temp to final table)
  approveMovement(movementId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approve-movement`, { id: movementId });
  }

  // Method to delete a pending movement
  deletePendingMovement(movementId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pending-movements/${movementId}`);
  }
}
