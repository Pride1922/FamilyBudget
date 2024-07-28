// merchants.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Merchant } from '../models/merchants.model';

@Injectable({
  providedIn: 'root'
})
export class MerchantsService {
  private apiUrl = 'http://your-api-url/merchants';

  constructor(private http: HttpClient) {}

  getMerchants(): Observable<Merchant[]> {
    return this.http.get<Merchant[]>(this.apiUrl);
  }

  addMerchant(merchant: Merchant): Observable<Merchant> {
    return this.http.post<Merchant>(this.apiUrl, merchant);
  }

  updateMerchant(merchant: Merchant): Observable<Merchant> {
    return this.http.put<Merchant>(`${this.apiUrl}/${merchant.id}`, merchant);
  }

  deleteMerchant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
