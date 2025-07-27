import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProhibitedExpirationsComponent } from './prohibited-expirations/prohibited-expirations.component';
import { EditOperationsComponent } from './edit-operations/edit-operations.component';
import { EditedOperationsComponent } from './edited-operations/edited-operations.component';
import { ExpirationsAndOperationsReportsComponent } from './expirations-and-operations-reports/expirations-and-operations-reports.component';






const routes: Routes = [
    { path: 'prohibited-expirations', component: ProhibitedExpirationsComponent },
    { path: 'edit-operation', component: EditOperationsComponent },
    { path: 'edited-operations', component: EditedOperationsComponent },
    { path: 'reports', component: ExpirationsAndOperationsReportsComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class ExpirationsAndOperationsRoutingModule { }
