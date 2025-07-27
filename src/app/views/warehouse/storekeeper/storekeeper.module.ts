import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorekeeperComponent } from './storekeeper.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { SharedModule } from 'primeng/api';
import { storekeeperRoutingModule } from './storekeeper.routing.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WarehouseSettlementModule } from './warehouse-settlement/warehouse-settlement.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryOfItemsAndWarehousesModule } from './Inventory-of-Items-and-Warehouses/Inventory-of-Items-and-Warehouses.module';
import { ProductMovementModule } from './product-movement/product-movement.module';
import { WarehouseTransfersModule } from './warehouse-transfers/warehouse-transfers.module';
import { EditOperationModule } from './edit-operation/edit-operation.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModuleModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    WarehouseSettlementModule,
    storekeeperRoutingModule,
    InventoryModule,
    InventoryOfItemsAndWarehousesModule,
    ProductMovementModule,
    WarehouseTransfersModule,
    EditOperationModule,
  ],
  declarations: [StorekeeperComponent]
})
export class StorekeeperModule { }
