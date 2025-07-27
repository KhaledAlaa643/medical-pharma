import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePurchaseReturnsComponent } from './create-purchase-returns/create-purchase-returns.component';
import { Purchase_returnComponent } from './purchase_return/purchase_return.component';
import { ReturnOrdersListComponent } from './return-orders-list/return-orders-list.component';
import { ReturnProductsListComponent } from './return-products-list/return-products-list.component';
import { ReturnDetailsComponent } from './return-details/return-details.component';






const routes: Routes = [
    { path: 'search-purchases', component: CreatePurchaseReturnsComponent },
    { path: 'create/purchase-returns/:purchase_id', component: Purchase_returnComponent },
    { path: 'returns-list', component: ReturnOrdersListComponent },
    { path: 'products-list', component: ReturnProductsListComponent },
    { path: 'details/:return_id', component: ReturnDetailsComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class ReturnsRoutingModule { }
