import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory.component';
import { InventoryRoutingModule } from './inventory.routing.module';
import { WarehouseInventoryComponent } from './warehouse-inventory/warehouse-inventory.component';
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
  imports: [
    CommonModule,
    InventoryRoutingModule,
    PrimNgModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    InventoryComponent,
    WarehouseInventoryComponent
  ]
})
export class InventoryModule { }
