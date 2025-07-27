import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashReceiptsRoutingModule } from './cash-receipts-routing.module';
import { CashReceiptsComponent } from './cash-receipts/cash-receipts.component';
import { CashReceiptsListComponent } from './cash-receipts-list/cash-receipts-list.component';
import { ShowCashReceiptComponent } from './show-cash-receipt/show-cash-receipt.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [
    CashReceiptsComponent,
    CashReceiptsListComponent,
    ShowCashReceiptComponent,
  ],
  imports: [
    CommonModule,
    CashReceiptsRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class CashReceiptsModule {}
