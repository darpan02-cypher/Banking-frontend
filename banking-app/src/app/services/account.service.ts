import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-config';

export type AccountType = 'SAVINGS' | 'CURRENT';

export interface Account {
  id: number;
  accNo: string;
  accPin: string;
  accountType: AccountType;
  customerId: number | null;
}

export type NewAccount = Pick<Account, 'accPin' | 'accountType'>;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${API_BASE_URL}/getAllAccounts`);
  }

  getAccountByAccNo(accNo: string): Observable<Account> {
    return this.http.get<Account>(`${API_BASE_URL}/getAccountByAccNo/${accNo}`);
  }

  createAccountForCustomer(customerId: number, account: NewAccount): Observable<Account> {
    return this.http.post<Account>(`${API_BASE_URL}/createAccountForCustomer/${customerId}`, account);
  }

  updateAccount(accNo: string, account: NewAccount): Observable<Account> {
    return this.http.put<Account>(`${API_BASE_URL}/updateAccount/${accNo}`, account);
  }

  deleteAccount(accNo: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/deleteAccount/${accNo}`);
  }
}
