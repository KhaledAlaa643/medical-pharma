import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TransferBetweenWarehousesComponent } from './transfer-between-warehouses/transfer-between-warehouses.component';

import { TransferredOrderBasedComponent } from './transferred-order-based/transferred-order-based.component';
import { TransferredProductBasedComponent } from './transferred-product-based/transferred-product-based.component';








const routes: Routes = [
    { path: '', redirectTo: 'transfer-between-warehouses', pathMatch: 'full' },

    { path: 'transfer-between-warehouses', component: TransferBetweenWarehousesComponent },
    { path: 'transferred-product-based/:transfer_id', component: TransferredProductBasedComponent },
    { path: 'transferred-product-based', component: TransferredProductBasedComponent },
    { path: 'transferred-order-based', component: TransferredOrderBasedComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class WarehouseTransfersRoutingModule { }
