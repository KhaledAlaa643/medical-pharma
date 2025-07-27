import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionsListComponent } from './transactions-list/transactions-list.component';
import { RegisterCashTransferComponent } from './register-cash-transfer/register-cash-transfer.component';
import { TransferFromAccountingSafeComponent } from './transfer-from-accounting-safe/transfer-from-accounting-safe.component';

const routes: Routes = [
  { path: '', redirectTo: 'transaction-list', pathMatch: 'full' },
  { path: 'transaction-list', component: TransactionsListComponent },
  {
    path: 'transfer-from-accounting-safe',
    component: TransferFromAccountingSafeComponent,
  },
  { path: 'register-transaction', component: RegisterCashTransferComponent },
  { path: 'edit/:id', component: RegisterCashTransferComponent },
  {
    path: 'transaction-from-accounting-safe',
    component: TransferFromAccountingSafeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashTransferRoutingModule {}
