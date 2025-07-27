import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModuleModule } from '@modules/shared-module.module';


import { TransferBetweenWarehousesComponent } from './transfer-between-warehouses/transfer-between-warehouses.component';
import { WarehouseTransfersRoutingModule } from './warehouse-transfers.module.routing';
import { TransferredProductBasedComponent } from './transferred-product-based/transferred-product-based.component';
import { TransferredOrderBasedComponent } from './transferred-order-based/transferred-order-based.component';



@NgModule({
  imports: [
    CommonModule,
    PrimNgModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    CheckboxModule,
    SharedModuleModule,
    WarehouseTransfersRoutingModule
  ],
  declarations: [

    TransferBetweenWarehousesComponent,
    TransferredProductBasedComponent,
    TransferredOrderBasedComponent
  ]
})
export class WarehouseTransfersModule { }
