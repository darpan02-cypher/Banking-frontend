import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Account, AccountType } from '../../services/account.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css'
})
export class AccountDetailsComponent implements OnInit {
  private readonly accountService = inject(AccountService);

  protected accounts: Account[] = [];
  protected readonly editingNumber = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);

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

  save(account: Account): void {
    this.accountService.updateAccount(account.accNo, { accPin: account.accPin, accountType: account.accountType }).subscribe({
      next: () => this.editingNumber.set(null),
      error: () => this.errorMessage.set('Failed to update account.')
    });
  }

  cancel(): void {
    this.editingNumber.set(null);
    this.loadAccounts();
  }

  delete(accNo: string): void {
    this.accountService.deleteAccount(accNo).subscribe({
      next: () => this.accounts = this.accounts.filter(a => a.accNo !== accNo),
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
      },
      error: () => this.errorMessage.set('Failed to create account. Check that the customer ID exists.')
    });
  }

  private emptyAccount(): { customerId: number | null; accPin: string; accountType: AccountType } {
    return { customerId: null, accPin: '', accountType: 'SAVINGS' };
  }
}
