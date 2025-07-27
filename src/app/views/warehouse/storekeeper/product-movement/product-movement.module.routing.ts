import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductMovementComponent } from '../product-movement/product-movement.component';








const routes: Routes = [
    { path: '', redirectTo: 'product-movement', pathMatch: 'full' },
    { path: 'product-movement', component: ProductMovementComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class ProductMovementRoutingModule { }
