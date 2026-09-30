import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, NewCustomer, AccountDetails } from '../../services/customer.service';
import { AccountService, Account, AccountType } from '../../services/account.service';

interface CustomerAccountRow {
  customer: Customer;
  account: (Account & { customerId: number }) | null;
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})
export class CustomerDetailsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly accountService = inject(AccountService);

  protected customers: Customer[] = [];
  protected rows: CustomerAccountRow[] = [];
  protected readonly editingId = signal<number | null>(null);
  protected readonly editingNumber = signal<string | null>(null);
  protected readonly newPinVisible = signal(false);
  protected readonly visibleAccountPin = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  protected newCustomer: NewCustomer = this.emptyCustomer();
  protected newAccount: { customerId: number | null; accPin: string; accountType: AccountType } = this.emptyAccount();

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: customers => {
        this.customers = customers;
        this.rows = customers.flatMap((customer): CustomerAccountRow[] => {
          const customerAccounts = customer.accountDetails ?? [];
          return customerAccounts.length
            ? customerAccounts.map(account => ({
                customer,
                account: {
                  ...account,
                  id: account.id ?? 0,
                  accNo: account.accNo ?? '',
                  customerId: customer.customerId
                }
              }))
            : [{ customer, account: null }];
        });
      },
      error: () => this.errorMessage.set('Failed to load customers and accounts. Is the backend running on http://localhost:8083?')
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
      next: () => {
        this.editingId.set(null);
        this.successMessage.set('Customer saved successfully.');
      },
      error: () => this.errorMessage.set('Failed to update customer.')
    });
  }

  cancel(): void {
    this.editingId.set(null);
    this.loadCustomers();
  }

  delete(customerId: number): void {
    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        this.customers = this.customers.filter(customer => customer.customerId !== customerId);
        this.rows = this.rows.filter(row => row.customer.customerId !== customerId);
        this.successMessage.set('Customer and accounts deleted successfully.');
      },
      error: () => this.errorMessage.set('Failed to delete customer.')
    });
  }

  addCustomer(): void {
    if (!this.newCustomer.name || !this.newAccount.accPin) {
      return;
    }
    const customer: NewCustomer = {
      ...this.newCustomer,
      accountDetails: [{
        accPin: this.newAccount.accPin,
        accountType: this.newAccount.accountType
      }]
    };
    this.customerService.createCustomer(customer).subscribe({
      next: created => {
        this.customers = [...this.customers, created];
        this.newCustomer = this.emptyCustomer();
        this.newAccount = this.emptyAccount();
        this.loadCustomers();
        this.successMessage.set('Customer and account added successfully.');
      },
      error: () => this.errorMessage.set('Failed to create customer and account.')
    });
  }

  isAccountEditing(accNo: string): boolean {
    return this.editingNumber() === accNo;
  }

  editAccount(accNo: string): void {
    this.editingNumber.set(accNo);
  }

  toggleNewPin(): void {
    this.newPinVisible.update(visible => !visible);
  }

  toggleAccountPin(accNo: string): void {
    this.visibleAccountPin.update(visibleAccNo => visibleAccNo === accNo ? null : accNo);
  }

  saveAccount(account: Account): void {
    const row = this.rows.find(item => item.account?.accNo === account.accNo);
    if (!row) {
      this.errorMessage.set('Customer for account not found.');
      return;
    }
    this.customerService.updateCustomer(row.customer.customerId, {
      name: row.customer.name,
      age: row.customer.age,
      address: row.customer.address,
      accountDetails: (row.customer.accountDetails ?? []).map(item =>
        item.accNo === account.accNo
          ? { ...item, accPin: account.accPin, accountType: account.accountType }
          : item)
    }).subscribe({
      next: () => {
        this.editingNumber.set(null);
        this.successMessage.set('Customer and account saved successfully.');
        this.loadCustomers();
      },
      error: () => this.errorMessage.set('Failed to update account.')
    });
  }

  deleteAccount(accNo: string): void {
    const row = this.rows.find(item => item.account?.accNo === accNo);
    if (!row) {
      this.errorMessage.set('Account not found.');
      return;
    }
    this.customerService.deleteAccountFromCustomer(row.customer.customerId, accNo).subscribe({
      next: () => {
        this.loadCustomers();
        this.successMessage.set('Account deleted successfully.');
      },
      error: () => this.errorMessage.set('Failed to delete account.')
    });
  }

  addAccount(): void {
    if (!this.newAccount.customerId || !this.newAccount.accPin) {
      return;
    }
    const customer = this.customers.find(item => item.customerId === this.newAccount.customerId);
    if (!customer) {
      this.errorMessage.set('Select an existing customer.');
      return;
    }
    const account: AccountDetails = {
      accPin: this.newAccount.accPin,
      accountType: this.newAccount.accountType
    };
    this.customerService.updateCustomer(customer.customerId, {
      name: customer.name,
      age: customer.age,
      address: customer.address,
      accountDetails: [...(customer.accountDetails ?? []), account]
    } as NewCustomer & { accountDetails: AccountDetails[] }).subscribe({
      next: () => {
        this.newAccount = this.emptyAccount();
        this.loadCustomers();
        this.successMessage.set('Account added successfully.');
      },
      error: () => this.errorMessage.set('Failed to create account. Check that the customer ID exists.')
    });
  }

  private emptyCustomer(): NewCustomer {
    return { name: '', age: 0, address: '' };
  }

  private emptyAccount(): { customerId: number | null; accPin: string; accountType: AccountType } {
    return { customerId: null, accPin: '', accountType: 'SAVINGS' };
  }
}
