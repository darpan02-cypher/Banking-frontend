import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Account, AccountType } from '../../services/account.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css'
})
export class AccountDetailsComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly customerService = inject(CustomerService);

  protected accounts: Account[] = [];
  protected readonly editingNumber = signal<string | null>(null);
  protected readonly newPinVisible = signal(false);
  protected readonly visibleAccountPin = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  protected newAccount: { customerId: number | null; accPin: string; accountType: AccountType } = this.emptyAccount();

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: accounts => this.accounts = accounts,
      error: () => this.errorMessage.set('Failed to load accounts. Is the backend running on http://localhost:8083?')
    });
  }

  isEditing(accNo: string): boolean {
    return this.editingNumber() === accNo;
  }

  edit(accNo: string): void {
    this.editingNumber.set(accNo);
  }

  toggleNewPin(): void {
    this.newPinVisible.update(visible => !visible);
  }

  toggleAccountPin(accNo: string): void {
    this.visibleAccountPin.update(visibleAccNo => visibleAccNo === accNo ? null : accNo);
  }

  save(account: Account): void {
    this.accountService.updateAccount(account.accNo, { accPin: account.accPin, accountType: account.accountType }).subscribe({
      next: () => {
        this.editingNumber.set(null);
        this.successMessage.set('Account saved successfully.');
      },
      error: () => this.errorMessage.set('Failed to update account.')
    });
  }

  cancel(): void {
    this.editingNumber.set(null);
    this.loadAccounts();
  }

  delete(accNo: string): void {
    const account = this.accounts.find(item => item.accNo === accNo);
    if (!account?.customerId) {
      this.errorMessage.set('Account customer not found.');
      return;
    }
    this.customerService.deleteAccountFromCustomer(account.customerId, accNo).subscribe({
      next: () => {
        this.accounts = this.accounts.filter(a => a.accNo !== accNo);
        this.successMessage.set('Account deleted successfully.');
      },
      error: () => this.errorMessage.set('Failed to delete account.')
    });
  }

  addAccount(): void {
    if (!this.newAccount.customerId || !this.newAccount.accPin) {
      return;
    }
    this.accountService.createAccountForCustomer(this.newAccount.customerId, {
      accPin: this.newAccount.accPin,
      accountType: this.newAccount.accountType
    }).subscribe({
      next: created => {
        this.accounts = [...this.accounts, created];
        this.newAccount = this.emptyAccount();
        this.successMessage.set('Account added successfully.');
      },
      error: () => this.errorMessage.set('Failed to create account. Check that the customer ID exists.')
    });
  }

  private emptyAccount(): { customerId: number | null; accPin: string; accountType: AccountType } {
    return { customerId: null, accPin: '', accountType: 'SAVINGS' };
  }
}
