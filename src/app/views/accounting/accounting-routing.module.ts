import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupervisorClientsListComponent } from './supervisor-clients-list/supervisor-clients-list.component';
import { AddSupervisorClientListComponent } from './add-supervisor-client-list/add-supervisor-client-list.component';
import { ConsolidatedCustomerAccountStatementComponent } from './consolidated-customer-account-statement/consolidated-customer-account-statement.component';
import { CustomerAccountStatementComponent } from './customer-account-statement/customer-account-statement.component';
import { TodaysEarningsComponent } from './todays-earnings/todays-earnings.component';
import { LatePaymentsListComponent } from './late-payments-list/late-payments-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'accounting' },
  {
    path: 'supervisor-clients/list',
    component: SupervisorClientsListComponent,
  },
  {
    path: 'supervisor-clients/add',
    component: AddSupervisorClientListComponent,
  },
  {
    path: 'supervisor-clients/edit/:id',
    component: AddSupervisorClientListComponent,
  },
  {
    path: 'consolidated-customer-account-statement',
    component: ConsolidatedCustomerAccountStatementComponent,
  },
  {
    path: 'customer-account-statement',
    component: CustomerAccountStatementComponent,
  },
  {
    path: 'customer-account-statement/:id',
    component: CustomerAccountStatementComponent,
  },
  {
    path: 'todays-earnings',
    component: TodaysEarningsComponent,
  },
  {
    path: 'late-payments/list',
    component: LatePaymentsListComponent,
  },
  {
    path: 'safe',
    loadChildren: () => import('./safe/safe.module').then((m) => m.SafeModule),
  },
  {
    path: 'logbooks',
    loadChildren: () =>
      import('./logbooks/logbooks.module').then((m) => m.LogbooksModule),
  },
  {
    path: 'incentives-or-penalties',
    loadChildren: () =>
      import('./incentives-and-penalties/incentives-and-penalties.module').then(
        (m) => m.IncentivesAndPenaltiesModule
      ),
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
  },
  {
    path: 'cash-receipts',
    loadChildren: () =>
      import('./cash-receipts/cash-receipts.module').then(
        (m) => m.CashReceiptsModule
      ),
  },
  {
    path: 'accounting-safe',
    loadChildren: () =>
      import('./accounting-safe/accounting-safe.module').then(
        (m) => m.AccountingSafeModule
      ),
  },
  {
    path: 'cash-transfer',
    loadChildren: () =>
      import('./cash-transfer/cash-transfer.module').then(
        (m) => m.CashTransferModule
      ),
  },
  {
    path: 'cash-safe',
    loadChildren: () =>
      import('./cash-safe/cash-safe.module').then((m) => m.CashSafeModule),
  },
  {
    path: 'cash-payments',
    loadChildren: () =>
      import('./cash-payment/cash-payment.module').then(
        (m) => m.CashPaymentModule
      ),
  },
  {
    path: 'add-and-deduction-notice',
    loadChildren: () =>
      import('./add-and-deduction-notice/add-and-deduction-notice.module').then(
        (m) => m.AddAndDeductionNoticeModule
      ),
  },
  {
    path: 'deficit-and-surplus',
    loadChildren: () =>
      import('./deficit-and-surplus/deficit-and-surplus.module').then(
        (m) => m.DeficitAndSurplusModule
      ),
  },
  {
    path: 'transfer-balance',
    loadChildren: () =>
      import('./transfer-balance/transfer-balance.module').then(
        (m) => m.TransferBalanceModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountingRoutingModule {}
