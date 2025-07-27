import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductionReportsComponent } from './productionReports/productionReports.component';
import { SalesManClientsComponent } from './Sales-man-clients/Sales-man-clients.component';
import { CreateClientListComponent } from './create-client-list/create-client-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'production-reports', pathMatch: 'full' },
  { path: 'production-reports', component: ProductionReportsComponent },
  {path:'sales-man-clients',component:SalesManClientsComponent},
  {path:'clients-list/edit/:id',component:CreateClientListComponent},
  {path:'clients-list/add',component:CreateClientListComponent}
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SalesTeamRoutingModule { }
