import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-config';

export interface Customer {
  customerId: number;
  name: string;
  age: number;
  address: string;
}

export type NewCustomer = Omit<Customer, 'customerId'>;

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

  deleteCustomer(customerId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/deleteCustomer/${customerId}`);
  }
}
