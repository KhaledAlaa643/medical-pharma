import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferBalanceRoutingModule } from './transfer-balance-routing.module';
import { CreateTransferBalanceComponent } from './create-transfer-balance/create-transfer-balance.component';
import { TransferBalanceIndexComponent } from './transfer-balance-index/transfer-balance-index.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [CreateTransferBalanceComponent, TransferBalanceIndexComponent],
  imports: [
    CommonModule,
    TransferBalanceRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class TransferBalanceModule {}
