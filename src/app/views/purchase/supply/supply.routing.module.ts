import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductLinkingComponent } from './product-linking/product-linking.component';
import { LinkedFilesComponent } from './linked-files/linked-files.component';
import { UnregisteredProductsComponent } from './unregistered-products/unregistered-products.component';
import { SupplyRequestComponent } from './supply-request/supply-request.component';
import { SupplyRequestDetailsComponent } from './supply-request-details/supply-request-details.component';
import { SupplyRequestEditComponent } from './supply-request-edit/supply-request-edit.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { SuppliersListComponent } from './suppliers-list/suppliers-list.component';
import { SupplierAccountStatementComponent } from './supplier-account-statement/supplier-account-statement.component';
import { SuppliersGroupedAccountStatementComponent } from './suppliers-grouped-account-statement/suppliers-grouped-account-statement.component';
import { CombinedSupplyRequestComponent } from './combined-supply-request/combined-supply-request.component';





const routes: Routes = [
    { path: 'manage/product-linking', component: ProductLinkingComponent },
    { path: 'manage/product-linking/:file_id', component: ProductLinkingComponent },
    { path: 'manage/linked_files', component: LinkedFilesComponent },
    { path: 'manage/unregistered-products', component: UnregisteredProductsComponent },
    { path: 'create/supply-request', component: SupplyRequestComponent },
    { path: 'create/combined-supply-request', component: CombinedSupplyRequestComponent },
    { path: 'edit/:id/supply-request', component: SupplyRequestComponent },
    { path: 'edit/supply-request/:id', component: SupplyRequestEditComponent },
    { path: 'view/supply-request/:id', component: SupplyRequestDetailsComponent },
    { path: 'add/supplier', component: AddSupplierComponent },
    { path: 'edit/supplier/:id', component: AddSupplierComponent },
    { path: 'suppliers', component: SuppliersListComponent },
    { path: 'account-statement', component: SupplierAccountStatementComponent },
    { path: 'account-statement/:id', component: SupplierAccountStatementComponent },
    { path: 'grouped-account-statement', component: SuppliersGroupedAccountStatementComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class SupplyRoutingModule { }
