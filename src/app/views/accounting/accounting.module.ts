import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingRoutingModule } from './accounting-routing.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { SharedModule } from 'primeng/api';
import { AccountingComponent } from './accounting.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { LayoutModule } from '../layout/layout.module';
import { SupervisorClientsListComponent } from './supervisor-clients-list/supervisor-clients-list.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { AddSupervisorClientListComponent } from './add-supervisor-client-list/add-supervisor-client-list.component';
import { ConsolidatedCustomerAccountStatementComponent } from './consolidated-customer-account-statement/consolidated-customer-account-statement.component';
import { CustomerAccountStatementComponent } from './customer-account-statement/customer-account-statement.component';
import { TodaysEarningsComponent } from './todays-earnings/todays-earnings.component';
import { LatePaymentsListComponent } from './late-payments-list/late-payments-list.component';

@NgModule({
  declarations: [
    AccountingComponent,
    SupervisorClientsListComponent,
    AddSupervisorClientListComponent,
    ConsolidatedCustomerAccountStatementComponent,
    CustomerAccountStatementComponent,
    TodaysEarningsComponent,
    LatePaymentsListComponent,
  ],
  imports: [
    CommonModule,
    AccountingRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class AccountingModule {}
