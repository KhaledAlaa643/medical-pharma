import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionVolumeCashComponent } from './transaction-volume-cash/transaction-volume-cash.component';
import { TransactionVolumeReportsComponent } from './transaction-volume-reports/transaction-volume-reports.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { AddClientComponent } from './add-client/add-client.component';
import { EditClientInfoComponent } from './edit-client-info/edit-client-info.component';
import { AddSubClientComponent } from './Add-sub-client/Add-sub-client.component';

const routes: Routes = [
  {
    path: 'transaction-volume-cash',
    component: TransactionVolumeCashComponent,
  },
  {
    path: 'transaction-volume-cash/:id',
    component: TransactionVolumeCashComponent,
  },
  {
    path: 'supplier-transaction-volume-cash',
    component: TransactionVolumeCashComponent,
  },
  {
    path: 'supplier-interaction-volume',
    component: TransactionVolumeCashComponent,
  },
  {
    path: 'transaction-volume-reports',
    component: TransactionVolumeReportsComponent,
  },
  { path: 'clients-list', component: ClientsListComponent },
  { path: 'Add-client/group', component: AddClientComponent },
  { path: 'Add-client/pharmacy', component: AddClientComponent },
  { path: 'Add-client/sales', component: AddClientComponent },
  { path: 'edit-client-info', component: EditClientInfoComponent },
  { path: 'add-sub-client', component: AddSubClientComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}
