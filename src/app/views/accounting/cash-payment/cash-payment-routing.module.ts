import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCashPaymentComponent } from './list-cash-payment/list-cash-payment.component';
import { CreateCashPaymentComponent } from './create-cash-payment/create-cash-payment.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ListCashPaymentComponent },
  { path: 'create', component: CreateCashPaymentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashPaymentRoutingModule {}
