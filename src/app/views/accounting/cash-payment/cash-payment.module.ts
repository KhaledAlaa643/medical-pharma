import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashPaymentRoutingModule } from './cash-payment-routing.module';
import { CreateCashPaymentComponent } from './create-cash-payment/create-cash-payment.component';
import { ListCashPaymentComponent } from './list-cash-payment/list-cash-payment.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [CreateCashPaymentComponent, ListCashPaymentComponent],
  imports: [
    CommonModule,
    CashPaymentRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class CashPaymentModule {}
