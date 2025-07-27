import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterNewComponent } from './register-new/register-new.component';
import { TransfersProductsComponent } from './transfers-products/transfers-products.component';
import { TransferredOrderBasedComponent } from '@modules/storekeeper/warehouse-transfers/transferred-order-based/transferred-order-based.component';
import { TransfersOrdersComponent } from './transfers-orders/transfers-orders.component';






const routes: Routes = [
    { path: 'register', component: RegisterNewComponent },
    { path: 'transferd-products', component: TransfersProductsComponent },
    { path: 'transferd-products/:transfer_id', component: TransfersProductsComponent },
    { path: 'transferd-orders', component: TransfersOrdersComponent },
];
 
@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class WarehousesTransfersRoutingModule { }
