import { Routes } from '@angular/router';
import { CustomerDetailsComponent } from './components/customer-details/customer-details';
import { AccountDetailsComponent } from './components/account-details/account-details';

export const routes: Routes = [
  { path: '', redirectTo: 'customer-details', pathMatch: 'full' },
  { path: 'customer-details', component: CustomerDetailsComponent },
  { path: 'account-details', component: AccountDetailsComponent }
];
