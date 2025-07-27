import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashReceiptsComponent } from './cash-receipts/cash-receipts.component';
import { CashReceiptsListComponent } from './cash-receipts-list/cash-receipts-list.component';
import { ShowCashReceiptComponent } from './show-cash-receipt/show-cash-receipt.component';

const routes: Routes = [
  { path: '', component: CashReceiptsComponent },
  { path: 'show/:id', component: ShowCashReceiptComponent },
  {
    path: 'list',
    component: CashReceiptsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashReceiptsRoutingModule {}
