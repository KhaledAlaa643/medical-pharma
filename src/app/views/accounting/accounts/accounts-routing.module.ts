import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsTypeComponent } from './accounts-type/accounts-type.component';
import { CreateAccountsComponent } from './create-accounts/create-accounts.component';

const routes: Routes = [
  { path: '', redirectTo: 'accounts-type', pathMatch: 'full' },
  { path: 'accounts-type', component: AccountsTypeComponent },
  { path: 'create-account', component: CreateAccountsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
