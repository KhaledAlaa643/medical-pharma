import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddAndDeductionNoticeRoutingModule } from './add-and-deduction-notice-routing.module';
import { AddAndDeductionNoticeListComponent } from './add-and-deduction-notice-list/add-and-deduction-notice-list.component';
import { CreateAddNoticeComponent } from './create-add-notice/create-add-notice.component';
import { CreateDeductionNoticeComponent } from './create-deduction-notice/create-deduction-notice.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [
    AddAndDeductionNoticeListComponent,
    CreateAddNoticeComponent,
    CreateDeductionNoticeComponent,
  ],
  imports: [
    CommonModule,
    AddAndDeductionNoticeRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class AddAndDeductionNoticeModule {}
