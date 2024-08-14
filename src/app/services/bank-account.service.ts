import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount } from '../models/bank-account';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private apiUrl = `${environment.apiUrl}/bankaccounts`;

  constructor(private http: HttpClient) {}

  getBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.apiUrl);
  }

  getBankAccount(id: number): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/${id}`);
  }

  createBankAccount(bankAccount: BankAccount): Observable<BankAccount> {
    return this.http.post<BankAccount>(this.apiUrl, bankAccount);
  }

  updateBankAccount(id: number, bankAccount: BankAccount): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.apiUrl}/${id}`, bankAccount);
  }

  deleteBankAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
