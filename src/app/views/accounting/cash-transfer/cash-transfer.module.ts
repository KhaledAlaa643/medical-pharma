import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashTransferRoutingModule } from './cash-transfer-routing.module';
import { RegisterCashTransferComponent } from './register-cash-transfer/register-cash-transfer.component';
import { TransferFromAccountingSafeComponent } from './transfer-from-accounting-safe/transfer-from-accounting-safe.component';
import { TransactionsListComponent } from './transactions-list/transactions-list.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [
    RegisterCashTransferComponent,
    TransferFromAccountingSafeComponent,
    TransactionsListComponent,
  ],
  imports: [
    CommonModule,
    CashTransferRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class CashTransferModule {}
