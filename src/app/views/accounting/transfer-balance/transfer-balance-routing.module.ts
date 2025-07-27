import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferBalanceIndexComponent } from './transfer-balance-index/transfer-balance-index.component';
import { CreateTransferBalanceComponent } from './create-transfer-balance/create-transfer-balance.component';

const routes: Routes = [
  { path: '', component: TransferBalanceIndexComponent },
  { path: 'create', component: CreateTransferBalanceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferBalanceRoutingModule {}
