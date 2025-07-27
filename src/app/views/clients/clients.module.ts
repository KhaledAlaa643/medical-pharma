import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsComponent } from './clients.component';


import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';
import { CustomSharedModule } from 'app/core/shared/shared-module';
import { ClientsRoutingModule } from './clients.routing.module';
import { TransactionVolumeCashComponent } from './transaction-volume-cash/transaction-volume-cash.component';
import { AddSubClientComponent } from './Add-sub-client/Add-sub-client.component';
import { AddClientComponent } from './add-client/add-client.component';
import { EditClientInfoComponent } from './edit-client-info/edit-client-info.component';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar'
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModuleModule } from '@modules/shared-module.module';
import { SharedModule } from 'primeng/api';
import { TableComponentComponent } from '@modules/table-component/table-component.component';
import { TransactionVolumeReportsComponent } from './transaction-volume-reports/transaction-volume-reports.component';
import { ClientsListComponent } from './clients-list/clients-list.component';





@NgModule({
  imports: [
    CommonModule,
    ClientsRoutingModule,
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
    SharedModule

  ],
  declarations: [
    ClientsComponent,
    TransactionVolumeCashComponent,
    TableComponentComponent,
    TransactionVolumeReportsComponent,
    ClientsListComponent,
    AddClientComponent,
    EditClientInfoComponent,
    AddSubClientComponent,
  ]
})
export class ClientsModule { }
