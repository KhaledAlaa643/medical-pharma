import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageWarehousesComponent } from './manage-warehouses.component';
import { ManageWarehousesRoutingModule } from './manage-warehouses.routing.module';
import { AddWarehouseComponent } from './add-warehouse/add-warehouse.component';
import { WarehousesListComponent } from './warehouses-list/warehouses-list.component';
import { SharedModuleModule } from "@modules/shared-module.module";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";


@NgModule({
  imports: [
    CommonModule,
    ManageWarehousesRoutingModule,
    SharedModuleModule,
    PrimNgModule
  ],
  declarations: [
    ManageWarehousesComponent,
    AddWarehouseComponent,
    WarehousesListComponent
  ]
})
export class ManageWarehousesModule { }
