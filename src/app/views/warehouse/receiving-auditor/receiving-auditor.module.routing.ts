import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplyOrderListComponent } from './supply-order-list/supply-order-list.component';
import { AuditCompletedComponent } from './audit-completed/audit-completed.component';
import { ReturnsListComponent } from './returns-list/returns-list.component';
import { ReceivingCompletedComponent } from './receiving-completed/receiving-completed.component';
import { ProhibitedBatchComponent } from './prohibited-batch/prohibited-batch.component';
import { OperatingExpiryReportComponent } from './operating-expiry-report/operating-expiry-report.component';
import { SupplyOrderDetailsComponent } from './supply-order-details/supply-order-details.component';
import { ReturnsListDetailsComponent } from './returned-list-details/returns-list-details.component';
import { AuditCompletedDetailsComponent } from './audit-completed-details/audit-completed-details.component';







const routes: Routes = [
    { path: '', redirectTo: 'supply-order-list', pathMatch: 'full' },
    { path: 'supply-order-list', component: SupplyOrderListComponent }, //Todo Create a Different Component Here
    { path: 'supply-order-list/:warehouse_id/:id', component: SupplyOrderDetailsComponent },
    { path: 'audit-completed', component: AuditCompletedComponent },
    { path: 'audit-completed/:id', component: AuditCompletedDetailsComponent },
    { path: 'returns-list', component: ReturnsListComponent },
    { path: 'returns-list/:id', component: ReturnsListDetailsComponent },
    { path: 'receiving-completed', component: ReceivingCompletedComponent },
    { path: 'receiving-completed/:id', component: ReturnsListDetailsComponent },
    { path: 'prohibited-batch', component: ProhibitedBatchComponent },
    { path: 'operating-expiry-report', component: OperatingExpiryReportComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class ReceivingAuditorRoutingModule { }
