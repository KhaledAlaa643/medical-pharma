import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateInventoryComponent } from '../purchase-inventory/create-inventory/create-inventory.component';
import { InventoredProductsComponent } from './inventored-products/inventored-products.component';
import { InventoredOrdersComponent } from './inventored-orders/inventored-orders.component';
import { InventoringOrdersComponent } from './inventoring-orders/inventoring-orders.component';
import { InventoringProductsComponent } from './inventoring-products/inventoring-products.component';
import { Inventory_listingComponent } from './inventory_listing/inventory_listing.component';







const routes: Routes = [
    { path: 'create', component: CreateInventoryComponent },
    { path: 'inventory_products', component: InventoredProductsComponent },
    { path: 'inventored_orders', component: InventoredOrdersComponent },
    { path: 'inventoring_orders', component: InventoringOrdersComponent },
    { path: 'inventoring_products/:id', component: InventoringProductsComponent },
    { path: 'inventoring_products', component: InventoringProductsComponent },
    { path: 'inventored_listing', component: Inventory_listingComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class PurchaseInventoryRoutingModule { }
