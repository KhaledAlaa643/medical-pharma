import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { CreateAccountsComponent } from './create-accounts/create-accounts.component';
import { AccountsTypeComponent } from './accounts-type/accounts-type.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [CreateAccountsComponent, AccountsTypeComponent],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class AccountsModule {}
