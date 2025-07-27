import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountingSafeRoutingModule } from './accounting-safe-routing.module';
import { AccountingSafeComponent } from './accounting-safe/accounting-safe.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomSharedModule } from 'app/core/shared/shared-module';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [AccountingSafeComponent],
  imports: [
    CommonModule,
    AccountingSafeRoutingModule,
    PrimNgModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    RouterModule,
    CustomSharedModule,
    TableModule,
    CalendarModule,
    HttpClientModule,
    SharedModuleModule,
    SharedModule,
  ],
})
export class AccountingSafeModule {}
