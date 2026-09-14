import { Component, Input, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Customer {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
}

const STORAGE_KEY = 'banking-app-customers';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})
export class CustomerDetailsComponent {
  private readonly platformId = inject(PLATFORM_ID);

  @Input() customers: Customer[] = this.loadCustomers();

  protected readonly editingId = signal<string | null>(null);

  protected newCustomer: Customer = this.emptyCustomer();

  isEditing(customerId: string): boolean {
    return this.editingId() === customerId;
  }

  edit(customerId: string): void {
    this.editingId.set(customerId);
  }

  save(): void {
    this.editingId.set(null);
    this.persist();
  }

  cancel(): void {
    this.editingId.set(null);
  }

  delete(customerId: string): void {
    this.customers = this.customers.filter(c => c.customerId !== customerId);
    this.persist();
  }

  addCustomer(): void {
    if (!this.newCustomer.customerId || !this.newCustomer.customerName) {
      return;
    }
    this.customers = [...this.customers, this.newCustomer];
    this.newCustomer = this.emptyCustomer();
    this.persist();
  }

  private emptyCustomer(): Customer {
    return { customerId: '', customerName: '', email: '', phone: '', address: '' };
  }

  private loadCustomers(): Customer[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore malformed data and fall back to defaults
        }
      }
    }
    return [
      { customerId: 'CUST001', customerName: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0123', address: '123 Main Street, New York, NY 10001' },
      { customerId: 'CUST002', customerName: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0456', address: '456 Oak Avenue, Boston, MA 02101' },
      { customerId: 'CUST003', customerName: 'Michael Lee', email: 'michael.lee@example.com', phone: '+1-555-0789', address: '789 Pine Road, Chicago, IL 60601' }
    ];
  }

  private persist(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.customers));
    }
  }
}
