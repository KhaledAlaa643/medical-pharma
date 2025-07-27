import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductMovementComponent } from '../product-movement/product-movement.component';
import { UnsettledComponent } from './unsettled/unsettled.component';








const routes: Routes = [
    { path: '', redirectTo: 'warehouse-settlement', pathMatch: 'full' },
    { path: 'unsettled', component: UnsettledComponent },
    { path: 'settled', component: UnsettledComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class WarehouseSettlementRoutingModule { }
