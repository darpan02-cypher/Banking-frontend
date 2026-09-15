import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, NewCustomer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})
export class CustomerDetailsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  protected customers: Customer[] = [];
  protected readonly editingId = signal<number | null>(null);
  protected errorMessage = signal<string | null>(null);

  protected newCustomer: NewCustomer = this.emptyCustomer();

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: customers => this.customers = customers,
      error: () => this.errorMessage.set('Failed to load customers. Is the backend running on http://localhost:8083?')
    });
  }

  isEditing(customerId: number): boolean {
    return this.editingId() === customerId;
  }

  edit(customerId: number): void {
    this.editingId.set(customerId);
  }

  save(customer: Customer): void {
    this.customerService.updateCustomer(customer.customerId, customer).subscribe({
      next: () => this.editingId.set(null),
      error: () => this.errorMessage.set('Failed to update customer.')
    });
  }

  cancel(): void {
    this.editingId.set(null);
    this.loadCustomers();
  }

  delete(customerId: number): void {
    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => this.customers = this.customers.filter(c => c.customerId !== customerId),
      error: () => this.errorMessage.set('Failed to delete customer.')
    });
  }

  addCustomer(): void {
    if (!this.newCustomer.name) {
      return;
    }
    this.customerService.createCustomer(this.newCustomer).subscribe({
      next: created => {
        this.customers = [...this.customers, created];
        this.newCustomer = this.emptyCustomer();
      },
      error: () => this.errorMessage.set('Failed to create customer.')
    });
  }

  private emptyCustomer(): NewCustomer {
    return { name: '', age: 0, address: '' };
  }
}
