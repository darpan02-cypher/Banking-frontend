import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { API_BASE_URL } from '../core/api-config';

export interface AccountDetails {
  id?: number;
  accNo?: string;
  accPin: string;
  accountType: 'SAVINGS' | 'CURRENT';
}

export interface Customer {
  customerId: number;
  name: string;
  age: number;
  address: string;
  accountDetails: AccountDetails[];
}

export type NewCustomer = Omit<Customer, 'customerId' | 'accountDetails'> & {
  accountDetails?: AccountDetails[];
};

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API_BASE_URL}/getAllCustomers`);
  }

  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<Customer>(`${API_BASE_URL}/getCustomerById/${customerId}`);
  }

  // the backend names this endpoint "createAccount" but it actually creates a customer
  createCustomer(customer: NewCustomer): Observable<Customer> {
    return this.http.post<Customer>(`${API_BASE_URL}/createAccount`, customer);
  }

  updateCustomer(customerId: number, customer: NewCustomer): Observable<Customer> {
    return this.http.put<Customer>(`${API_BASE_URL}/updateCustomer/${customerId}`, customer);
  }

  deleteAccountFromCustomer(customerId: number, accNo: string): Observable<Customer> {
    return this.getCustomerById(customerId).pipe(
      switchMap(customer => this.updateCustomer(customerId, {
        name: customer.name,
        age: customer.age,
        address: customer.address,
        accountDetails: (customer.accountDetails ?? []).filter(account => account.accNo !== accNo)
      }))
    );
  }

  deleteCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/deleteCustomer/${customerId}`);
  }
}
