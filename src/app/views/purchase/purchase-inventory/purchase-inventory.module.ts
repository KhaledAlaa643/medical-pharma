import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseInventoryComponent } from './purchase-inventory.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PurchaseInventoryRoutingModule } from './purchase-inventory.routing.module';
import { CreateInventoryComponent } from './create-inventory/create-inventory.component';
import { InventoredProductsComponent } from './inventored-products/inventored-products.component';
import { InventoredOrdersComponent } from './inventored-orders/inventored-orders.component';
import { InventoringOrdersComponent } from './inventoring-orders/inventoring-orders.component';
import { InventoringProductsComponent } from './inventoring-products/inventoring-products.component';
import { Inventory_listingComponent } from './inventory_listing/inventory_listing.component';

@NgModule({
  imports: [
    CommonModule,
    PurchaseInventoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModuleModule,
    PrimNgModule,
    LayoutModule
  ],
  declarations: [
    PurchaseInventoryComponent,
    CreateInventoryComponent,
    InventoredProductsComponent,
    InventoredOrdersComponent,
    InventoringOrdersComponent,
    InventoringProductsComponent,
    Inventory_listingComponent

  ]
})
export class PurchaseInventoryModule { }
