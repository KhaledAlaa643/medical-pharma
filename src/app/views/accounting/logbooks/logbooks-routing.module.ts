import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogbooksArchiveComponent } from './logbooks-archive/logbooks-archive.component';
import { LogbookDeliveryRecordComponent } from './logbook-delivery-record/logbook-delivery-record.component';
import { LogbookReceivingRecordComponent } from './logbook-receiving-record/logbook-receiving-record.component';
import { DeliverLogbooksComponent } from './deliver-logbooks/deliver-logbooks.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'archive',
    pathMatch: 'full',
  },
  { path: 'archive', component: LogbooksArchiveComponent },
  { path: 'submit-delivery', component: LogbookDeliveryRecordComponent },
  { path: 'receiving', component: LogbookReceivingRecordComponent },
  { path: 'deliver', component: DeliverLogbooksComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogbooksRoutingModule {}
