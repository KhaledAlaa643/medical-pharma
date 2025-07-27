import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashSafeRoutingModule } from './cash-safe-routing.module';
import { CashSafeComponent } from './cash-safe.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { CustomSharedModule } from 'app/core/shared/shared-module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [CashSafeComponent],
  imports: [
    CommonModule,
    CashSafeRoutingModule,
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
export class CashSafeModule {}
