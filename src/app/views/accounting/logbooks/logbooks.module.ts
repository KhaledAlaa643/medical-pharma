import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogbooksRoutingModule } from './logbooks-routing.module';
import { LogbooksArchiveComponent } from './logbooks-archive/logbooks-archive.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { DeliverLogbooksComponent } from './deliver-logbooks/deliver-logbooks.component';
import { LogbookDeliveryRecordComponent } from './logbook-delivery-record/logbook-delivery-record.component';
import { LogbookReceivingRecordComponent } from './logbook-receiving-record/logbook-receiving-record.component';

@NgModule({
  declarations: [LogbooksArchiveComponent, DeliverLogbooksComponent, LogbookDeliveryRecordComponent, LogbookReceivingRecordComponent],
  imports: [
    CommonModule,
    LogbooksRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class LogbooksModule {}
