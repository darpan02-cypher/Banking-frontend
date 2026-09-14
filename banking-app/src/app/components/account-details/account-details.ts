import { Component, Input, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  createdDate: string;
}

const STORAGE_KEY = 'banking-app-accounts';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css'
})
export class AccountDetailsComponent {
  private readonly platformId = inject(PLATFORM_ID);

  @Input() accounts: Account[] = this.loadAccounts();

  protected readonly editingNumber = signal<string | null>(null);

  protected newAccount: Account = this.emptyAccount();

  isEditing(accountNumber: string): boolean {
    return this.editingNumber() === accountNumber;
  }

  statusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-danger';
      case 'suspended': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  edit(accountNumber: string): void {
    this.editingNumber.set(accountNumber);
  }

  save(): void {
    this.editingNumber.set(null);
    this.persist();
  }

  cancel(): void {
    this.editingNumber.set(null);
  }

  delete(accountNumber: string): void {
    this.accounts = this.accounts.filter(a => a.accountNumber !== accountNumber);
    this.persist();
  }

  addAccount(): void {
    if (!this.newAccount.accountNumber || !this.newAccount.accountType) {
      return;
    }
    this.accounts = [...this.accounts, this.newAccount];
    this.newAccount = this.emptyAccount();
    this.persist();
  }

  private emptyAccount(): Account {
    return { accountNumber: '', accountType: '', balance: 0, currency: 'USD', status: 'Active', createdDate: '' };
  }

  private loadAccounts(): Account[] {
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
      { accountNumber: '1234567890', accountType: 'Checking', balance: 5250.50, currency: 'USD', status: 'Active', createdDate: '2024-01-15' },
      { accountNumber: '2345678901', accountType: 'Savings', balance: 12800.75, currency: 'USD', status: 'Active', createdDate: '2023-06-20' },
      { accountNumber: '3456789012', accountType: 'Checking', balance: 320.00, currency: 'USD', status: 'Suspended', createdDate: '2022-11-05' }
    ];
  }

  private persist(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
    }
  }
}
