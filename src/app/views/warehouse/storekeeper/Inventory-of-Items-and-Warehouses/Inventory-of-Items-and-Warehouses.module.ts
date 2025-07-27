import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryOfItemsAndWarehousesComponent } from './Inventory-of-Items-and-Warehouses.component';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModuleModule } from '@modules/shared-module.module';
import { InventoryAndStockBalanceComponent } from './inventory-and-stock-balance/inventory-and-stock-balance.component';
import { InventoryOfItemsAndWarehousesRoutingModule } from './Inventory-of-Items-and-Warehouses.module.routing';
import { InventoryAndStockBalanceDetailsComponent } from './inventory-and-stock-balance-details/inventory-and-stock-balance-details.component';


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
    InventoryOfItemsAndWarehousesRoutingModule
  ],
  declarations: [
    InventoryOfItemsAndWarehousesComponent,
    InventoryAndStockBalanceComponent,
    InventoryAndStockBalanceDetailsComponent,

  ]
})
export class InventoryOfItemsAndWarehousesModule { }
